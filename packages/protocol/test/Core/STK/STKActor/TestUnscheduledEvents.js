/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');
const { shouldFail } = require('openzeppelin-test-helpers');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { expectEvent, generateSchedule, ZERO_ADDRESS, ZERO_BYTES32 } = require('../../../helper/utils/utils');
const { encodeEvent } = require('../../../helper/utils/schedule');
const { mineBlock } = require('../../../helper/utils/blockchain');


// TODO: Replace hardcoded event values ids with names (#useEventName)
describe('STKActor', () => {
  let admin;
  const minute = 60;
  const toBN = web3.utils.toBN;

  const getEventTime = async (_event, terms) => {
    return Number(await this.STKEngineInstance.methods.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      0
    ).call());
  }

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    admin = self.accounts[0];
    const [ ,, creatorObligor, creatorBeneficiary ] = self.accounts;

    self.ownership = {
      creatorObligor,
      creatorBeneficiary,
      counterpartyObligor: ZERO_ADDRESS,
      counterpartyBeneficiary: ZERO_ADDRESS,
    };

    self.terms = Object.assign({}, require('../../../helper/terms/STKTerms-complex.json'));
    self.contractRole = 1; // RPL
    self.terms.calendar = 0;
    self.terms.businessDayConvention = 0; // no business day shifting
    self.terms.issueDate = 1 * (await web3.eth.getBlock('latest')).timestamp;
    self.terms.statusDate = self.terms.issueDate + 1;
    self.terms.cycleAnchorDateOfDividend = self.terms.issueDate + 3 * minute;

    // generate DIF events
    const tMax = 1*self.terms.issueDate + 3 * 365 * 24 * 3600;
    self.schedule = await generateSchedule(self.STKEngineInstance, self.terms, tMax, [14]); // #useEventName (DIF)

    const tx = await self.STKActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.STKEngineInstance.options.address,
      admin
    ).send(self.txOpts);
    self.assetId = tx.events.InitializedAsset.returnValues.assetId;

    // prepare external data for 1st DIF event
    self.extData = {
      DIP: { index: 1, values: [10000000] }, // dividendPaymentAmount
    }
    const dp = {
      provider: '0x' + toBN(this.assetId).add(toBN(this.extData.DIP.index)).toString(16),
      date: this.terms.cycleAnchorDateOfDividend,
      value:  web3.utils.padLeft(web3.utils.numberToHex(web3.utils.toWei(String(this.extData.DIP.values[0]))), 64)
    };
    self.dipaValue = dp.value;
    await this.DataRegistryInstance.methods.setDataProvider(dp.provider, admin).send({ from: admin });
    await this.DataRegistryInstance.methods.publishDataPoint(dp.provider, dp.date, dp.value).send({ from: admin });
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    // take (on the 1st call) or restore (on further calls) the snapshot
    await this.setupTestEnvironment()
  });

  it('should process next state for an unscheduled event', async () => {
    await this.STKActorInstance.methods.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.STKEngineInstance.options.address,
      admin
    ).send(this.txOpts);

    const initialState = await this.STKRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();

    const firstScheduledTime = await getEventTime(this.schedule[0], this.terms);
    const event = encodeEvent(2, 1 * firstScheduledTime - minute); // #useEventName (ISS)
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    const tx2 = await this.STKActorInstance.methods.progressWith(
      web3.utils.toHex(this.assetId),
      event,
    ).send({ from: admin });

    expectEvent(tx2.events, 'ProgressedAsset', { eventType: "2" }); // #useEventName (ISS)
    const emittedAssetId = tx2.events.ProgressedAsset.returnValues.assetId;
    const storedNextState = await this.STKRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();

    // compute expected next state
    const projectedNextState = await this.STKEngineInstance.methods.computeStateForEvent(
      this.terms,
      initialState,
      event,
      ZERO_BYTES32,
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId.toString(), this.assetId.toString());
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(storedNextState.toString(), projectedNextState.toString());
  });

  it('should not process next state for an unscheduled event with a later schedule time', async () => {
    const firstScheduledTime = await getEventTime(this.schedule[0], this.terms);
    const event = encodeEvent(16, 1 * firstScheduledTime + minute); // #useEventName (DIP)
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    await shouldFail.reverting.withMessage(
      this.STKActorInstance.methods.progressWith(
        web3.utils.toHex(this.assetId),
        event,
      ).send({ from: admin }),
      'BaseActor.progressWith: ' + 'FOUND_EARLIER_EVENT'
    );
  });
});
