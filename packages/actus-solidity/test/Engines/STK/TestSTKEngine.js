/* global artifacts, before, beforeEach, contract, describe, it, web3 */
const { getDefaultTestTerms, web3ResponseToState } = require('../../helper/tests');
const { parseEventSchedule, decodeEvent, encodeEvent, sortEvents } = require('../../helper/schedule');

const STKEngine = artifacts.require('STKEngine.sol');

// TODO: Replace hardcoded event values ids with names (#useEventName)

contract('STKEngine', () => {

  const computeEventScheduleSegment = async (terms, segmentStart, segmentEnd) => {
    const schedule = [];

    schedule.push(... await this.STKEngineInstance.computeNonCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd
    ));
    schedule.push(... await this.STKEngineInstance.computeCyclicScheduleSegment(
      terms,
      segmentStart,
      segmentEnd,
      14 // DIF (#useEventName)
    ));

    return sortEvents(schedule);
  }

  before(async () => {
    this.STKEngineInstance = await STKEngine.new();
    this.terms = await getDefaultTestTerms('STK');
  });

  it('should yield the initial contract state', async () => {
    const initialState = await this.STKEngineInstance.computeInitialState(this.terms);
    assert.isTrue(Number(initialState['statusDate']) === Number(this.terms['statusDate']));
  });

  it('should yield the next next contract state and the contract events', async () => {
    const initialState = await this.STKEngineInstance.computeInitialState(this.terms);
    this.terms.cycleAnchorDateOfDividend = this.terms.issueDate;
    this.terms.cycleOfDividend = { i: 1, p: 5 /*'Y'*/, s: 0, isSet: true};
    const endDate = this.terms.cycleAnchorDateOfDividend + 3 * (365 + 1) * 24 * 3600;
    assert.isTrue(this.terms.cycleAnchorDateOfDividend > 0);

    const schedule = await computeEventScheduleSegment(
        this.terms,
        this.terms.cycleAnchorDateOfDividend,
        endDate
    );
    assert.equal(schedule.length, 3);

    const nextState = await this.STKEngineInstance.computeStateForEvent(
      this.terms,
      initialState,
      schedule[0],
      web3.utils.toHex(decodeEvent(schedule[0]).scheduleTime)
    );

    assert.equal(Number(nextState.statusDate), decodeEvent(schedule[0]).scheduleTime);
  });

  it('should yield correct segment of events', async () => {
    const endDate = this.terms.cycleAnchorDateOfDividend + 365 * 24 * 3600;
    const completeEventSchedule = parseEventSchedule(await computeEventScheduleSegment(
      this.terms,
      this.terms.contractDealDate,
      endDate
    ));

    let schedule = [];
    let statusDate = this.terms['statusDate'];
    let timestamp = this.terms['statusDate'] + (endDate - this.terms['statusDate']) / 4;

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    statusDate = timestamp;
    timestamp = this.terms['statusDate'] + (endDate - this.terms['statusDate']) / 2;

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    statusDate = timestamp;
    timestamp = endDate;

    schedule.push(... await computeEventScheduleSegment(
      this.terms,
      statusDate,
      timestamp
    ));

    schedule = parseEventSchedule(sortEvents(schedule));

    assert.isTrue(schedule.length > 0);
    assert.isTrue(schedule.toString() === completeEventSchedule.toString());
  });

  it('should yield the state of each event', async () => {
    const initialState = await this.STKEngineInstance.computeInitialState(this.terms);
    this.terms.cycleAnchorDateOfDividend = this.terms.issueDate;
    this.terms.cycleOfDividend = { i: 1, p: 5 /*'Y'*/, s: 0, isSet: true};
    const endDate = this.terms.cycleAnchorDateOfDividend + 3 * (365 + 1) * 24 * 3600;
    assert.isTrue(this.terms.cycleAnchorDateOfDividend > 0);

    const schedule = await computeEventScheduleSegment(
      this.terms,
      this.terms.cycleAnchorDateOfDividend,
      endDate
    );
    assert.equal(schedule.length, 3);

    let state = initialState;

    for (_event of schedule) {
      const nextState = await this.STKEngineInstance.computeStateForEvent(
        this.terms,
        state,
        _event,
        web3.utils.toHex(decodeEvent(_event).scheduleTime)
      );

      state = nextState;
    }
  });

  describe('computePayoffForEvent function for REP event', () => {
      before(async () => {
        const scheduleTime = 100;
        const event = encodeEvent(21, scheduleTime); // #useEventName (REP)

        const externalData = '0x000000000000000000000000000000000000000000000015af1d78b58c400000'; // 400e+18

        const getSate = async (terms) => {
          const state = web3ResponseToState(await this.STKEngineInstance.computeInitialState(terms));
          state.exerciseQuantity = '1000'+'000000000000000000';
          state.statusDate = '100';
          return state;
        }

        this.terms.redeemableByIssuer = 1;
        this.payoffIfRedeemable = await this.STKEngineInstance.computePayoffForEvent(
            this.terms,
            await getSate(this.terms),
            event,
            externalData
        );

        this.terms.redeemableByIssuer = 0;
        this.payoffIfNotRedeemable = await this.STKEngineInstance.computePayoffForEvent(
            this.terms,
            await getSate(this.terms),
            event,
            externalData
        );
      });

    describe('If redeemableByIssuer is set in terms', () => {
      it('Should yield redemption payment amount', async () => {
        assert.equal(this.payoffIfRedeemable.toString(), '400000' + '000000000000000000');
      });
    });

    describe('If redeemableByIssuer is not set in terms', () => {
      it('Should not yield redemption payment amount', async () => {
        assert.equal(this.payoffIfNotRedeemable.toString(), '0');
      });
    });
  });

  describe('computeStateForEvent function for REF event', () => {
    before(async () => {
      const scheduleTime = 100;
      const event = encodeEvent(19, scheduleTime); // #useEventName (REF)

      const externalData = '0x00000000000000000000000000000000000000000052b7d2dcc80cd2e4000000'; // 100*10e6 * 10e18

      const getSate = async (terms) => {
        const state = web3ResponseToState(await this.STKEngineInstance.computeInitialState(terms));
        state.exerciseQuantity = '0';
        state.statusDate = '50';
        return state;
      }

      this.terms.redeemableByIssuer = 1;
      this.stateIfRedeemable = await this.STKEngineInstance.computeStateForEvent(
          this.terms,
          await getSate(this.terms),
          event,
          externalData
      );

      this.terms.redeemableByIssuer = 0;
      this.stateIfNotRedeemable = await this.STKEngineInstance.computeStateForEvent(
          this.terms,
          await getSate(this.terms),
          event,
          externalData
      );
    });

    describe('If redeemableByIssuer is set in terms', () => {
      it('Should set exerciseQuantity', async () => {
        assert.equal(this.stateIfRedeemable.statusDate.toString(), '100');
        assert.equal(this.stateIfRedeemable.exerciseQuantity.toString(), '100'+'000000'+'000000000000000000');
      });
    });

    describe('If redeemableByIssuer is not set in terms', () => {
      it('Should not set exerciseQuantity', async () => {
        assert.equal(this.stateIfNotRedeemable.statusDate.toString(), '100');
        assert.equal(this.stateIfNotRedeemable.exerciseQuantity.toString(), '0');
      });
    });
  });
});
