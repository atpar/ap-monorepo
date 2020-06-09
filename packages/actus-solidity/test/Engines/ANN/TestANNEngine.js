const ANNEngine = artifacts.require('ANNEngine.sol');

const { getDefaultTestTerms } = require('../../helper/tests');
const { parseEventSchedule, decodeEvent, sortEvents } = require('../../helper/schedule');


contract('ANNEngine', () => {

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    // fix for new schedule generation
    terms.cycleAnchorDateOfInterestPayment = terms.cycleAnchorDateOfPrincipalRedemption;
    terms.cycleOfInterestPayment = terms.cycleOfPrincipalRedemption;

    const schedule = [];
      
    schedule.push(... await this.ANNEngineInstance.computeNonCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd
    ));
    schedule.push(... await this.ANNEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      2 // FP
    ));
    schedule.push(... await this.ANNEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      9 // IPCI
    ));
    schedule.push(... await this.ANNEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      8 // IP
    ));
    schedule.push(... await this.ANNEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      3 // PR
    ));
    schedule.push(... await this.ANNEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      12 // RR
    ));
    
    return sortEvents(schedule);
  }

  before(async () => {        
    this.ANNEngineInstance = await ANNEngine.new();
    this.terms = await getDefaultTestTerms('ANN');
  });

  it('should yield the initial contract state', async () => {
    const initialState = await this.ANNEngineInstance.computeInitialState(this.terms);
    assert.isTrue(Number(initialState['statusDate']) === Number(this.terms['statusDate']));
  });

  it('should yield the next next contract state and the contract events', async() => {
    const initialState = await this.ANNEngineInstance.computeInitialState(this.terms);
    const schedule = await this.ANNEngineInstance.computeNonCyclicScheduleSegment(
      this.terms,
      this.terms.contractDealDate,
      this.terms.maturityDate
    )
    const nextState = await this.ANNEngineInstance.computeStateForEvent(
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
    const initialState = await this.ANNEngineInstance.computeInitialState(this.terms);

    const schedule = await computeEventScheduleSegment(
      this.terms,
      this.terms.contractDealDate,
      this.terms.maturityDate
    );

    let state = initialState;

    for (_event of schedule) {
      const nextState = await this.ANNEngineInstance.computeStateForEvent(
        this.terms,
        state,
        _event,
        web3.utils.toHex(decodeEvent(_event).scheduleTime)
      );

      state = nextState;
    }
  });
});
