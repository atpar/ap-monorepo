/* eslint-disable @typescript-eslint/no-var-requires */
const buidlerRuntime = require('hardhat');

const { getTestCases, compareTestResults } = require('../../../helper/ACTUS/tests');
const { parseToTestEventCERTF, isoToUnix } = require('../../../helper/ACTUS/parser');
const { decodeEvent, sortEvents } = require('../../../helper/utils/schedule');
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
    this.testCases = await getTestCases('CERTF');
  });

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
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

  const evaluateEventSchedule = async (terms, externalDataObject, tMax, eventsObserved) => {
    terms.contractReference_2.object = web3.utils.toHex('ABC');
    const initialState = await this.CERTFEngineInstance.methods.computeInitialState(terms).call();
    const schedule = await computeEventScheduleSegment(
      terms,
      0,
      (terms.maturityDate > 0) ? terms.maturityDate : tMax
    );

    const evaluatedSchedule = [];
    let state = initialState;

    let xoIndex = 0;

    for (_event of schedule) {
      const { eventType, scheduleTime } = decodeEvent(_event);
      if (scheduleTime == 0) { break; }

      const eventTime = await this.CERTFEngineInstance.methods.computeEventTimeForEvent(
        _event,
        terms.businessDayConvention,
        terms.calendar,
        terms.maturityDate
      ).call();

      let externalData = web3.utils.toHex('0');

      if (eventType === 19) { // REF
        const marketObjectCode = web3.utils.toAscii(terms.contractReference_1.object);
        if (externalDataObject[marketObjectCode] == undefined) {
          throw new Error('No external data found for ' + marketObjectCode + '.');
        }
        // logic which is implemented in BaseActor
        const dataPointIssueDate = externalDataObject[marketObjectCode].data.find(({ timestamp }) => {
          return String(isoToUnix(timestamp)) === terms.issueDate.toString()
        });
        if (dataPointIssueDate == undefined) { throw new Error('No data point for event.'); }
        const dataPointScheduleTime = externalDataObject[marketObjectCode].data.find(({ timestamp }) => {
          return String(isoToUnix(timestamp)) === scheduleTime.toString()
        });
        if (dataPointScheduleTime == undefined) { throw new Error('No data point for event.'); }
        externalData = web3.utils.toWei(String(Number(dataPointScheduleTime.value) / Number(dataPointIssueDate.value)));
      }

      if (eventType === 25 && eventsObserved != undefined) { // EXE
        // const dataPoint = eventsObserved.find(({ time }) => {
        //   return String(isoToUnix(time)) === scheduleTime.toString()
        // });
        // if (dataPoint == undefined) { throw new Error('No data point for event.'); }
        externalData = web3.utils.toWei(String(eventsObserved[xoIndex].value)); // web3.utils.toWei(dataPoint.value);
        xoIndex++;
      }

      const payoff = await this.CERTFEngineInstance.methods.computePayoffForEvent(
        terms,
        state,
        _event,
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      ).call();
      const nextState = await this.CERTFEngineInstance.methods.computeStateForEvent(
        terms,
        state,
        _event,
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      ).call();

      state = nextState;

      evaluatedSchedule.push(parseToTestEventCERTF(eventType, eventTime, payoff, state));
    }

    return evaluatedSchedule;
  };

  it('should yield the expected evaluated contract schedule for test certf01', async () => {
    const testDetails = this.testCases['certf01'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData, testDetails.tMax);
    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test certf02', async () => {
    const testDetails = this.testCases['certf02'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData, testDetails.tMax);
    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test certf03', async () => {
    const testDetails = this.testCases['certf03'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData, testDetails.tMax);
    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test certf04', async () => {
    const testDetails = this.testCases['certf04'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData, testDetails.tMax);
    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  // fixing period
  // it('should yield the expected evaluated contract schedule for test certf05', async () => {
  //   const testDetails = this.testCases['certf05'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData, testDetails.tMax);
  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });

  it('should yield the expected evaluated contract schedule for test certf06', async () => {
    const testDetails = this.testCases['certf06'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData, testDetails.tMax, testDetails.eventsObserved);
    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  it('should yield the expected evaluated contract schedule for test certf07', async () => {
    const testDetails = this.testCases['certf07'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData, testDetails.tMax, testDetails.eventsObserved);
    compareTestResults(evaluatedSchedule, testDetails['results']);
  });

  // it('should yield the expected evaluated contract schedule for test certf08', async () => {
  //   const testDetails = this.testCases['certf08'];
  //   const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData, testDetails.tMax, testDetails.eventsObserved);
  //   compareTestResults(evaluatedSchedule, testDetails['results']);
  // });
});
