import Web3 from 'web3';

// @ts-ignore
import Deployments from '@atpar/ap-contracts/deployments.json';

import { Utils, Contracts } from '../../src/apis';

import DEFAULT_TERMS from '../Default-Terms.json';


describe('Utils', (): void => {

  let web3: Web3;
  let contracts: Contracts;


  beforeAll(async (): Promise<void> => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    // @ts-ignore
    const addressBook = Deployments[await web3.eth.net.getId()];
    contracts = new Contracts(web3, addressBook);
  });

  it('should return schedule for terms', async (): Promise<void> => {
    const terms = DEFAULT_TERMS;
    const schedule = await Utils.schedule.computeScheduleFromTerms(contracts.engine(terms.contractType), terms);

    expect(schedule.length).toBeGreaterThan(0);
  });

  it('should return schedule for terms - perpetual', async (): Promise<void> => {
    const terms = DEFAULT_TERMS;
    const schedule = await Utils.schedule.computeScheduleFromTerms(contracts.engine(terms.contractType), terms, true, terms.maturityDate, terms.maturityDate);

    expect(schedule.length).toBeGreaterThan(0);
  });
});
