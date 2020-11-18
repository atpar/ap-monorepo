/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getDefaultTestTerms } = require('../../../helper/ACTUS/tests');
const { parseEventSchedule, decodeEvent, sortEvents } = require('../../../helper/utils/schedule');
const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');


describe('CERTFEngine', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.terms = await getDefaultTestTerms('CERTF');
  });


  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    // fix for new schedule generation
    terms.cycleAnchorDateOfInterestPayment = terms.cycleAnchorDateOfPrincipalRedemption;
    terms.cycleOfInterestPayment = terms.cycleOfPrincipalRedemption;

    const schedule = [];

    schedule.push(... await this.CERTFEngineInstance.methods.computeNonCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd
    ).call());
    schedule.push(... await this.CERTFEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('COF')
    ).call());
    schedule.push(... await this.CERTFEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('COP')
    ).call());
    schedule.push(... await this.CERTFEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('REF')
    ).call());
    schedule.push(... await this.CERTFEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('REP')
    ).call());
    schedule.push(... await this.CERTFEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('EXE')
    ).call());

    return sortEvents(schedule);
  }

  it('should yield the initial contract state', async () => {
    const initialState = await this.CERTFEngineInstance.methods.computeInitialState(this.terms).call();
    assert.ok(Number(initialState['statusDate']) === Number(this.terms['statusDate']));
  });

  it('should yield the next next contract state and the contract events', async () => {
    const initialState = await this.CERTFEngineInstance.methods.computeInitialState(this.terms).call();
    const schedule = await this.CERTFEngineInstance.methods.computeNonCyclicScheduleSegment(
      this.terms,
      0,
      this.terms.maturityDate || 1623448800 // tMax
    ).call();
    const nextState = await this.CERTFEngineInstance.methods.computeStateForEvent(
      this.terms,
      initialState,
      schedule[0],
      web3.utils.toHex(decodeEvent(schedule[0]).scheduleTime)
    ).call();

    assert.strictEqual(String(nextState.statusDate), decodeEvent(schedule[0]).scheduleTime);
  });

  it('should yield correct segment of events', async () => {
    const completeEventSchedule = parseEventSchedule(await computeEventScheduleSegment(
      this.terms,
      0,
      this.terms.maturityDate
    ));

    let schedule = [];
    let statusDate = this.terms['statusDate'];
    let timestamp = this.terms['statusDate'] + (this.terms['maturityDate'] - this.terms['statusDate']) / 4;

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    statusDate = timestamp;
    timestamp = this.terms['statusDate'] + (this.terms['maturityDate'] - this.terms['statusDate']) / 2;

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    statusDate = timestamp;
    timestamp = this.terms['maturityDate'];

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    schedule = parseEventSchedule(sortEvents(schedule));

    assert.ok(schedule.toString() === completeEventSchedule.toString());
  });

  it('should yield the state of each event', async () => {
    const initialState = await this.CERTFEngineInstance.methods.computeInitialState(this.terms).call();

    const schedule = await computeEventScheduleSegment(
      this.terms,
      0,
      this.terms.maturityDate
    );

    let state = initialState;

    for (_event of schedule) {
      const nextState = await this.CERTFEngineInstance.methods.computeStateForEvent(
        this.terms,
        state,
        _event,
        web3.utils.toHex(decodeEvent(_event).scheduleTime)
      ).call();

      state = nextState;
    }
  });
});
