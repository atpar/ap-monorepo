/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain');
const { expectEvent, ZERO_ADDRESS } = require('../../../helper/utils/utils');
const { encodeEvent, decodeEvent } = require('../../../helper/utils/schedule');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');


describe('STKActor', () => {
  let deployer, actor, creatorObligor, creatorBeneficiary, nobody;

  const minute = 60;
  const toBN = web3.utils.toBN;

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ deployer, actor, creatorObligor, creatorBeneficiary, nobody ] = self.accounts;

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
    self.terms.cycleAnchorDateOfDividend = self.terms.issueDate + minute;
    self.terms.cycleOfDividend = { "i": 1, "p": 5, "s": 1, "isSet": true }; // once a year

    // put DIF, SPF and REF events on the schedule
    self.schedule = [];
    self.schedule.push(encodeEvent(eventIndex('DIF'), self.terms.cycleAnchorDateOfDividend));
    self.schedule.push(encodeEvent(eventIndex('SPF'), self.terms.issueDate + 2 * minute));
    self.schedule.push(encodeEvent(eventIndex('REF'), self.terms.issueDate + 3 * minute));
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
      value: web3.eth.abi.encodeParameter('int256', web3.utils.toWei(String(this.extData.DIP.values[0])))
    };
    await this.DataRegistryProxyInstance.methods.setDataProvider(point.provider, actor)
      .send({ from: deployer });
    await this.DataRegistryProxyInstance.methods.publishDataPoint(point.provider, point.date, point.value)
      .send({ from: actor });

    const { events } = await this.STKActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset', { eventType: `${eventIndex('DIF')}` });
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
      value: web3.eth.abi.encodeParameter('int256', web3.utils.toWei(String(this.extData.SRA.values[0])))
    };
    await this.DataRegistryProxyInstance.methods.setDataProvider(point.provider, actor).send({ from: deployer });
    await this.DataRegistryProxyInstance.methods.publishDataPoint(point.provider, point.date, point.value)
      .send({ from: actor });

    const { events } = await this.STKActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset', { eventType: `${eventIndex('SPF')}` });
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
      value: web3.eth.abi.encodeParameter('int256', web3.utils.toWei(String(this.extData.REXA.values[0])))
    };
    await this.DataRegistryProxyInstance.methods.setDataProvider(point.provider, actor)
      .send({ from: deployer });
    await this.DataRegistryProxyInstance.methods.publishDataPoint(point.provider, point.date, point.value)
      .send({ from: actor });

    const { events } = await this.STKActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset', { eventType: `${eventIndex('REF')}` });
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
