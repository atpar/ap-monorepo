/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/blockchain');
const { generateSchedule, expectEvent, ZERO_ADDRESS } = require('../../../helper/utils');


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
    self.terms = require('../../../helper/terms/PAMTerms-external-data.json');

    // only want RR events in the schedules
    self.schedule = (
        await generateSchedule(self.PAMEngineInstance, self.terms)).filter((event) => event.startsWith('0x0d')
    );

    const { events } = await self.PAMActorInstance.methods.initialize(
        self.terms,
        self.schedule,
        self.ownership,
        self.PAMEngineInstance.options.address,
        ZERO_ADDRESS
    ).send({ from: actor });
    expectEvent(events,'InitializedAsset');
    self.assetId = events.InitializedAsset.returnValues.assetId;

    self.state = await self.PAMRegistryInstance.methods.getState(web3.utils.toHex(self.assetId)).call();

    self.resetRate = web3.utils.toWei('100'); // TODO: investigate overflow if set to non zero
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should process next state with external rate', async () => {
    const _event = await this.PAMRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    await mineBlock(Number(eventTime));

    await this.DataRegistryInstance.methods.setDataProvider(
        this.terms.marketObjectCodeRateReset,
        actor
    ).send({ from: deployer });

    await this.DataRegistryInstance.methods.publishDataPoint(
        this.terms.marketObjectCodeRateReset,
        eventTime,
        web3.utils.padLeft(web3.utils.numberToHex(this.resetRate), 64)
    ).send({ from: actor });

    const { events } = await this.PAMActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.utils.padLeft(web3.utils.numberToHex(this.resetRate), 64)
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate, eventTime.toString());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });
});
