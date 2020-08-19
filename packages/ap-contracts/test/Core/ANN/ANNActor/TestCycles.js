/*jslint node*/
/*global before, beforeEach, describe, it*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const BigNumber = require('bignumber.js');

const { getDefaultTerms, deployPaymentToken, setupTestEnvironment } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/blockchain');
const { ZERO_ADDRESS, web3ResponseToState } = require('../../../helper/utils');


describe('ANNActor', () => {

  const txOpts = {};

  let creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  const getEventTime = async (_event, terms) => {
    return Number(await this.ANNEngineInstance.methods.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ).call());
  }

  before(async () => {
    await setupTestEnvironment(bre, this);

    const accounts = bre.usrNs.accounts;
    txOpts.from = accounts[9];

    creatorObligor = accounts[2];
    creatorBeneficiary = accounts[3];
    counterpartyObligor = accounts[4];
    counterpartyBeneficiary = accounts[5];

    this.ownership = {creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary};
    this.terms = {
      ...await getDefaultTerms('ANN'),
      gracePeriod: {i: 1, p: 2, isSet: true},
      delinquencyPeriod: {i: 1, p: 3, isSet: true}
    };
  });

  beforeEach(async () => {
    await setupTestEnvironment(bre, this);

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(
        creatorObligor,
        [counterpartyObligor, counterpartyBeneficiary],
        this.SettlementTokenInstance,
    );

    // set address of payment token as currency in terms
    this.terms.currency = this.PaymentTokenInstance.options.address;
    this.terms.settlementCurrency = this.PaymentTokenInstance.options.address;
    this.terms.statusDate = this.terms.contractDealDate;

    this.schedule = [];
    this.state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.terms).call());

    const tx = await this.ANNActorInstance.methods.initialize(
        this.terms,
        this.schedule,
        this.ownership,
        this.ANNEngineInstance.options.address,
        ZERO_ADDRESS
    ).send(txOpts);

    this.assetId = tx.events.InitializedAsset.returnValues.assetId;
  });

  it('should process the next cyclic event', async () => {
    const _event = await this.ANNRegistryInstance.methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms)

    const payoff = new BigNumber(await this.ANNEngineInstance.methods.computePayoffForEvent(
      this.terms,
      this.state,
      _event,
      web3.utils.toHex(eventTime)
    ).call());

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.methods.approve(
      this.ANNActorInstance.options.address,
      value
    ).send({ from: (payoff.isGreaterThan(0)) ? counterpartyObligor : creatorObligor });

    // settle and progress asset state
    await mineBlock(eventTime);
    const tx = await this.ANNActorInstance.methods.progress(
      web3.utils.toHex(this.assetId),
    ).send({ from: creatorObligor });
    const emittedAssetId = tx.events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.ANNRegistryInstance
        .methods.isEventSettled(web3.utils.toHex(this.assetId), _event).call();
    const projectedNextState = web3ResponseToState(await this.ANNEngineInstance.methods.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      web3.utils.toHex(0)
    ).call());
    const storedNextEvent = await this.ANNRegistryInstance
        .methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();

    assert.strictEqual(emittedAssetId, this.assetId);
    assert.notStrictEqual(storedNextEvent, _event);
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(isEventSettled[0], true);
    assert.strictEqual(isEventSettled[1].toString(), payoff.toFixed());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });
});
