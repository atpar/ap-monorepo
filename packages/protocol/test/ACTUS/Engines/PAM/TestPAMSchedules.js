/* eslint-disable @typescript-eslint/no-var-requires */
const buidlerRuntime = require('hardhat');

const { getTestCases, compareTestResults } = require('../../../helper/ACTUS/tests');
const { parseToTestEvent } = require('../../../helper/ACTUS/parser');
const { decodeEvent, sortEvents } = require('../../../helper/utils/schedule');
const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');

describe('PAMEngine', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.testCases = await getTestCases('PAM');
  });

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    const schedule = [];

    schedule.push(... await this.PAMEngineInstance.methods.computeNonCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd
    ).call());
    schedule.push(... await this.PAMEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('FP')
    ).call());
    schedule.push(... await this.PAMEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('IPCI')
    ).call());
    schedule.push(... await this.PAMEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('IP')
    ).call());
    schedule.push(... await this.PAMEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('PR')
    ).call());
    schedule.push(... await this.PAMEngineInstance.methods.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      eventIndex('RR')
    ).call());

    return sortEvents(schedule);
  }

  const evaluateEventSchedule = async (terms, externalDataObject) => {
    const initialState = await this.PAMEngineInstance.methods.computeInitialState(terms).call();
    const schedule = await computeEventScheduleSegment(
      terms,
      0,
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

      const payoff = await this.PAMEngineInstance.methods.computePayoffForEvent(
        terms,
        state,
        _event,
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      ).call();

      const nextState = await this.PAMEngineInstance.methods.computeStateForEvent(
        terms,
        state,
        _event,
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      ).call();

      state = nextState;

      // if (eventType == 16) {console.log(payoff, nextState)}

      const eventTime = await this.PAMEngineInstance.methods.computeEventTimeForEvent(
        _event,
        terms.businessDayConvention,
        terms.calendar,
        terms.maturityDate
      ).call();

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
