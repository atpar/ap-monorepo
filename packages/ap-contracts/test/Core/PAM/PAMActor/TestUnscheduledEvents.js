/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const { shouldFail } = require('openzeppelin-test-helpers');

const { getSnapshotTaker, getDefaultTerms, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { expectEvent, generateSchedule, ZERO_BYTES32 } = require('../../../helper/utils');
const { encodeEvent } = require('../../../helper/scheduleUtils');
const { mineBlock } = require('../../../helper/blockchain');


describe('PAMActor', () => {
  let deployer, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody;

  const getEventTime = async (_event, terms) => {
    return Number(
        await this.PAMEngineInstance.methods.computeEventTimeForEvent(
            _event,
            terms.businessDayConvention,
            terms.calendar,
            terms.maturityDate
        ).call()
    );
  }

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(bre, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [
      deployer, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody,
    ] = self.accounts;

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    self.terms = {
      ...await getDefaultTerms("PAM"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };

    // deploy test ERC20 token
    self.PaymentTokenInstance = await deployPaymentToken(bre, creatorObligor, [counterpartyBeneficiary]);
    // set address of payment token as currency in terms
    self.terms.currency = self.PaymentTokenInstance.options.address;
    self.terms.settlementCurrency = self.PaymentTokenInstance.options.address;
    self.terms.statusDate = self.terms.contractDealDate;

    self.schedule = await generateSchedule(self.PAMEngineInstance, self.terms);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    await this.setupTestEnvironment();
  });

  it('should process next state for an unscheduled event', async () => {
    const { events } = await this.PAMActorInstance.methods.initialize(
        this.terms,
        this.schedule,
        this.ownership,
        this.PAMEngineInstance.options.address,
        actor
    ).send({ from: deployer });
    expectEvent(events,'InitializedAsset');
    this.assetId = events.InitializedAsset.returnValues.assetId;

    const initialState = await this.PAMRegistryInstance.methods.getState(
        web3.utils.toHex(this.assetId)
    ).call();
    const event = encodeEvent(9, Number(this.terms.contractDealDate) + 100);
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    const { events: events_PF } = await this.PAMActorInstance.methods.progressWith(
        web3.utils.toHex(this.assetId),
        event,
    ).send({ from: actor });
    expectEvent(events_PF, 'ProgressedAsset');
    const emittedAssetId = events_PF.ProgressedAsset.returnValues.assetId;

    const storedNextState = await this.PAMRegistryInstance.methods.getState(
        web3.utils.toHex(this.assetId)
    ).call();

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        initialState,
        event,
        ZERO_BYTES32
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate, eventTime.toString());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });

  it('should not process next state for an unscheduled event with a later schedule time', async () => {
    const { events } = await this.PAMActorInstance.methods.initialize(
        this.terms,
        this.schedule,
        this.ownership,
        this.PAMEngineInstance.options.address,
        actor
    ).send({ from: deployer });
    expectEvent(events,'InitializedAsset');
    this.assetId = events.InitializedAsset.returnValues.assetId;

    const event = await this.PAMRegistryInstance.methods.getNextScheduledEvent(
        web3.utils.toHex(this.assetId)
    ).call();
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    await shouldFail.reverting.withMessage(
        this.PAMActorInstance.methods.progressWith(
            web3.utils.toHex(this.assetId),
            event,
        ).send({ from: actor }),
        'BaseActor.progressWith: ' + 'FOUND_EARLIER_EVENT'
    );
  });
});
