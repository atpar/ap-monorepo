/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain');
const { expectEvent, generateSchedule, ZERO_ADDRESS, web3ResponseToState } = require('../../../helper/utils/utils');
const { encodeEvent } = require('../../../helper/utils/schedule');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');


describe('STKActor', () => {
  let admin, creatorObligor, creatorBeneficiary, actor, nobody;
  const toBN = web3.utils.toBN;

  const getEventTime = async (_event, terms) => {
    return Number(
      await this.STKEngineInstance.methods.computeEventTimeForEvent(
        _event,
        terms.businessDayConvention,
        terms.calendar,
        0
      ).call()
    );
  }

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [admin, , creatorObligor, creatorBeneficiary, actor, nobody] = self.accounts;

    self.ownership = {
      creatorObligor,
      creatorBeneficiary,
      counterpartyObligor: ZERO_ADDRESS,
      counterpartyBeneficiary: ZERO_ADDRESS,
    };

    self.terms = Object.assign({}, require('../../../helper/terms/STKTerms-complex.json'));
    const issueEvent = encodeEvent(eventIndex('DIP'), (await web3.eth.getBlock('latest')).timestamp);
    const nextBusinessDay = await getEventTime(issueEvent, self.terms);
    self.terms.issueDate = nextBusinessDay;
    self.terms.statusDate = self.terms.issueDate + 1;
    self.terms.cycleAnchorDateOfDividend = self.terms.issueDate + 10;
    self.terms.cycleOfDividend = { "i": 1, "p": 0, "s": 1, "isSet": true }; // every day

    // generate (two) DIF events for two days
    const tMax = 1 * self.terms.issueDate + 48 * 3600;
    self.schedule = await generateSchedule(self.STKEngineInstance, self.terms, tMax, [eventIndex('DIF')]);
    assert.strictEqual(this.schedule.length, 3);
    self.schedule.shift(); // skip IssueDate event

    self.state = web3ResponseToState(
      await self.STKEngineInstance.methods.computeInitialState(self.terms).call()
    );

    const { events } = await self.STKActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.STKEngineInstance.options.address,
      ZERO_ADDRESS
    ).send({ from: nobody });
    expectEvent(events, 'InitializedAsset');

    self.assetId = events.InitializedAsset.returnValues.assetId;

    // prepare external data for DIF events
    const extData = {
      DIP: { index: 1, values: [ 10000000, 11000000 ] }, // dividendPaymentAmount
    }
    const dp = {
      provider: '0x' + toBN(this.assetId).add(toBN(extData.DIP.index)).toString(16),
      dates:
        [
          await getEventTime(self.schedule[0], self.terms),
          await getEventTime(self.schedule[1], self.terms),
        ],
      values: [
        web3.utils.padLeft(web3.utils.numberToHex(web3.utils.toWei(String(extData.DIP.values[0]))), 64),
        web3.utils.padLeft(web3.utils.numberToHex(web3.utils.toWei(String(extData.DIP.values[1]))), 64),
      ]
    };
    self.dipaValues = dp.values;
    const registry = self.DataRegistryProxyInstance;
    await registry.methods.setDataProvider(dp.provider, actor).send({ from: admin });
    await registry.methods.publishDataPoint(dp.provider, dp.dates[0], dp.values[0]).send({ from: actor });
    await registry.methods.publishDataPoint(dp.provider, dp.dates[1], dp.values[1]).send({ from: actor });
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should process the next cyclic event', async () => {
    const doProgressAndCheck = async (dipa) => {
      const _event = await this.STKRegistryInstance.methods.getNextScheduledEvent(
        web3.utils.toHex(this.assetId)
      ).call();
      const eventTime = await getEventTime(_event, this.terms);

      // progress asset state
      await mineBlock(eventTime);
      const { events } = await this.STKActorInstance.methods.progress(
        web3.utils.toHex(this.assetId)
      ).send({ from: creatorObligor });
      expectEvent(events, 'ProgressedAsset');
      const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

      const storedNextState = web3ResponseToState(
        await this.STKRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
      );
      const projectedNextState = web3ResponseToState(
        await this.STKEngineInstance.methods.computeStateForEvent(
          this.terms,
          this.state,
          _event,
          dipa
        ).call()
      );
      const storedNextEvent = await this.STKRegistryInstance.methods.getNextScheduledEvent(
        web3.utils.toHex(this.assetId)
      ).call();

      assert.strictEqual(emittedAssetId, this.assetId);
      assert.notStrictEqual(storedNextEvent, _event);
      assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
      assert.deepStrictEqual(storedNextState, projectedNextState);
    };

    await this.dipaValues.reduce(
      // one by one
      (promiseChain, dipa) => promiseChain.then(() => doProgressAndCheck(dipa)),
      Promise.resolve()
    );
  });
});
