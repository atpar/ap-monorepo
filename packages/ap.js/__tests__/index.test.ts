import Web3 from 'web3';

import { AP } from '../src';

describe('testAPClass', () => {

  let web3: Web3;
  let recordCreator: string;

  let ap: AP;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];
  });

  it('should initialize ap.js', async () => {
    ap = await AP.init(web3, recordCreator, {});
    expect(ap instanceof AP).toBe(true);
  });
});
