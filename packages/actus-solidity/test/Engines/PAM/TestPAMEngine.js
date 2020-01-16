const PAMEngine = artifacts.require('PAMEngine.sol');

const { getDefaultTestTerms } = require('../../helper/tests');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('../../helper/parser');
const { 
  parseEventSchedule,
  decodeEvent,
  sortEvents,
  removeNullEvents
} = require('../../helper/schedule');


contract('PAMEngine', () => {

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    const generatingTerms = parseTermsToGeneratingTerms(terms);
    const _eventSchedule = [];
      
    _eventSchedule.push(... await this.PAMEngineInstance.computeNonCyclicScheduleSegment(
      generatingTerms,
      segmentStart,
      segmentEnd
    ));
    _eventSchedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      generatingTerms,
      segmentStart,
      segmentEnd,
      4 // FP
    ));
    _eventSchedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      7 // IPCI
    ));
    _eventSchedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      generatingTerms,
      segmentStart,
      segmentEnd,
      8 // IP
    ));
    _eventSchedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      generatingTerms,
      segmentStart,
      segmentEnd,
      15 // PR
    ));
    _eventSchedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      generatingTerms,
      segmentStart,
      segmentEnd,
      18 // RR
    ));
    
    
    return sortEvents(removeNullEvents(_eventSchedule));
  }

  before(async () => {        
    this.PAMEngineInstance = await PAMEngine.new();
    this.terms = await getDefaultTestTerms('PAM');
    this.generatingTerms = parseTermsToGeneratingTerms(this.terms);
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
  });

  it('should yield the initial contract state', async () => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    assert.isTrue(Number(initialState['statusDate']) === Number(this.generatingTerms['statusDate']));
  });

  it('should yield the next next contract state and the contract events', async() => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    const _eventSchedule = await this.PAMEngineInstance.computeNonCyclicScheduleSegment(
      this.generatingTerms,
      this.generatingTerms.contractDealDate,
      this.generatingTerms.maturityDate
    )
    const nextState = await this.PAMEngineInstance.computeStateForEvent(
      this.lifecycleTerms,
      initialState,
      _eventSchedule[0],
      web3.utils.toHex(decodeEvent(_eventSchedule[0]).scheduleTime)
    );

    assert.equal(Number(nextState.statusDate), decodeEvent(_eventSchedule[0]).scheduleTime);
  });

  it('should yield correct segment of events', async () => {
    const completeEventSchedule = parseEventSchedule(await computeEventScheduleSegment(
      this.generatingTerms,
      this.generatingTerms.contractDealDate,
      this.generatingTerms.maturityDate
    ));

    let _eventSchedule = [];
    let statusDate = this.generatingTerms['statusDate'];
    let timestamp = this.generatingTerms['statusDate'] + (this.generatingTerms['maturityDate'] - this.generatingTerms['statusDate']) / 4;

    _eventSchedule.push(... await computeEventScheduleSegment(
      this.generatingTerms, 
      statusDate,
      timestamp
    ));

    statusDate = timestamp;
    timestamp = this.generatingTerms['statusDate'] + (this.generatingTerms['maturityDate'] - this.generatingTerms['statusDate']) / 2;

    _eventSchedule.push(... await computeEventScheduleSegment(
    this.generatingTerms, 
    statusDate,
      timestamp
    ));
    
    statusDate = timestamp;
    timestamp = this.generatingTerms['maturityDate'];

    _eventSchedule.push(... await computeEventScheduleSegment(
      this.generatingTerms, 
      statusDate,
      timestamp
    ));
    
    _eventSchedule = parseEventSchedule(sortEvents(_eventSchedule));
    
    assert.isTrue(_eventSchedule.toString() === completeEventSchedule.toString());
  });

  it('should yield the state of each event', async () => {
    const initialState = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);

    const _eventSchedule = removeNullEvents(await computeEventScheduleSegment(
      this.generatingTerms,
      this.generatingTerms.contractDealDate,
      this.generatingTerms.maturityDate
    ));

    let state = initialState;

    for (_event of _eventSchedule) {
      const nextState = await this.PAMEngineInstance.computeStateForEvent(
        this.lifecycleTerms,
        state,
        _event,
        web3.utils.toHex(decodeEvent(_event).scheduleTime)
      );

      state = nextState;
    }
  })

  // it('should yield the state for RR', async () => {
  //   const initialState = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    
  //   state = initialState;

  //   const nextState = await this.PAMEngineInstance.computeStateForEvent(
  //     this.lifecycleTerms,
  //     state,
  //     '0x1200000000000000000000000000000000000000000000000000000051922D80',
  //     web3.utils.toHex(555555533333)
  //   );
  // });
});
