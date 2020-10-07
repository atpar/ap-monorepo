const CERTFEngine = artifacts.require('CERTFEngine.sol');
const { DEBUG_LOG } = require("../../../../../del.me/debug-log");

const { getTestCases, compareTestResults } = require('../../helper/tests');
const { parseToTestEventCERTF, isoToUnix, unixToISO } = require('../../helper/parser');
const { decodeEvent, sortEvents } = require('../../helper/schedule');

contract('CERTFEngine', () => {

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    const schedule = [];

    schedule.push(... await this.CERTFEngineInstance.computeNonCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      23 // CFD
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      24 // CPD
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      26 // RFD
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      28 // RPD
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      34 // XD
    ));

    DEBUG_LOG(`schedule: ${JSON.stringify(sortEvents(schedule))}`);
    return sortEvents(schedule);
  }

  before(async () => {
    this.CERTFEngineInstance = await CERTFEngine.new();
    this.testCases = await getTestCases('CERTF');
  });

  const evaluateEventSchedule = async (terms, externalDataObject, tMax, eventsObserved) => {
    terms.contractReference_2.object = web3.utils.toHex('ABC');
    const initialState = await this.CERTFEngineInstance.computeInitialState(terms);
    const schedule = await computeEventScheduleSegment(
      terms,
      terms.contractDealDate,
      (terms.maturityDate > 0) ? terms.maturityDate : tMax
    );

    const evaluatedSchedule = [];
    let state = initialState;

    let xoIndex = 0;

    for (_event of schedule) {
      const { eventType, scheduleTime } = decodeEvent(_event);
      if (scheduleTime == 0) { break; }

      const eventTime = await this.CERTFEngineInstance.computeEventTimeForEvent(
        _event,
        terms.businessDayConvention,
        terms.calendar,
        terms.maturityDate
      );

      let externalData = web3.utils.toHex('0');

      if (eventType === 23) { // RFD
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

      if (eventType === 26 && eventsObserved != undefined) { // XD
        // const dataPoint = eventsObserved.find(({ time }) => {
        //   return String(isoToUnix(time)) === scheduleTime.toString()
        // });
        // if (dataPoint == undefined) { throw new Error('No data point for event.'); }
        externalData = web3.utils.toWei(String(eventsObserved[xoIndex].value)); // web3.utils.toWei(dataPoint.value);
        xoIndex++;
      }

      const payoff = await this.CERTFEngineInstance.computePayoffForEvent(
        terms,
        state,
        _event,
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      );
      const nextState = await this.CERTFEngineInstance.computeStateForEvent(
        terms,
        state,
        _event,
        web3.utils.padLeft(web3.utils.toHex(externalData), 64)
      );

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
