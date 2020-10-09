import Web3 from 'web3';

import { AP } from '../src';

// @ts-ignore
import ADDRESS_BOOK from '@atpar/ap-contracts/ap-chain/addresses.json';


describe('APClass', (): void => {

  let web3: Web3;


  beforeAll(async (): Promise<void> => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
  });

  it('should initialize ap.js with a custom addressbook', async (): Promise<void> => {
    // @ts-ignore
    const addressbook = ADDRESS_BOOK;

    const ap = await AP.init(web3, addressbook);

    expect(ap instanceof AP).toBe(true);
  });
});
