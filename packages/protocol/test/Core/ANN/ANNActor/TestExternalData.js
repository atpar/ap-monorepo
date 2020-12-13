/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain');
const { generateSchedule, expectEvent, ZERO_ADDRESS } = require('../../../helper/utils/utils');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');


describe('ANNActor', () => {
  let deployer, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody;

  const getEventTime = async (_event, terms) => {
    return Number(
      await this.ANNEngineInstance.methods.computeEventTimeForEvent(
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
      deployer, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody,
    ] = self.accounts;

    self.ownership = {
      creatorObligor,
      creatorBeneficiary,
      counterpartyObligor,
      counterpartyBeneficiary
    };
    // schedule with RR
    self.terms = require('../../../helper/terms/ANNTerms-external-data.json');

    // only want RR events in the schedules
    const prefix = '0x' + eventIndex('RR').toString(16).padStart(2, '0');
    self.schedule = (await generateSchedule(self.ANNEngineInstance, self.terms))
      .filter((event) => event.startsWith(prefix));

    const { events } = await self.ANNActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.ANNEngineInstance.options.address,
      ZERO_ADDRESS,
      ZERO_ADDRESS
    ).send({ from: actor });
    expectEvent(events,'InitializedAsset');
    self.assetId = events.InitializedAsset.returnValues.assetId;

    self.state = await self.ANNRegistryInstance.methods.getState(web3.utils.toHex(self.assetId)).call();

    self.resetRate = web3.utils.toWei('100');
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should process next state with external rate', async () => {
    const _event = await this.ANNRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    await mineBlock(Number(eventTime));

    await this.DataRegistryProxyInstance.methods.setDataProvider(
      this.terms.marketObjectCodeRateReset,
      actor
    ).send({ from: deployer });

    await this.DataRegistryProxyInstance.methods.publishDataPoint(
      this.terms.marketObjectCodeRateReset,
      eventTime,
      web3.utils.padLeft(web3.utils.numberToHex(this.resetRate), 64)
    ).send({ from: actor });

    const { events } = await this.ANNActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();

    // compute expected next state
    const projectedNextState = await this.ANNEngineInstance.methods.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      web3.eth.abi.encodeParameter('int256', this.resetRate)
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate, eventTime.toString());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });
});
