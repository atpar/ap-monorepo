const PAMEngine = artifacts.require('PAMEngine.sol');

const { getTestCases, compareTestResults } = require('../../helper/tests');
const { parseToTestEvent, isoToUnix } = require('../../helper/parser');
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
      5 // FP
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      11 // IPCI
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      10 // IP
    ));
    schedule.push(... await this.PAMEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      6 // PR
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

    for (_event of schedule) {
      const { eventType, scheduleTime } = decodeEvent(_event);

      if (scheduleTime == 0) { break; }

      let externalData = web3.utils.toHex('0');

      if (eventType === 13) {
        const marketObjectCode = web3.utils.hexToAscii(terms.marketObjectCodeRateReset);
        if (externalDataObject[marketObjectCode] == undefined) {
          throw new Error('No external data found for ' + marketObjectCode + '.');
        }
        const dataPoint = externalDataObject[marketObjectCode].data.find(({ timestamp }) => {
          return String(isoToUnix(timestamp)) === String(scheduleTime);
        });
        if (dataPoint == undefined) { throw new Error('No data point for event.'); }
        externalData = web3.utils.toWei(dataPoint.value);
      }

      const payoff = await this.PAMEngineInstance.computePayoffForEvent(
        terms,
        state,
        _event,
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      );

      const nextState = await this.PAMEngineInstance.computeStateForEvent(
        terms,
        state,
        _event,
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      );

      state = nextState;

      // if (eventType == 16) {console.log(payoff, nextState)}

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

  it('should yield the expected evaluated contract schedule for test pam01', async () => {
    const testDetails = this.testCases['pam01'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam02', async () => {
    const testDetails = this.testCases['pam02'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam03', async () => {
    const testDetails = this.testCases['pam03'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam04', async () => {
    const testDetails = this.testCases['pam04'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'])

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam05', async () => {
    const testDetails = this.testCases['pam05'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam06', async () => {
    const testDetails = this.testCases['pam06'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam07', async () => {
    const testDetails = this.testCases['pam07'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam08', async () => {
    const testDetails = this.testCases['pam08'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam09', async () => {
    const testDetails = this.testCases['pam09'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam10', async () => {
    const testDetails = this.testCases['pam10'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam11', async () => {
    const testDetails = this.testCases['pam11'];
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

  it('should yield the expected evaluated contract schedule for test pam14', async () => {
    const testDetails = this.testCases['pam14'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam15', async () => {
    const testDetails = this.testCases['pam15'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam16', async () => {
    const testDetails = this.testCases['pam16'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam17', async () => {
    const testDetails = this.testCases['pam17'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test pam18', async () => {
    const testDetails = this.testCases['pam18'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  // TODO: Purchase/Termination not supported
  // it('should yield the expected evaluated contract schedule for test PAM10019', async () => {
  //   const testDetails = this.testCases['10019'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });

  it('should yield the expected evaluated contract schedule for test pam20', async () => {
    const testDetails = this.testCases['pam20'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails['externalData']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  // different results
  // it('should yield the expected evaluated contract schedule for test pam21', async () => {
  //   const testDetails = this.testCases['pam21'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails['externalData']);

  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });

  it('should yield the expected evaluated contract schedule for test pam22', async () => {
    const testDetails = this.testCases['pam22'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails['externalData']);

    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  // different results
  // it('should yield the expected evaluated contract schedule for test pam23', async () => {
  //   const testDetails = this.testCases['pam23'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails['externalData']);

  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });

  // TODO: A365 issue
  // it('should yield the expected evaluated contract schedule for test PAM10024', async () => {
  //   const testDetails = this.testCases['10024'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms']);

  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });
});
