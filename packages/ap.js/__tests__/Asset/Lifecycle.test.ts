import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract/types';

import { AP, Asset } from '../../src';
import { AssetOwnership, ContractTerms } from '../../src/types';

// @ts-ignore
import ERC20SampleTokenArtifact from '@atpar/ap-contracts/artifacts/ERC20SampleToken.min.json';
// @ts-ignore
import DefaultTerms from '../DefaultTerms.json';


describe('Lifecycle', () => {

  let web3: Web3;
  let snapshot: string;

  let recordCreator: string;
  let counterparty: string;

  let paymentToken: Contract;

  let apRC: AP;
  let apCP: AP;
  let assetRC: Asset;
  let assetCP: Asset;

  let progressListenerCounter = 0;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));

    // @ts-ignore
    snapshot = await web3.currentProvider.send('evm_snapshot', []);    

    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    paymentToken = new web3.eth.Contract(
      // @ts-ignore
      ERC20SampleTokenArtifact.abi,
    );
    // @ts-ignore
    await paymentToken.deploy({ data: ERC20SampleTokenArtifact.bytecode }).send(
      { from: recordCreator, gas: 2000000 }
    );

    await paymentToken.methods.transfer(
      counterparty,
      '5000000000000000000000'
    ).send({ from: recordCreator });

    apRC = await AP.init(web3, recordCreator);
    apCP = await AP.init(web3, counterparty);

    apRC.lifecycle.onProgress(() => {
      progressListenerCounter++;
    });

    const terms: ContractTerms = DefaultTerms;
    terms.currency = paymentToken.options.address;

    const ownership: AssetOwnership = { 
      recordCreatorObligor: recordCreator,
      recordCreatorBeneficiary: recordCreator,
      counterpartyObligor: counterparty, 
      counterpartyBeneficiary: counterparty
    }

    assetRC = await Asset.create(apRC, terms, ownership);
    assetCP = await Asset.load(apCP, assetRC.assetId);
  });

  afterAll(async () => {
    // @ts-ignore
    await web3.currentProvider.send('evm_revert', [snapshot]);    
  });

  it('should settle payoff for events on behalf of the record creator and progress to the next state', async () => {
    // settle obligations
    const terms = await assetRC.getTerms();
    const timestamp = Number(terms.statusDate) + 2678400;
    const pendingSchedule = await assetRC.getPendingSchedule(timestamp);
    
    let totalPaid = new BigNumber(0);

    for (const evaluatedEvent of pendingSchedule) {
      const payoff = evaluatedEvent.event.payoff;
  
      if (payoff.isLessThan(0)) {
        const amountOutstandingForObligation = await assetRC.getAmountOutstandingForNextObligation(timestamp);
        expect(amountOutstandingForObligation.toFixed() === payoff.abs().toFixed()).toBe(true);

        await paymentToken.methods.approve(
          apRC.contracts.paymentRouter.instance.options.address, 
          payoff.abs().toFixed()
        ).send({ from: recordCreator });

        await assetRC.settleNextObligation(timestamp, payoff.abs());
        totalPaid = totalPaid.plus(payoff.abs());
      }
    }

    // progress to the next state
    // const numberOfPendingEvents = (await assetRC.getPendingSchedule(timestamp)).length;
    // const oldEventId = await assetRC.getEventId();

    // @ts-ignore
    await web3.currentProvider.send('evm_mine', [timestamp]);

    await assetRC.progress();
    
    // const newEventId = await assetRC.getEventId();

    expect((await assetRC.getState()).lastEventTime === Number(terms.initialExchangeDate)).toBe(true);
    // expect(newEventId === oldEventId + numberOfPendingEvents).toBe(true);
  });

  it('should settle payoff for events on behalf of the counterparty and progress to the next state', async () => {
    // wait for tx of previous test (balance of record creator)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // settle obligations
    const state = await assetCP.getState();
    const timestamp = Number(state.lastEventTime) + 2678400;
    const pendingSchedule = await assetCP.getPendingSchedule(timestamp);

    let totalPaid = new BigNumber(0);
    let lastEventTime = 0;

    for (const evaluatedEvent of pendingSchedule) {
      const payoff = evaluatedEvent.event.payoff;
      if (payoff.isGreaterThan(0)) {
        const amountOutstandingForObligation = await assetCP.getAmountOutstandingForNextObligation(timestamp);
        expect(amountOutstandingForObligation.toFixed() === payoff.abs().toFixed()).toBe(true);

        await paymentToken.methods.approve(
          apRC.contracts.paymentRouter.instance.options.address, 
          payoff.abs().toFixed()
        ).send({ from: counterparty });

        await assetCP.settleNextObligation(timestamp, payoff.abs());
        totalPaid = totalPaid.plus(payoff.abs());
      }
      lastEventTime = Number(evaluatedEvent.state.lastEventTime);
    }

    // progress to next state
    // const numberOfPendingEvents = pendingSchedule.length;
    // const oldEventId = await assetCP.getEventId();

    // @ts-ignore
    await web3.currentProvider.send('evm_mine', [timestamp]);

    await assetCP.progress();
    
    // const newEventId = await assetCP.getEventId();

    expect((await assetCP.getState()).lastEventTime === lastEventTime).toBe(true);
    // expect(newEventId === oldEventId + numberOfPendingEvents).toBe(true);
  });

  it('should have called the progress listener more than once', () => {
    expect(progressListenerCounter > 0).toBe(true);
  });
});
