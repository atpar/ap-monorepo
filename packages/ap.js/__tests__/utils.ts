import Web3 from 'web3';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const SettlementToken = require('@atpar/ap-contracts/artifacts/SettlementToken.min.json');

import { AP, APTypes, Order, Template } from '../src';

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

  let sampleToken = new web3.eth.Contract(SettlementToken.abi);
  sampleToken = await sampleToken.deploy({ data: SettlementToken.bytecode }).send({ from: account, gas: 2000000 });

  const terms: Terms = DefaultTerms;
  terms.currency = sampleToken.options.address;
  terms.settlementCurrency = sampleToken.options.address;

  return terms;
}

export async function getDefaultOrderParams (templateId: string): Promise<APTypes.OrderParams> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  const creator = (await web3.eth.getAccounts())[0];
  const counterparty = (await web3.eth.getAccounts())[1];
  const ap = await AP.init(web3, creator);
  const terms: APTypes.Terms = await getDefaultTerms();

  return {
    termsHash: ap.utils.erc712.getTermsHash(terms),
    templateId: templateId,
    customTerms: ap.utils.conversion.deriveCustomTerms(terms),
    ownership: {
      creatorObligor: creator,
      creatorBeneficiary: creator,
      counterpartyObligor: counterparty,
      counterpartyBeneficiary: counterparty
    },
    expirationDate: String(terms.contractDealDate),
    engine: ap.contracts.pamEngine.options.address
  }
}

export async function getDefaultSignedOrder (templateId: string): Promise<APTypes.OrderData> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));
  const creator = (await web3.eth.getAccounts())[0];
  const counterparty = (await web3.eth.getAccounts())[1];
  const apRC = await AP.init(web3, creator);
  const apCP = await AP.init(web3, counterparty);

  const orderParams = await getDefaultOrderParams(templateId);
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
  const extendedTemplateTerms = ap.utils.conversion.deriveExtendedTemplateTermsFromTerms(await getDefaultTerms());

  let templateId;

  // for second runs, if template is already registered
  try {
    const template = await Template.create(ap, extendedTemplateTerms);
    templateId = template.templateId;
  } catch (error) {
    const template = await Template.loadFromExtendedTemplateTerms(ap, extendedTemplateTerms);
    templateId = template.templateId;
  }

  const order = await Order.load(ap, await getDefaultSignedOrder(templateId));
  await order.issueAssetFromOrder();
  
  return getAssetIdFromOrderData(order.serializeOrder());
}

export async function jumpToBlockTime (blockTimestamp: string | number): Promise<void> {
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'));

  return new Promise((resolve, reject): void =>  {
    // @ts-ignore
    web3.currentProvider.send({ 
      jsonrpc: '2.0', 
      method: 'evm_mine', 
      params: [String(blockTimestamp)], 
      id: new Date().getSeconds()
    }, async (err: any, res: any): Promise<void> => {
      // console.log('res: ' + JSON.stringify(res), 'error: ' + JSON.stringify(err));
      if (err) { reject(err); }
      return resolve(res);
    });
  });
}
