import Web3 from 'web3';

import { AP, APTypes, Order } from '../src';

// @ts-ignore
import DefaultTerms from './DefaultTerms.json';


export function getAssetIdFromOrderData(orderData: APTypes.OrderData): string {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
      ['bytes', 'bytes'],
      [orderData.creatorSignature, orderData.counterpartySignature]
    )
  );
}

export async function getDefaultOrderParams (): Promise<APTypes.OrderParams> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  const creator = (await web3.eth.getAccounts())[0];
  const counterparty = (await web3.eth.getAccounts())[1];
  const ap = await AP.init(web3, creator);
  const terms: APTypes.Terms = DefaultTerms;

  return {
    termsHash: ap.utils.getTermsHash(terms),
    productId: ap.utils.toHex('Some Product'),
    customTerms: ap.utils.toCustomTerms(terms),
    ownership: {
      creatorObligor: creator,
      creatorBeneficiary: creator,
      counterpartyObligor: counterparty,
      counterpartyBeneficiary: counterparty
    },
    expirationDate: String(terms.contractDealDate),
    engine: ap.contracts.pamEngine.options.address,
    enhancement_1: {
      termsHash: ap.utils.ZERO_BYTES32,
      productId: ap.utils.ZERO_BYTES32,
      customTerms: ap.utils.toCustomTerms(terms), // arbitrary customTerms
      ownership: {
        creatorObligor: ap.utils.ZERO_ADDRESS,
        creatorBeneficiary: ap.utils.ZERO_ADDRESS,
        counterpartyObligor: ap.utils.ZERO_ADDRESS,
        counterpartyBeneficiary: ap.utils.ZERO_ADDRESS
      },
      engine: ap.utils.ZERO_ADDRESS
    },
    enhancement_2: {
      termsHash: ap.utils.ZERO_BYTES32,
      productId: ap.utils.ZERO_BYTES32,
      customTerms: ap.utils.toCustomTerms(terms), // arbitrary customTerms
      ownership: {
        creatorObligor: ap.utils.ZERO_ADDRESS,
        creatorBeneficiary: ap.utils.ZERO_ADDRESS,
        counterpartyObligor: ap.utils.ZERO_ADDRESS,
        counterpartyBeneficiary: ap.utils.ZERO_ADDRESS
      },
      engine: ap.utils.ZERO_ADDRESS
    }
  }
}

export async function getDefaultSignedOrder (): Promise<APTypes.OrderData> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  const creator = (await web3.eth.getAccounts())[0];
  const counterparty = (await web3.eth.getAccounts())[1];
  const apRC = await AP.init(web3, creator);
  const apCP = await AP.init(web3, counterparty);

  const orderParams = await getDefaultOrderParams();
  const orderRC = Order.create(apRC, orderParams);
  await orderRC.signOrder();

  const orderCP = await Order.load(apCP, orderRC.serializeOrder());
  await orderCP.signOrder();

  return orderCP.serializeOrder();
}
