import Web3 from 'web3';

import { AP } from '../src';

// @ts-ignore
import Deployments from '@atpar/ap-contracts/deployments.json';


describe('APClass', () => {

  let web3: Web3;
  let recordCreator: string;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];
  });

  it('should initialize ap.js', async () => {
    const ap = await AP.init(web3, recordCreator);

    expect(ap instanceof AP).toBe(true);
  });

  it('should initialize ap.js with a custom addressbook', async () => {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    const addressBook = { ...Deployments[netId], AssetActor: Deployments[netId].DemoAssetActor };
    delete addressBook.DemoAssetActor;

    const ap = await AP.init(web3, recordCreator, addressBook);

    expect(ap instanceof AP).toBe(true);
  });
});
