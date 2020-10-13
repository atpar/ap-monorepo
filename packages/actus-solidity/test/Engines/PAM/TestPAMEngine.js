const PAMEngine = artifacts.require('PAMEngine.sol');

const { getDefaultTestTerms } = require('../../helper/tests');
const { parseEventSchedule, decodeEvent, sortEvents } = require('../../helper/schedule');

// TODO: Replace hardcoded event values ids with names (#useEventName)

contract('PAMEngine', () => {

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    const schedule = [];

    schedule.push(... await this.PAMEngineInstance.computeNonCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      5 // FP #useEventName
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      11 // IPCI #useEventName
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      10 // IP #useEventName
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      6 // PR #useEventName
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      13 // RR #useEventName
    ));


    return sortEvents(schedule);
  }

  before(async () => {
    this.PAMEngineInstance = await PAMEngine.new();
    this.terms = await getDefaultTestTerms('PAM');
  });

  it('should yield the initial contract state', async () => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.terms);
    assert.isTrue(Number(initialState['statusDate']) === Number(this.terms['statusDate']));
  });

  it('should yield the next next contract state and the contract events', async () => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.terms);
    const schedule = await this.PAMEngineInstance.computeNonCyclicScheduleSegment(
      this.terms,
      this.terms.contractDealDate,
      this.terms.maturityDate
    )
    const nextState = await this.PAMEngineInstance.computeStateForEvent(
      this.terms,
      initialState,
      schedule[0],
      web3.utils.toHex(decodeEvent(schedule[0]).scheduleTime)
    );

    assert.equal(Number(nextState.statusDate), decodeEvent(schedule[0]).scheduleTime);
  });

  it('should yield correct segment of events', async () => {
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
    const initialState = await this.PAMEngineInstance.computeInitialState(this.terms);

    const schedule = await computeEventScheduleSegment(
      this.terms,
      this.terms.contractDealDate,
      this.terms.maturityDate
    );

    let state = initialState;

    for (_event of schedule) {
      const nextState = await this.PAMEngineInstance.computeStateForEvent(
        this.terms,
        state,
        _event,
        web3.utils.toHex(decodeEvent(_event).scheduleTime)
      );

      state = nextState;
    }
  });
});
