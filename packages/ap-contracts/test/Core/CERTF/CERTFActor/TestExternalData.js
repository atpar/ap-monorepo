/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/blockchain');
const { expectEvent, generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils');
const { decodeEvent } = require('../../../helper/scheduleUtils');


describe('CERTFActor', () => {
  let deployer, actor, actor2, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody;

  const getEventTime = async (_event, terms) => {
    return Number(
        await this.CERTFEngineInstance.computeEventTimeForEvent(
            _event,
            terms.businessDayConvention,
            terms.calendar,
            terms.maturityDate
        ).call()
    );
  }

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
    self.schedule = ( await generateSchedule(self.CERTFEngineInstance, self.terms, 1623456000))
        .filter((event) => (event.startsWith('0x17') || event.startsWith('0x1a')));

    const { events } = await this.CERTFActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.CERTFEngineInstance.options.address,
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

    await this.DataRegistryInstance.methods.setDataProvider(
      this.terms.contractReference_1.object,
      actor
    ).send({ from: deployer });

    await this.DataRegistryInstance.methods.publishDataPoint(
      this.terms.contractReference_1.object,
      this.terms.issueDate,
      web3.utils.padLeft(
        web3.utils.numberToHex(
          web3.utils.toWei(String(this.redemptionAmounts[0]))
        ),
        64
      )
    ).send({ from: actor });

    await this.DataRegistryInstance.methods.publishDataPoint(
      this.terms.contractReference_1.object,
      scheduleTime,
      web3.utils.padLeft(
        web3.utils.numberToHex(
          web3.utils.toWei(String(this.redemptionAmounts[1]))
        ),
        64
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
      web3.utils.padLeft(
        web3.utils.numberToHex(
          web3.utils.toWei(String(this.redemptionAmounts[1] / this.redemptionAmounts[0]))
        ),
        64
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

    await this.DataRegistryInstance.methods.setDataProvider(
      this.terms.contractReference_2.object,
      actor2
    ).send({ from: deployer });

    await this.DataRegistryInstance.methods.publishDataPoint(
      this.terms.contractReference_2.object,
      scheduleTime,
      web3.utils.padLeft(
        web3.utils.numberToHex(
          web3.utils.toWei(String(this.quantity[0]))
        ),
        64
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
      web3.utils.padLeft(
        web3.utils.numberToHex(
          web3.utils.toWei(String(this.quantity[0]))
        ),
        64
      )
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate, scheduleTime);
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });
});
