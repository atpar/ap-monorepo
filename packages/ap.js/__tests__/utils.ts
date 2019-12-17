import Web3 from 'web3';

const ERC20SampleTokenArtifact = require('@atpar/ap-contracts/artifacts/ERC20SampleToken.min.json');

import { AP, APTypes, Order } from '../src';

// @ts-ignore
import DefaultTerms from './DefaultTerms.json';
import { Terms } from '../src/types';


export function getAssetIdFromOrderData(orderData: APTypes.OrderData): string {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ['bytes', 'bytes'],
      [orderData.creatorSignature, orderData.counterpartySignature]
    )
  );
}

export async function getDefaultTerms (): Promise<Terms> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  const account = (await web3.eth.getAccounts())[0];

  let sampleToken = new web3.eth.Contract(ERC20SampleTokenArtifact.abi);
  sampleToken = await sampleToken.deploy({ data: ERC20SampleTokenArtifact.bytecode }).send({ from: account, gas: 2000000 });

  const terms: Terms = DefaultTerms;
  terms.currency = sampleToken.options.address;
  terms.settlementCurrency = sampleToken.options.address;

  return terms;
}

export async function getDefaultOrderParams (productId: string): Promise<APTypes.OrderParams> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  const creator = (await web3.eth.getAccounts())[0];
  const counterparty = (await web3.eth.getAccounts())[1];
  const ap = await AP.init(web3, creator);
  const terms: APTypes.Terms = await getDefaultTerms();

  return {
    termsHash: ap.utils.erc712.getTermsHash(terms),
    productId: productId,
    customTerms: ap.utils.convert.toCustomTerms(terms),
    ownership: {
      creatorObligor: creator,
      creatorBeneficiary: creator,
      counterpartyObligor: counterparty,
      counterpartyBeneficiary: counterparty
    },
    expirationDate: String(terms.contractDealDate),
    engine: ap.contracts.pamEngine.options.address,
    enhancement_1: {
      termsHash: ap.utils.constants.ZERO_BYTES32,
      productId: ap.utils.constants.ZERO_BYTES32,
      customTerms: ap.utils.convert.toCustomTerms(terms), // arbitrary customTerms
      ownership: {
        creatorObligor: ap.utils.constants.ZERO_ADDRESS,
        creatorBeneficiary: ap.utils.constants.ZERO_ADDRESS,
        counterpartyObligor: ap.utils.constants.ZERO_ADDRESS,
        counterpartyBeneficiary: ap.utils.constants.ZERO_ADDRESS
      },
      engine: ap.utils.constants.ZERO_ADDRESS
    },
    enhancement_2: {
      termsHash: ap.utils.constants.ZERO_BYTES32,
      productId: ap.utils.constants.ZERO_BYTES32,
      customTerms: ap.utils.convert.toCustomTerms(terms), // arbitrary customTerms
      ownership: {
        creatorObligor: ap.utils.constants.ZERO_ADDRESS,
        creatorBeneficiary: ap.utils.constants.ZERO_ADDRESS,
        counterpartyObligor: ap.utils.constants.ZERO_ADDRESS,
        counterpartyBeneficiary: ap.utils.constants.ZERO_ADDRESS
      },
      engine: ap.utils.constants.ZERO_ADDRESS
    }
  }
}

export async function getDefaultSignedOrder (productId: string): Promise<APTypes.OrderData> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  const creator = (await web3.eth.getAccounts())[0];
  const counterparty = (await web3.eth.getAccounts())[1];
  const apRC = await AP.init(web3, creator);
  const apCP = await AP.init(web3, counterparty);

  const orderParams = await getDefaultOrderParams(productId);
  const orderRC = Order.create(apRC, orderParams);
  await orderRC.signOrder();

  const orderCP = await Order.load(apCP, orderRC.serializeOrder());
  await orderCP.signOrder();

  return orderCP.serializeOrder();
}

export async function issueDefaultAsset (): Promise<string> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  const account = (await web3.eth.getAccounts())[0];
  const ap = await AP.init(web3, account);

  const terms = await getDefaultTerms();
  const productTerms = ap.utils.convert.toProductTerms(terms);
  const productSchedules = await ap.utils.schedule.generateProductSchedule(ap.contracts.pamEngine, terms);
  const productId = ap.utils.erc712.deriveProductId(productTerms, productSchedules);
  const storedProductTerms = await ap.contracts.productRegistry.methods.getProductTerms(web3.utils.toHex(productId)).call();
  
  if (String(storedProductTerms.maturityDateOffset) === '0') {
    await ap.contracts.productRegistry.methods.registerProduct(
      productTerms,
      productSchedules
    ).send({ from: account, gas: 2000000 });
  }

  const order = await Order.load(ap, await getDefaultSignedOrder(productId));
  await order.issueAssetFromOrder();
  
  return getAssetIdFromOrderData(order.serializeOrder());
}
