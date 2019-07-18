import Web3 from 'web3';
import fetch from 'cross-fetch';

import { AP, Order } from '../src';
import { ContractTerms, ContractType, OrderParams, OrderData } from '../src/types';


describe('OrderClass', () => {

  let contractTemplatesTyped: any;

  let web3: Web3;
  let apRC: AP;
  let apCP: AP;
  let recordCreator: string;
  let counterparty: string;

  let orderData: OrderData;
  let receivedNewAsset: boolean = false;


  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    const response = await fetch('http://localhost:9000' + '/api/terms', {});
    const contractTemplates = await response.json();
    contractTemplatesTyped = {};

    (<any>Object).keys(contractTemplates).map((key: string) => {
      const typedContractTerms: ContractTerms = (<ContractTerms>(<any>contractTemplates)[key]);
      typedContractTerms.contractType = ContractType.PAM;
      (<any>contractTemplatesTyped)[key] = typedContractTerms;
    });

    apRC = await AP.init(web3, recordCreator);
    apCP = await AP.init(web3, counterparty);

    apCP.onNewAssetIssued(async () => {
      receivedNewAsset = true;
    });
  });

  it('should create a order instance', async () => {
    const terms: ContractTerms = (<any>contractTemplatesTyped)['10001'];

    const orderParams: OrderParams = {
      makerAddress: recordCreator,
      terms,
      makerCreditEnhancementAddress: '0x0000000000000000000000000000000000000000'
    }

    const order = Order.create(apRC, orderParams);
    await order.signOrder();

    orderData = order.serializeOrder();
  });

  it('should verify and sign order on behalf of the counterparty', async () => {
    const order = Order.load(apCP, orderData);

    await order.signOrder();
  });

  it('should fill co-signed order', async () => {
    const order = Order.load(apRC, orderData);

    await order.issueAssetFromOrder();

    await new Promise(resolve => setTimeout(resolve, 2500)); // poll frequency set to 2s
  });

  it('should receive a new issued asset via listener', async () => {
    expect(receivedNewAsset).toBe(true);
  });

  it('should retrieve one or more assetIds from issued assets', async () => {
    const assetIds = await apCP.getAssetIds();
    expect(assetIds.length > 0).toBe(true);
  });
});
