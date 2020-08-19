/*jslint node*/
/*global before, beforeEach, describe, it*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const { shouldFail } = require('openzeppelin-test-helpers');

const { setupTestEnvironment, getDefaultTerms, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, ZERO_BYTES32 } = require('../../../helper/utils');
const { encodeEvent } = require('../../../helper/scheduleUtils');
const { mineBlock } = require('../../../helper/blockchain');


describe('ANNActor', () => {
  const txOpts = {};
  let admin, creatorObligor, creatorBeneficiary, counterpartyObligor, countecounterpartyBeneficiary;

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

    admin = accounts[0];
    creatorObligor = accounts[2];
    creatorBeneficiary = accounts[3];
    counterpartyObligor = accounts[4];
    counterpartyBeneficiary = accounts[5];
  });

  before(async () => {
    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = {
      ...await getDefaultTerms("ANN"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };
  });

  beforeEach(async () => {
    await setupTestEnvironment(bre, this);

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(
        creatorObligor,
        [counterpartyBeneficiary],
        this.SettlementTokenInstance,
    );
    // set address of payment token as currency in terms
    this.terms.currency = this.PaymentTokenInstance.options.address;
    this.terms.settlementCurrency = this.PaymentTokenInstance.options.address;
    this.terms.statusDate = this.terms.contractDealDate;

    this.schedule = await generateSchedule(this.ANNEngineInstance, this.terms);
  });

  it('should process next state for an unscheduled event', async () => {
    const tx = await this.ANNActorInstance.methods.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.ANNEngineInstance.options.address,
      admin
    ).send(txOpts);

    this.assetId = tx.events.InitializedAsset.returnValues.assetId;

    const initialState = await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    const event = encodeEvent(9, Number(this.terms.contractDealDate) + 100);
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    const tx2 = await this.ANNActorInstance.methods.progressWith(
      web3.utils.toHex(this.assetId),
      event,
    ).send({ from: admin });
    const emittedAssetId = tx2.events.ProgressedAsset.returnValues.assetId;
    const storedNextState = await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();

    // compute expected next state
    const projectedNextState = await this.ANNEngineInstance.methods.computeStateForEvent(
      this.terms,
      initialState,
      event,
      ZERO_BYTES32
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId.toString(), this.assetId.toString());
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(storedNextState.toString(), projectedNextState.toString());
  });

  it('should not process next state for an unscheduled event with a later schedule time', async () => {
    const tx = await this.ANNActorInstance.methods.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.ANNEngineInstance.options.address,
      admin
    ).send(txOpts);

    this.assetId = tx.events.InitializedAsset.returnValues.assetId;

    const event = await this.ANNRegistryInstance
        .methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    await shouldFail.reverting.withMessage(
      this.ANNActorInstance.methods.progressWith(
        web3.utils.toHex(this.assetId),
        event,
      ).send({ from: admin }),
      'BaseActor.progressWith: ' + 'FOUND_EARLIER_EVENT'
    );
  });
});
