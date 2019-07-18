import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import fetch from 'cross-fetch';

import { AP, Asset } from '../../src';
import { ContractTerms, ContractType, AssetOwnership } from '../../src/types';


describe('SettlementInETH', () => {

  let web3: Web3;
  let recordCreator: string;
  let counterparty: string;
  
  let contractTemplatesTyped: any;

  let apRC: AP;
  let apCP: AP;
  let assetRC: Asset;
  let assetCP: Asset;

  let paymentListenerCounter = 0;

  beforeAll(async () => {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545'));
    recordCreator = (await web3.eth.getAccounts())[0];
    counterparty = (await web3.eth.getAccounts())[1];

    const response = await fetch('http://localhost:9000' + '/api/terms', {});
    const contractTemplates = await response.json();
    contractTemplatesTyped = {};

    (<any>Object).keys(contractTemplates).map((key: string) => {
      const typedContractTerms = (<ContractTerms>(<any>contractTemplates)[key]);
      typedContractTerms.contractType = ContractType.PAM;
      (<any>contractTemplatesTyped)[key] = typedContractTerms;
    });

    apRC = await AP.init(web3, recordCreator);
    apCP = await AP.init(web3, counterparty);

    apRC.payment.onPayment(() => {
      paymentListenerCounter++;
    });

    const terms = (<any>contractTemplatesTyped)['10001'];

    const ownership: AssetOwnership = { 
      recordCreatorObligor: recordCreator,
      recordCreatorBeneficiary: recordCreator,
      counterpartyObligor: counterparty, 
      counterpartyBeneficiary: counterparty
    }

    assetRC = await Asset.create(apRC, terms, ownership);
    assetCP = await Asset.load(apCP, assetRC.assetId);
  });

  test('amount outstanding for next obligation is equal to the first non zero payoff of the pending schedule', async () => {
    const terms = await assetCP.getTerms();
    const timestamp = Number(terms.maturityDate);
    const pendingSchedule = await assetRC.getPendingSchedule(timestamp);

    let amountRC = new BigNumber(0);
    let amountCP = new BigNumber(0);

    for (const evaluatedEvent of pendingSchedule) {
      const payoff = evaluatedEvent.event.payoff;
      if (payoff.isGreaterThan(0) && amountCP.isEqualTo(0)) {
        amountCP = payoff.abs();  
      } else if (payoff.isLessThan(0) && amountRC.isEqualTo(0)) {
        amountRC = payoff.abs();
      }
    }

    expect(amountRC.isEqualTo(await assetRC.getAmountOutstandingForNextObligation(timestamp))).toBe(true);
    expect(amountCP.isEqualTo(await assetCP.getAmountOutstandingForNextObligation(timestamp))).toBe(true);
  });

  it('should settle payoff for events on behalf of the record creator', async () => {
    const terms = await assetRC.getTerms();
    const timestamp = Number(terms.statusDate) + 2678400;
    const pendingSchedule = await assetRC.getPendingSchedule(timestamp);
    const counterpartyOldBalance = new BigNumber(await web3.eth.getBalance(counterparty));
    
    let totalPaid = new BigNumber(0);

    for (const evaluatedEvent of pendingSchedule) {
      const payoff = evaluatedEvent.event.payoff;
  
      if (payoff.isLessThan(0)) {
        const amountOutstandingForObligation = await assetRC.getAmountOutstandingForNextObligation(timestamp);
        expect(amountOutstandingForObligation.toFixed() === payoff.abs().toFixed()).toBe(true);

        await assetRC.settleNextObligation(timestamp, payoff.abs());
        totalPaid = totalPaid.plus(payoff.abs());
      }
    }

    const counterpartyNewBalance = new BigNumber(await web3.eth.getBalance(counterparty));

    expect((await assetRC.getAmountOutstanding(timestamp)).isZero()).toBe(true);
    expect(totalPaid.isEqualTo(await assetRC.getTotalPaidOff(timestamp))).toBe(true);
    expect(counterpartyOldBalance.plus(totalPaid.abs()).isEqualTo(counterpartyNewBalance)).toBe(true);
  });

  it('should settle payoff for events on behalf of the counterparty', async () => {
    // settle obligations
    const terms = await assetCP.getTerms();
    const timestamp = Number(terms.statusDate) + 5356800;
    const pendingSchedule = await assetCP.getPendingSchedule(timestamp);
    const recordCreatorOldBalance = new BigNumber(await web3.eth.getBalance(recordCreator));

    let totalPaid = new BigNumber(0);

    for (const evaluatedEvent of pendingSchedule) {
      const payoff = evaluatedEvent.event.payoff;
      if (payoff.isGreaterThan(0)) {
        const amountOutstandingForObligation = await assetCP.getAmountOutstandingForNextObligation(timestamp);
        expect(amountOutstandingForObligation.toFixed() === payoff.abs().toFixed()).toBe(true);

        await assetCP.settleNextObligation(timestamp, payoff.abs());
        totalPaid = totalPaid.plus(payoff.abs());
      }
    }

    const recordCreatorNewBalance = new BigNumber(await web3.eth.getBalance(recordCreator));

    expect((await assetCP.getAmountOutstanding(timestamp)).isZero()).toBe(true);
    expect(totalPaid.isEqualTo(await assetCP.getTotalPaidOff(timestamp))).toBe(true);
    expect(recordCreatorOldBalance.plus(totalPaid.abs()).isEqualTo(recordCreatorNewBalance)).toBe(true);
  });

  it('should have called the payment listener more than once', () => {
    expect(paymentListenerCounter > 0).toBe(true);
  });
});
