import Web3 from 'web3';

import { AP, Order, Asset } from '../../src';
import { getDefaultSignedOrder, getAssetIdFromOrderData } from '../orderUtils';


describe('Asset', () => {

  let web3: Web3;
  let creator: string;
  let counterparty: string;

  let apRC: AP;
  let apCP: AP;


  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    creator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    apRC = await AP.init(web3, creator);
    apCP = await AP.init(web3, counterparty);
  });

  it('should load Asset from registries for counterparty', async () => {
    const order = await Order.load(apRC, await getDefaultSignedOrder());
    await order.issueAssetFromOrder();
    const assetId = getAssetIdFromOrderData(order.serializeOrder());

    const assetRC = await Asset.load(apRC, assetId);
    const assetCP = await Asset.load(apCP, assetId);

    const storedOwnershipRC = await assetRC.getOwnership();
    const storedTermsRC = await assetRC.getTerms();
    const storedOwnershipCP = await assetCP.getOwnership();
    const storedTermsCP = await assetCP.getTerms();

    expect(assetCP instanceof Asset).toBe(true);
    expect(storedOwnershipCP).toStrictEqual(storedOwnershipRC);
    expect(storedTermsCP.statusDate === storedTermsRC.statusDate).toBe(true);
  });
});
