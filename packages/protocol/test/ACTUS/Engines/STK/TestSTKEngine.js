/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getDefaultTestTerms } = require('../../../helper/ACTUS/tests');
const { parseEventSchedule, encodeEvent, decodeEvent, sortEvents } = require('../../../helper/utils/schedule');
const { web3ResponseToState } = require('../../../helper/utils/utils');
const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');


describe('STKEngine', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.terms = await getDefaultTestTerms('STK');
  });

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    const schedule = [];

    schedule.push(... await this.STKEngineInstance.methods.computeNonCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd
    ).call());
    schedule.push(... await this.STKEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('DIF')
    ).call());

    return sortEvents(schedule);
  }

  it('should yield the initial contract state', async () => {
    const initialState = await this.STKEngineInstance.methods.computeInitialState(this.terms).call();
    assert.ok(Number(initialState['statusDate']) === Number(this.terms['statusDate']));
  });

  it('should yield the next next contract state and the contract events', async () => {
    const initialState = await this.STKEngineInstance.methods.computeInitialState(this.terms).call();
    this.terms.cycleAnchorDateOfDividend = this.terms.issueDate;
    this.terms.cycleOfDividend = { i: 1, p: 5 /*'Y'*/, s: 0, isSet: true};
    const endDate = this.terms.cycleAnchorDateOfDividend + 3 * (365 + 1) * 24 * 3600;
    assert.ok(this.terms.cycleAnchorDateOfDividend > 0);

    const schedule = await computeEventScheduleSegment(
      this.terms,
      this.terms.cycleAnchorDateOfDividend,
      endDate
    );
    assert.strictEqual(schedule.length, 4);

    const nextState = await this.STKEngineInstance.methods.computeStateForEvent(
      this.terms,
      initialState,
      schedule[0],
      web3.utils.toHex(decodeEvent(schedule[0]).scheduleTime)
    ).call();

    assert.strictEqual(String(nextState.statusDate), decodeEvent(schedule[0]).scheduleTime);
  });

  it('should yield correct segment of events', async () => {
    const endDate = this.terms.cycleAnchorDateOfDividend + 365 * 24 * 3600;
    const completeEventSchedule = parseEventSchedule(await computeEventScheduleSegment(
      this.terms,
      this.terms.contractDealDate,
      endDate
    ));

    let schedule = [];
    let statusDate = this.terms['statusDate'];
    let timestamp = this.terms['statusDate'] + (endDate - this.terms['statusDate']) / 4;

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    statusDate = timestamp;
    timestamp = this.terms['statusDate'] + (endDate - this.terms['statusDate']) / 2;

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    statusDate = timestamp;
    timestamp = endDate;

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    schedule = parseEventSchedule(sortEvents(schedule));

    assert.ok(schedule.length > 0);
    assert.ok(schedule.toString() === completeEventSchedule.toString());
  });

  it('should yield the state of each event', async () => {
    const initialState = await this.STKEngineInstance.methods.computeInitialState(this.terms).call();
    this.terms.cycleAnchorDateOfDividend = this.terms.issueDate;
    this.terms.cycleOfDividend = { i: 1, p: 5 /*'Y'*/, s: 0, isSet: true};
    const endDate = this.terms.cycleAnchorDateOfDividend + 3 * (365 + 1) * 24 * 3600;
    assert.ok(this.terms.cycleAnchorDateOfDividend > 0);

    const schedule = await computeEventScheduleSegment(
      this.terms,
      this.terms.cycleAnchorDateOfDividend,
      endDate
    );
    assert.strictEqual(schedule.length, 4);

    let state = initialState;

    for (_event of schedule) {
      const nextState = await this.STKEngineInstance.methods.computeStateForEvent(
        this.terms,
        state,
        _event,
        web3.utils.toHex(decodeEvent(_event).scheduleTime)
      ).call();

      state = nextState;
    }
  });

  describe('computePayoffForEvent function for REP event', () => {
    before(async () => {
      const scheduleTime = 100;
      const event = encodeEvent(eventIndex('REP'), scheduleTime);

      const externalData = '0x000000000000000000000000000000000000000000000015af1d78b58c400000'; // 400e+18

      const getSate = async (terms) => {
        const state = web3ResponseToState(await this.STKEngineInstance.methods.computeInitialState(terms).call());
        state.exerciseQuantity = '1000'+'000000000000000000';
        state.statusDate = '100';
        return state;
      }

      this.terms.redeemableByIssuer = 0;
      this.payoffIfRedeemable = await this.STKEngineInstance.methods.computePayoffForEvent(
        this.terms,
        await getSate(this.terms),
        event,
        externalData
      ).call();

      this.terms.redeemableByIssuer = 1;
      this.payoffIfNotRedeemable = await this.STKEngineInstance.methods.computePayoffForEvent(
        this.terms,
        await getSate(this.terms),
        event,
        externalData
      ).call();
    });

    describe('If redeemableByIssuer is set in terms', () => {
      it('Should yield redemption payment amount', async () => {
        assert.strictEqual(this.payoffIfRedeemable.toString(), '400000' + '000000000000000000');
      });
    });

    describe('If redeemableByIssuer is not set in terms', () => {
      it('Should not yield redemption payment amount', async () => {
        assert.strictEqual(this.payoffIfNotRedeemable.toString(), '0');
      });
    });
  });

  describe('computeStateForEvent function for REF event', () => {
    before(async () => {
      const scheduleTime = 100;
      const event = encodeEvent(eventIndex('REF'), scheduleTime);

      const externalData = '0x00000000000000000000000000000000000000000052b7d2dcc80cd2e4000000'; // 100*10e6 * 10e18

      const getSate = async (terms) => {
        const state = web3ResponseToState(await this.STKEngineInstance.methods.computeInitialState(terms).call());
        state.exerciseQuantity = '0';
        state.statusDate = '50';
        return state;
      }

      this.terms.redeemableByIssuer = 0;
      this.stateIfRedeemable = await this.STKEngineInstance.methods.computeStateForEvent(
        this.terms,
        await getSate(this.terms),
        event,
        externalData
      ).call();

      this.terms.redeemableByIssuer = 1;
      this.stateIfNotRedeemable = await this.STKEngineInstance.methods.computeStateForEvent(
        this.terms,
        await getSate(this.terms),
        event,
        externalData
      ).call();
    });

    describe('If redeemableByIssuer is set in terms', () => {
      it('Should set exerciseQuantity', async () => {
        assert.strictEqual(this.stateIfRedeemable.statusDate.toString(), '100');
        assert.strictEqual(this.stateIfRedeemable.exerciseQuantity.toString(), '100'+'000000'+'000000000000000000');
      });
    });

    describe('If redeemableByIssuer is not set in terms', () => {
      it('Should not set exerciseQuantity', async () => {
        assert.strictEqual(this.stateIfNotRedeemable.statusDate.toString(), '100');
        assert.strictEqual(this.stateIfNotRedeemable.exerciseQuantity.toString(), '0');
      });
    });
  });
});
