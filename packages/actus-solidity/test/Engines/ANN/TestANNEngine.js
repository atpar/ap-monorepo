const ANNEngine = artifacts.require('ANNEngine.sol');

const { getDefaultTestTerms } = require('../../helper/tests');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('../../helper/parser');
const { parseEventSchedule, decodeEvent, sortEvents } = require('../../helper/schedule');


contract('ANNEngine', () => {

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    const generatingTerms = parseTermsToGeneratingTerms(terms);

    // fix for new schedule generation
    generatingTerms.cycleAnchorDateOfInterestPayment = generatingTerms.cycleAnchorDateOfPrincipalRedemption;
    generatingTerms.cycleOfInterestPayment = generatingTerms.cycleOfPrincipalRedemption;

    const schedule = [];
      
    schedule.push(... await this.ANNEngineInstance.computeNonCyclicScheduleSegment(
      generatingTerms,
      segmentStart,
      segmentEnd
    ));
    schedule.push(... await this.ANNEngineInstance.computeCyclicScheduleSegment(
      generatingTerms,
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
      generatingTerms,
      segmentStart,
      segmentEnd,
      8 // IP
    ));
    schedule.push(... await this.ANNEngineInstance.computeCyclicScheduleSegment(
      generatingTerms,
      segmentStart,
      segmentEnd,
      3 // PR
    ));
    schedule.push(... await this.ANNEngineInstance.computeCyclicScheduleSegment(
      generatingTerms,
      segmentStart,
      segmentEnd,
      12 // RR
    ));
    
    return sortEvents(schedule);
  }

  before(async () => {        
    this.ANNEngineInstance = await ANNEngine.new();
    this.terms = await getDefaultTestTerms('ANN');
    this.generatingTerms = parseTermsToGeneratingTerms(this.terms);
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
  });

  it('should yield the initial contract state', async () => {
    const initialState = await this.ANNEngineInstance.computeInitialState(this.lifecycleTerms);
    assert.isTrue(Number(initialState['statusDate']) === Number(this.generatingTerms['statusDate']));
  });

  it('should yield the next next contract state and the contract events', async() => {
    const initialState = await this.ANNEngineInstance.computeInitialState(this.lifecycleTerms);
    const schedule = await this.ANNEngineInstance.computeNonCyclicScheduleSegment(
      this.generatingTerms,
      this.generatingTerms.contractDealDate,
      this.generatingTerms.maturityDate
    )
    const nextState = await this.ANNEngineInstance.computeStateForEvent(
      this.lifecycleTerms,
      initialState,
      schedule[0],
      web3.utils.toHex(decodeEvent(schedule[0]).scheduleTime)
    );

    assert.equal(Number(nextState.statusDate), decodeEvent(schedule[0]).scheduleTime);
  });

  it('should yield correct segment of events', async () => {
    const completeEventSchedule = parseEventSchedule(await computeEventScheduleSegment(
      this.generatingTerms,
      this.generatingTerms.contractDealDate,
      this.generatingTerms.maturityDate
    ));

    let schedule = [];
    let statusDate = this.generatingTerms['statusDate'];
    let timestamp = this.generatingTerms['statusDate'] + (this.generatingTerms['maturityDate'] - this.generatingTerms['statusDate']) / 4;

    schedule.push(... await computeEventScheduleSegment(
      this.generatingTerms, 
      statusDate,
      timestamp
    ));

    statusDate = timestamp;
    timestamp = this.generatingTerms['statusDate'] + (this.generatingTerms['maturityDate'] - this.generatingTerms['statusDate']) / 2;

    schedule.push(... await computeEventScheduleSegment(
    this.generatingTerms, 
    statusDate,
      timestamp
    ));
    
    statusDate = timestamp;
    timestamp = this.generatingTerms['maturityDate'];

    schedule.push(... await computeEventScheduleSegment(
      this.generatingTerms, 
      statusDate,
      timestamp
    ));
    
    schedule = parseEventSchedule(sortEvents(schedule));
    
    assert.isTrue(schedule.toString() === completeEventSchedule.toString());
  });

  it('should yield the state of each event', async () => {
    const initialState = await this.ANNEngineInstance.computeInitialState(this.lifecycleTerms);

    const schedule = await computeEventScheduleSegment(
      this.generatingTerms,
      this.generatingTerms.contractDealDate,
      this.generatingTerms.maturityDate
    );

    let state = initialState;

    for (_event of schedule) {
      const nextState = await this.ANNEngineInstance.computeStateForEvent(
        this.lifecycleTerms,
        state,
        _event,
        web3.utils.toHex(decodeEvent(_event).scheduleTime)
      );

      state = nextState;
    }
  });
});
