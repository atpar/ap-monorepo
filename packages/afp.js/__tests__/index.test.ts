import Web3 from 'web3';

import { AFP } from '../src';

describe('testAFPClass', () => {

  let web3: Web3;
  let recordCreator: string;

  let afp: AFP;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    recordCreator = (await web3.eth.getAccounts())[0];
  });

  it('should initialize afp.js', async () => {
    afp = await AFP.init(web3, recordCreator, 'http://localhost:9000');
    expect(afp instanceof AFP).toBe(true);
  });
});
