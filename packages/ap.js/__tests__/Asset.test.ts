import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import { AP, Asset } from '../src';
import { ContractTerms, ContractState, ContractType, AssetOwnership } from '../src/types';


describe('testContractClass', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;
  
  let contractTemplatesTyped: any;

  let apRC: AP;
  let apCP: AP;
  let assetRC: Asset;

  let assetListenerCounter = 0;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    const response = await fetch('http://localhost:9000' + '/api/terms?precision=' + 18, {});
    const contractTemplates = await response.json();
    contractTemplatesTyped = {};

    (<any>Object).keys(contractTemplates).map((key: string) => {
      const typedContractTerms: ContractTerms = (<ContractTerms>(<any>contractTemplates)[key]);
      typedContractTerms.contractType = ContractType.PAM;
      (<any>contractTemplatesTyped)[key] = typedContractTerms;
    });

    apRC = await AP.init(web3, recordCreator, {});
    apCP = await AP.init(web3, counterparty, {});
  });

  it('should create a new asset instance', async () => {
    const terms: ContractTerms = (<any>contractTemplatesTyped)['10001'];

    const ownership: AssetOwnership = { 
      recordCreatorObligorAddress: recordCreator,
      recordCreatorBeneficiaryAddress: recordCreator,
      counterpartyObligorAddress: counterparty, 
      counterpartyBeneficiaryAddress: counterparty
    }

    assetRC = await Asset.create(apRC, terms, ownership);

    assetRC.onProgress(() => assetListenerCounter++);

    const storedOwnership: AssetOwnership = await apRC.ownership.getOwnership(assetRC.assetId);
    const storedTerms: ContractTerms = await assetRC.getTerms();
    
    expect(assetRC instanceof Asset).toBe(true);
    expect(ownership.toString() === storedOwnership.toString()).toBe(true);
    expect(terms.statusDate.toString() === storedTerms.statusDate.toString()).toBe(true);
  });

  it('should load asset from registries for counterparty', async () => {
    const assetCP = await Asset.load(apCP, assetRC.assetId);

    const storedOwnershipRC: AssetOwnership = await apRC.ownership.getOwnership(assetRC.assetId);
    const storedTermsRC: ContractTerms = await assetRC.getTerms();
    const storedOwnershipCP: AssetOwnership = await apCP.ownership.getOwnership(assetCP.assetId);
    const storedTermsCP: ContractTerms = await assetCP.getTerms();

    expect(assetCP instanceof Asset).toBe(true);
    expect(storedOwnershipCP.toString() === storedOwnershipRC.toString()).toBe(true);
    expect(storedTermsCP.statusDate === storedTermsRC.statusDate).toBe(true);
  });

  it('should settle payoff for events on behalf of the record creator', async () => {
    const terms: ContractTerms = await assetRC.getTerms();
    const timestamp = Number(terms.statusDate) + 2678400;
    const pendingSchedule = await assetRC.getPendingSchedule(timestamp);
    const counterpartyOldBalance = new BigNumber(await web3.eth.getBalance(counterparty));
    
    let totalPaid = new BigNumber(0);

    for (const evaluatedEvent of pendingSchedule) {
      const payoff = evaluatedEvent.event.payoff;
  
      if (payoff.isLessThan(0)) {
        const amountOutstandingForObligation = await assetRC.getAmountOutstandingForNextObligation(timestamp);
        expect(amountOutstandingForObligation.toFixed() === payoff.abs().toFixed()).toBe(true);

        await assetRC.settleNextObligation(timestamp, { from: recordCreator, value: payoff.abs().toFixed() });
        totalPaid = totalPaid.plus(payoff.abs());
      }
    }

    const counterpartyNewBalance = new BigNumber(await web3.eth.getBalance(counterparty));

    expect((await assetRC.getAmountOutstanding(timestamp)).isZero()).toBe(true);
    expect(totalPaid.isEqualTo(await assetRC.getTotalPaidOff(timestamp))).toBe(true);
    expect(counterpartyOldBalance.plus(totalPaid.abs()).isEqualTo(counterpartyNewBalance)).toBe(true);
  });

  it('should progress to the next state', async () => {
    const terms: ContractTerms = await assetRC.getTerms();
    const timestamp = Number(terms.statusDate) + 2678400;

    const numberOfPendingEvents = (await assetRC.getPendingSchedule(timestamp)).length;
    const oldEventId = await apRC.economics.getEventId(assetRC.assetId);

    await assetRC.progress(timestamp, { from: recordCreator });
    
    const newEventId = await apRC.economics.getEventId(assetRC.assetId);

    expect((await assetRC.getState()).lastEventTime === Number(terms.initialExchangeDate)).toBe(true);
    expect(newEventId === oldEventId + numberOfPendingEvents).toBe(true);
  });

  it('should settle payoff for events on behalf of the counterparty and progress the next state', async () => {
    // wait for tx of previous test (balance of record creator)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // settle obligations
    const assetCP = await Asset.load(apCP, assetRC.assetId);
    const state: ContractState = await assetCP.getState();
    const timestamp = Number(state.lastEventTime) + 2678400;
    const pendingSchedule = await assetCP.getPendingSchedule(timestamp);
    const recordCreatorOldBalance = new BigNumber(await web3.eth.getBalance(recordCreator));

    let totalPaid = new BigNumber(0);
    let lastEventTime = 0;

    for (const evaluatedEvent of pendingSchedule) {
      const payoff = evaluatedEvent.event.payoff;
      if (payoff.isGreaterThan(0)) {
        const amountOutstandingForObligation = await assetCP.getAmountOutstandingForNextObligation(timestamp);
        expect(amountOutstandingForObligation.toFixed() === payoff.abs().toFixed()).toBe(true);

        await assetCP.settleNextObligation(timestamp, { from: counterparty, value: payoff.abs().toFixed() });
        totalPaid = totalPaid.plus(payoff.abs());
      }
      lastEventTime = Number(evaluatedEvent.state.lastEventTime);
    }

    const recordCreatorNewBalance = new BigNumber(await web3.eth.getBalance(recordCreator));

    expect((await assetCP.getAmountOutstanding(timestamp)).isZero()).toBe(true);
    expect(totalPaid.isEqualTo(await assetCP.getTotalPaidOff(timestamp))).toBe(true);
    expect(recordCreatorOldBalance.plus(totalPaid.abs()).isEqualTo(recordCreatorNewBalance)).toBe(true);

    // progress to next state
    const numberOfPendingEvents = pendingSchedule.length;
    const oldEventId = await apCP.economics.getEventId(assetCP.assetId);

    await assetCP.progress(timestamp, { from: counterparty });
    
    const newEventId = await apCP.economics.getEventId(assetCP.assetId);

    expect((await assetCP.getState()).lastEventTime === lastEventTime).toBe(true);
    expect(newEventId === oldEventId + numberOfPendingEvents).toBe(true);
  });

  it('should have called the asset listener more than once', () => {
    expect(assetListenerCounter > 0).toBe(true);
  });
});
