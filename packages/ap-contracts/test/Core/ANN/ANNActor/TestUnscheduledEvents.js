/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');
const { shouldFail } = require('openzeppelin-test-helpers');

const { getSnapshotTaker, getDefaultTerms, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, ZERO_BYTES32 } = require('../../../helper/utils');
const { encodeEvent } = require('../../../helper/scheduleUtils');
const { mineBlock } = require('../../../helper/blockchain');

// TODO: Replace hardcoded event values ids with names (#useEventName)

describe('ANNActor', () => {
  let admin;

  const getEventTime = async (_event, terms) => {
    return Number(await this.ANNEngineInstance.methods.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ).call());
  }

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    admin = self.accounts[0];
    const [ ,, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary ] = self.accounts;

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };

    // deploy a test ERC20 token to use it as the terms currency
    const { options: { address: paymentTokenAddress }} = await deployPaymentToken(
        buidlerRuntime, creatorObligor, [ counterpartyBeneficiary ]
    );
    self.terms = {
      ...await getDefaultTerms("ANN"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true },
      currency: paymentTokenAddress,
      settlementCurrency: paymentTokenAddress,
    };
    self.terms.statusDate = self.terms.contractDealDate;

    self.schedule = await generateSchedule(self.ANNEngineInstance, self.terms);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    // take (on the 1st call) or restore (on further calls) the snapshot
    await this.setupTestEnvironment()
  });

  it('should process next state for an unscheduled event', async () => {
    const tx = await this.ANNActorInstance.methods.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.ANNEngineInstance.options.address,
      admin
    ).send(this.txOpts);

    this.assetId = tx.events.InitializedAsset.returnValues.assetId;

    const initialState = await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    const event = encodeEvent(10, Number(this.terms.contractDealDate) + 100); // #useEventName
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
    ).send(this.txOpts);

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
