/* global artifacts, before, beforeEach, contract, describe, it, web3 */
const { getDefaultTestTerms } = require('../../helper/tests');
const { parseEventSchedule, decodeEvent, sortEvents } = require('../../helper/schedule');

const STKEngine = artifacts.require('STKEngine.sol');


contract('STKEngine', () => {

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    const schedule = [];

    schedule.push(... await this.STKEngineInstance.computeNonCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd
    ));
    schedule.push(... await this.STKEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      // TODO: Replace hardcoded event values ids with names (#useEventName)
      14 // DIF (#useEventName)
    ));

    return sortEvents(schedule);
  }

  before(async () => {
    this.STKEngineInstance = await STKEngine.new();
    this.terms = await getDefaultTestTerms('STK');
  });

  it('should yield the initial contract state', async () => {
    const initialState = await this.STKEngineInstance.computeInitialState(this.terms);
    assert.isTrue(Number(initialState['statusDate']) === Number(this.terms['statusDate']));
  });

  it('should yield the next next contract state and the contract events', async () => {
    const initialState = await this.STKEngineInstance.computeInitialState(this.terms);
    this.terms.cycleAnchorDateOfDividend = this.terms.issueDate;
    this.terms.cycleOfDividend = { i: 1, p: 5 /*'Y'*/, s: 0, isSet: true};
    const endDate = this.terms.cycleAnchorDateOfDividend + 3 * (365 + 1) * 24 * 3600;
    assert.isTrue(this.terms.cycleAnchorDateOfDividend > 0);

    const schedule = await computeEventScheduleSegment(
        this.terms,
        this.terms.cycleAnchorDateOfDividend,
        endDate
    );
    assert.equal(schedule.length, 3);

    const nextState = await this.STKEngineInstance.computeStateForEvent(
      this.terms,
      initialState,
      schedule[0],
      web3.utils.toHex(decodeEvent(schedule[0]).scheduleTime)
    );

    assert.equal(Number(nextState.statusDate), decodeEvent(schedule[0]).scheduleTime);
  });

  xit('should yield correct segment of events', async () => {
    const completeEventSchedule = parseEventSchedule(await computeEventScheduleSegment(
      this.terms,
      this.terms.contractDealDate,
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

    assert.isTrue(schedule.toString() === completeEventSchedule.toString());
  });

  it('should yield the state of each event', async () => {
    const initialState = await this.STKEngineInstance.computeInitialState(this.terms);
    this.terms.cycleAnchorDateOfDividend = this.terms.issueDate;
    this.terms.cycleOfDividend = { i: 1, p: 5 /*'Y'*/, s: 0, isSet: true};
    const endDate = this.terms.cycleAnchorDateOfDividend + 3 * (365 + 1) * 24 * 3600;
    assert.isTrue(this.terms.cycleAnchorDateOfDividend > 0);

    const schedule = await computeEventScheduleSegment(
      this.terms,
      this.terms.cycleAnchorDateOfDividend,
      endDate
    );
    assert.equal(schedule.length, 3);

    let state = initialState;

    for (_event of schedule) {
      const nextState = await this.STKEngineInstance.computeStateForEvent(
        this.terms,
        state,
        _event,
        web3.utils.toHex(decodeEvent(_event).scheduleTime)
      );

      state = nextState;
    }
  });
});
