/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain');
const { expectEvent, generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils/utils');
const { decodeEvent } = require('../../../helper/utils/schedule');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');


describe('CERTFActor', () => {
  let deployer, actor, actor2, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody;

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [
      deployer, actor, actor2, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody,
    ] = self.accounts;

    self.ownership = {
      creatorObligor,
      creatorBeneficiary,
      counterpartyObligor,
      counterpartyBeneficiary
    };
    // schedule with RR
    self.terms = require('../../../helper/terms/CERTFTerms-external-data.json');

    // only want RR events in the schedules
    const prefixREF = '0x' + eventIndex('REF').toString(16).padStart(2, '0');
    const prefixEXE = '0x' + eventIndex('EXE').toString(16).padStart(2, '0');
    self.schedule = ( await generateSchedule(self.CERTFEngineInstance, self.terms, 1623456000))
      .filter((event) => (event.startsWith(prefixREF) || event.startsWith(prefixEXE)));

    const { events } = await this.CERTFActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.CERTFEngineInstance.options.address,
      ZERO_ADDRESS,
      ZERO_ADDRESS
    ).send({ from: actor });
    expectEvent(events,'InitializedAsset');
    self.assetId = events.InitializedAsset.returnValues.assetId;

    self.state = await self.CERTFRegistryInstance.methods.getState(web3.utils.toHex(self.assetId)).call();
    self.redemptionAmounts = [100, 110];
    self.quantity = [100];
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should process next state with external redemption amount', async () => {
    const _event = await this.CERTFRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { scheduleTime } = decodeEvent(_event);

    await mineBlock(Number(scheduleTime));

    await this.DataRegistryProxyInstance.methods.setDataProvider(
      this.terms.contractReference_1.object,
      actor
    ).send({ from: deployer });

    await this.DataRegistryProxyInstance.methods.publishDataPoint(
      this.terms.contractReference_1.object,
      this.terms.issueDate,
      web3.eth.abi.encodeParameter(
        'int256',
        web3.utils.toWei(String(this.redemptionAmounts[0]))
      )
    ).send({ from: actor });

    await this.DataRegistryProxyInstance.methods.publishDataPoint(
      this.terms.contractReference_1.object,
      scheduleTime,
      web3.eth.abi.encodeParameter(
        'int256',
        web3.utils.toWei(String(this.redemptionAmounts[1]))
      )
    ).send({ from: actor });

    const { events } = await this.CERTFActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = await this.CERTFRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();

    // compute expected next state
    const projectedNextState = await this.CERTFEngineInstance.methods.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      web3.eth.abi.encodeParameter(
        'int256',
        web3.utils.toWei(String(this.redemptionAmounts[1] / this.redemptionAmounts[0]))
      )
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate, scheduleTime);
    assert.deepStrictEqual(storedNextState, projectedNextState);

    this.state = storedNextState;
  });

  it('should process next state with external quantity', async () => {
    const _event = await this.CERTFRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { scheduleTime } = decodeEvent(_event);

    await mineBlock(Number(scheduleTime));

    await this.DataRegistryProxyInstance.methods.setDataProvider(
      this.terms.contractReference_2.object,
      actor2
    ).send({ from: deployer });

    await this.DataRegistryProxyInstance.methods.publishDataPoint(
      this.terms.contractReference_2.object,
      scheduleTime,
      web3.eth.abi.encodeParameter(
        'int256',
        web3.utils.toWei(String(this.quantity[0]))
      )
    ).send({ from: actor2 });

    const { events } = await this.CERTFActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = await this.CERTFRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();

    // compute expected next state
    const projectedNextState = await this.CERTFEngineInstance.methods.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      web3.eth.abi.encodeParameter(
        'int256',
        web3.utils.toWei(String(this.quantity[0]))
      )
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate, scheduleTime);
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });
});
