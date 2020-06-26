const PAMEngine = artifacts.require('PAMEngine.sol');

const { getTestCases, compareTestResults } = require('../../helper/tests');
const { parseToTestEvent } = require('../../helper/parser');
const { decodeEvent, sortEvents } = require('../../helper/schedule');

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
      3 // FP
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      10 // IPCI
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      9 // IP
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      4 // PR
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      13 // RR
    ));
    
    return sortEvents(schedule);
  }

  before(async () => {    
    this.PAMEngineInstance = await PAMEngine.new();
    this.testCases = await getTestCases('PAM');
  });

  const evaluateEventSchedule = async (terms, externalDataObject) => {
    const initialState = await this.PAMEngineInstance.computeInitialState(terms);
    const schedule = await computeEventScheduleSegment(
      terms,
      terms.contractDealDate,
      terms.maturityDate
    );

    const evaluatedSchedule = [];
    let state = initialState;

    let rrIndex = 0;

    for (_event of schedule) {
      const { eventType, scheduleTime } = decodeEvent(_event);

      if (scheduleTime == 0) { break; }
      
      let externalData = scheduleTime;

      if (eventType === 13) {
        externalData = web3.utils.toWei(externalDataObject['interestRateValues'][rrIndex]);
        rrIndex++;
      }

      const payoff = await this.PAMEngineInstance.computePayoffForEvent(
        terms,
        state,
        _event,
        web3.utils.toHex(externalData)
      );
      
      const nextState = await this.PAMEngineInstance.computeStateForEvent(
        terms, 
        state, 
        _event, 
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      );

      state = nextState;
      if (eventType == 16) {console.log(payoff, nextState)}
        
      const eventTime = await this.PAMEngineInstance.computeEventTimeForEvent(
        _event,
        terms.businessDayConvention,
        terms.calendar,
        terms.maturityDate
      );

      evaluatedSchedule.push(parseToTestEvent(eventType, eventTime, payoff, state));
    }

    return evaluatedSchedule;
  };
 
  it('should yield the expected evaluated contract schedule for test PAM10001', async () => {
    const testDetails = this.testCases['10001'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10002', async () => {
    const testDetails = this.testCases['10002'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10003', async () => {
    const testDetails = this.testCases['10003'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);
  
    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10004', async () => {
    const testDetails = this.testCases['10004'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'])

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10005', async () => {
    const testDetails = this.testCases['10005'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10006', async () => {
    const testDetails = this.testCases['10006'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10007', async () => {
    const testDetails = this.testCases['10007'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10008', async () => {
    const testDetails = this.testCases['10008'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10009', async () => {
    const testDetails = this.testCases['10009'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10010', async () => {
    const testDetails = this.testCases['10010'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10011', async () => {
    const testDetails = this.testCases['10011'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  }); 
  
  // TODO: Purchase/Termination not supported
  // it('should yield the expected evaluated contract schedule for test PAM10012', async () => {
  //   const testDetails = this.testCases['10012'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });  

  // TODO: Precision Error
  // it('should yield the expected evaluated contract schedule for test PAM10013', async () => {
  //   const testDetails = this.testCases['10013'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });

  it('should yield the expected evaluated contract schedule for test PAM10014', async () => {
    const testDetails = this.testCases['10014'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10015', async () => {
    const testDetails = this.testCases['10015'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10016', async () => {
    const testDetails = this.testCases['10016'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10017', async () => {
    const testDetails = this.testCases['10017'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });
 
  it('should yield the expected evaluated contract schedule for test PAM10018', async () => {
    const testDetails = this.testCases['10018'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);    

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  // TODO: Purchase/Termination not supported
  // it('should yield the expected evaluated contract schedule for test PAM10019', async () => {
  //   const testDetails = this.testCases['10019'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });

  it('should yield the expected evaluated contract schedule for test PAM10020', async () => {
    const testDetails = this.testCases['10020'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails['externalData']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10021', async () => {
    const testDetails = this.testCases['10021'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails['externalData']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test PAM10022', async () => {
    const testDetails = this.testCases['10022'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails['externalData']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });
 
  it('should yield the expected evaluated contract schedule for test PAM10023', async () => {
    const testDetails = this.testCases['10023'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails['externalData']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  // TODO: A365 issue
  // it('should yield the expected evaluated contract schedule for test PAM10024', async () => {
  //   const testDetails = this.testCases['10024'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });
});
