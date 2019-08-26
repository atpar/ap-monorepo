import Web3 from 'web3';

import { AP } from '../../src';
import { ContractTerms } from '../../src/types';

// @ts-ignore
import DefaultTerms from '../DefaultTerms.json';


describe('EconomicsAPI', () => {

  let web3: Web3;
  let ap: AP;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    ap = await AP.init(web3, (await web3.eth.getAccounts())[0]);
  });

  it('should return a valid value from calling all engines', async () => {
    const terms: ContractTerms = DefaultTerms;

    const pam_initialState = await ap.economics.engine(0).computeInitialState(terms);

    expect(pam_initialState).toBeDefined();
    
    const ann_initialState = await ap.economics.engine(1).computeInitialState({ ...terms, contractType: 1 });

    expect(ann_initialState).toBeDefined();
  });
});
