const CERTFEngine = artifacts.require('CERTFEngine.sol');

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
      21 // CFD
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      22 // CPD
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      23 // RFD
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      24 // RPD
    ));
    schedule.push(... await this.CERTFEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      26 // XD
    ));
    
    return sortEvents(schedule);
  }

  before(async () => {    
    this.CERTFEngineInstance = await CERTFEngine.new();
    this.testCases = await getTestCases('CERTF');
  });

  const evaluateEventSchedule = async (terms, dataObserved) => {
    const initialState = await this.CERTFEngineInstance.computeInitialState(terms);
    const schedule = await computeEventScheduleSegment(
      terms,
      terms.contractDealDate,
      (terms.maturityDate > 0) ? terms.maturityDate : 1623448800
    );

    const evaluatedSchedule = [];
    let state = initialState;

    for (_event of schedule) {
      const { eventType, scheduleTime } = decodeEvent(_event);
      if (scheduleTime == 0) { break; }

      const eventTime = await this.CERTFEngineInstance.computeEventTimeForEvent(
        _event,
        terms.businessDayConvention,
        terms.calendar,
        terms.maturityDate
      );

      let externalData = '0';

      if (eventType === 23) {
        // logic which is implemented in BaseActor
        const redemptionAmountIssueDate = Object.values(dataObserved[web3.utils.toAscii(terms.contractReference_1.object)])
        .find((value) => {
          return String(isoToUnix(value.timestamp)) === terms.issueDate.toString()
        }).value;
        const redemptionAmountScheduleTime = Object.values(dataObserved[web3.utils.toAscii(terms.contractReference_1.object)])
        .find((value) => {
          return String(isoToUnix(value.timestamp)) === scheduleTime.toString()
        }).value;
        externalData = web3.utils.toWei(String(Number(redemptionAmountScheduleTime) / Number(redemptionAmountIssueDate)));
      }

      const payoff = await this.CERTFEngineInstance.computePayoffForEvent(
        terms,
        state,
        _event,
        web3.utils.toHex(externalData)
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
 
  it('should yield the expected evaluated contract schedule for test CERTF_01', async () => {
    const testDetails = this.testCases['CERTF_01'];
    const evaluatedSchedule = await evaluateEventSchedule(testDetails['terms'], testDetails.externalData);
    compareTestResults(evaluatedSchedule, testDetails['results']);
  });
});
