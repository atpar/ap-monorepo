/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain');
const { expectEvent, ZERO_ADDRESS } = require('../../../helper/utils/utils');
const { encodeEvent, decodeEvent } = require('../../../helper/utils/schedule');


// TODO: Replace hardcoded event values ids with names (#useEventName)
describe('STKActor', () => {
  let deployer, actor, actor2, creatorObligor, creatorBeneficiary, nobody;

  const minute = 60;
  const toBN = web3.utils.toBN;

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ deployer, actor, actor2, creatorObligor, creatorBeneficiary, nobody ] = self.accounts;

    self.ownership = {
      creatorObligor,
      creatorBeneficiary,
      counterpartyObligor: ZERO_ADDRESS,
      counterpartyBeneficiary: ZERO_ADDRESS
    };
    self.terms = Object.assign({}, require('../../../helper/terms/STKTerms-complex.json'));
    self.contractRole = 1; // RPL
    self.terms.calendar = 0;
    self.terms.businessDayConvention = 0; // no business day shifting
    self.terms.issueDate = 1 * (await web3.eth.getBlock('latest')).timestamp;
    self.terms.statusDate = self.terms.issueDate + 1;
    self.terms.cycleAnchorDateOfDividend = self.terms.issueDate + 1 * minute;
    self.terms.cycleOfDividend = { "i": 1, "p": 5, "s": 1, "isSet": true }; // once a year

    // put DIF, SPF and REF events on the schedule
    self.schedule = [];
    self.schedule.push(encodeEvent(14, self.terms.cycleAnchorDateOfDividend)); // #useEventName (DIF)
    self.schedule.push(encodeEvent(22, self.terms.issueDate + 2 * minute)); // #useEventName (SPF)
    self.schedule.push(encodeEvent(19, self.terms.issueDate + 3 * minute)); // #useEventName (REF)
    // external data for these events
    self.extData = {
      DIP: { index: 1, values: [10000000] }, // dividendPaymentAmount
      SRA: { index: 2, values: [2] }, // splitRatio
      REXA: { index: 3, values: [1] }, // exerciseQuantity
    }

    const { events } = await this.STKActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.STKEngineInstance.options.address,
      ZERO_ADDRESS
    ).send({ from: actor });
    expectEvent(events,'InitializedAsset');
    self.assetId = events.InitializedAsset.returnValues.assetId;

    self.state = await self.STKRegistryInstance.methods.getState(web3.utils.toHex(self.assetId)).call();
    });

    before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should process next state with external dividendPaymentAmount', async () => {
    const _event = await this.STKRegistryInstance.methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { scheduleTime } = decodeEvent(_event);

    await mineBlock(Number(scheduleTime) + 10);

    const point = {
      provider: '0x' + toBN(this.assetId).add(toBN(this.extData.DIP.index)).toString(16),
      date: this.terms.cycleAnchorDateOfDividend,
      value: web3.utils.padLeft(web3.utils.numberToHex(web3.utils.toWei(String(this.extData.DIP.values[0]))), 64)
    };
    await this.DataRegistryInstance.methods.setDataProvider(point.provider, actor).send({ from: deployer });
    await this.DataRegistryInstance.methods.publishDataPoint(point.provider, point.date, point.value).send({ from: actor });

    const { events } = await this.STKActorInstance.methods.progress(web3.utils.toHex(this.assetId)).send({ from: nobody });
    expectEvent(events, 'ProgressedAsset', { eventType: "14" }); // #useEventName (DIF)
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = await this.STKRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    // compute expected next state
    const projectedNextState = await this.STKEngineInstance.methods.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      point.value,
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(`${projectedNextState.dividendPaymentAmount}`, "10000000000000000000000000");
    assert.strictEqual(storedNextState.statusDate, scheduleTime);
    assert.deepStrictEqual(storedNextState, projectedNextState);

    this.state = storedNextState;
  });

  it('should process next state with external splitRatio', async () => {
    const _event = await this.STKRegistryInstance.methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { scheduleTime } = decodeEvent(_event);

    await mineBlock(Number(scheduleTime) + 10);

    const point = {
      provider: '0x' + toBN(this.assetId).add(toBN(this.extData.SRA.index)).toString(16),
      date: this.terms.issueDate + 2 * minute,
      value: web3.utils.padLeft(web3.utils.numberToHex(web3.utils.toWei(String(this.extData.SRA.values[0]))), 64)
    };
    await this.DataRegistryInstance.methods.setDataProvider(point.provider, actor).send({ from: deployer });
    await this.DataRegistryInstance.methods.publishDataPoint(point.provider, point.date, point.value).send({ from: actor });

    const { events } = await this.STKActorInstance.methods.progress(web3.utils.toHex(this.assetId)).send({ from: nobody });
    expectEvent(events, 'ProgressedAsset', { eventType: "22" }); // #useEventName (SPF)
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = await this.STKRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    // compute expected next state
    const projectedNextState = await this.STKEngineInstance.methods.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      point.value,
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(`${projectedNextState.splitRatio}`, "2000000000000000000");
    assert.strictEqual(storedNextState.statusDate, scheduleTime);
    assert.deepStrictEqual(storedNextState, projectedNextState);

    this.state = storedNextState;
  });

  it('should process next state with external exerciseQuantity', async () => {
    const _event = await this.STKRegistryInstance.methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { scheduleTime } = decodeEvent(_event);

    await mineBlock(Number(scheduleTime) + 10);

    const point = {
      provider: '0x' + toBN(this.assetId).add(toBN(this.extData.REXA.index)).toString(16),
      date: this.terms.issueDate + 3 * minute,
      value: web3.utils.padLeft(web3.utils.numberToHex(web3.utils.toWei(String(this.extData.REXA.values[0]))), 64)
    };
    await this.DataRegistryInstance.methods.setDataProvider(point.provider, actor).send({ from: deployer });
    await this.DataRegistryInstance.methods.publishDataPoint(point.provider, point.date, point.value).send({ from: actor });

    const { events } = await this.STKActorInstance.methods.progress(web3.utils.toHex(this.assetId)).send({ from: nobody });
    expectEvent(events, 'ProgressedAsset', { eventType: "19" }); // #useEventName (REF)
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = await this.STKRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    // compute expected next state
    const projectedNextState = await this.STKEngineInstance.methods.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      point.value
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(`${projectedNextState.exerciseQuantity}`, "1000000000000000000");
    assert.strictEqual(storedNextState.statusDate, scheduleTime);
    assert.deepStrictEqual(storedNextState, projectedNextState);

    this.state = storedNextState;
  });
});
