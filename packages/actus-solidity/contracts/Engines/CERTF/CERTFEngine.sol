// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";
import "./ICERTFEngine.sol";
import "./CERTFSTF.sol";
import "./CERTFPOF.sol";


/**
 * @title CERTFEngine
 * @notice Inherits from BaseEngine by implementing STFs, POFs according to the ACTUS standard for a CERTF contract
 * @dev All numbers except unix timestamp are represented as multiple of 10 ** 18
 */
contract CERTFEngine is Core, CERTFSTF, CERTFPOF, ICERTFEngine {

    function contractType() external pure override returns (ContractType) {
        return ContractType.CERTF;
    }

    /**
     * Applys an event to the current state of a contract and returns the resulting contract state.
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event to be applied to the contract state
     * @param externalData external data needed for STF evaluation (e.g. rate for RR events)
     * @return the resulting contract state
     */
    function computeStateForEvent(
        CERTFTerms calldata terms,
        State calldata state,
        bytes32 _event,
        bytes32 externalData
    )
        external
        pure
        override
        returns (State memory)
    {
        return stateTransitionFunction(
            terms,
            state,
            _event,
            externalData
        );
    }

    /**
     * Evaluates the payoff for an event under the current state of the contract.
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which the payoff should be evaluated
     * @param externalData external data needed for POF evaluation (e.g. fxRate)
     * @return the payoff of the event
     */
    function computePayoffForEvent(
        CERTFTerms calldata terms,
        State calldata state,
        bytes32 _event,
        bytes32 externalData
    )
        external
        pure
        override
        returns (int256)
    {
        // if alternative settlementCurrency is set then apply fxRate to payoff
        if (terms.settlementCurrency != address(0) && terms.currency != terms.settlementCurrency) {
            return payoffFunction(
                terms,
                state,
                _event,
                externalData
            ).floatMult(int256(externalData));
        }

        return payoffFunction(
            terms,
            state,
            _event,
            externalData
        );
    }

    /**
     * @notice Initialize contract state space based on the contract terms.
     * @param terms terms of the contract
     * @return the initial state of the contract
     */
    function computeInitialState(CERTFTerms calldata terms)
        external
        pure
        override
        returns (State memory)
    {
        State memory state;

        state.quantity = 0;
        state.exerciseQuantity = 0;
        state.marginFactor = ONE_POINT_ZERO;
        state.adjustmentFactor = ONE_POINT_ZERO;
        state.lastCouponFixingDate = terms.issueDate;
        state.couponAmountFixed = 0;

        state.contractPerformance = ContractPerformance.PF;
        state.statusDate = terms.statusDate;

        return state;
    }

    /**
     * @notice Computes a schedule segment of non-cyclic contract events based on the contract terms
     * and the specified timestamps.
     * @param terms terms of the contract
     * @param segmentStart start timestamp of the segment
     * @param segmentEnd end timestamp of the segement
     * @return segment of the non-cyclic schedule
     */
    function computeNonCyclicScheduleSegment(
        CERTFTerms calldata terms,
        uint256 segmentStart,
        uint256 segmentEnd
    )
        external
        pure
        override
        returns (bytes32[] memory)
    {
        bytes32[MAX_EVENT_SCHEDULE_SIZE] memory events;
        uint16 index;

        // issue date
        if (terms.issueDate != 0) {
            if (isInSegment(terms.issueDate, segmentStart, segmentEnd)) {
                events[index] = encodeEvent(EventType.ISS, terms.issueDate);
                index++;
            }
        }

        // initial exchange
        if (terms.initialExchangeDate != 0) {
            if (isInSegment(terms.initialExchangeDate, segmentStart, segmentEnd)) {
                events[index] = encodeEvent(EventType.IED, terms.initialExchangeDate);
                index++;
            }
        }

        // maturity event
        if (terms.maturityDate != 0) {
            if (isInSegment(terms.maturityDate, segmentStart, segmentEnd) == true) {
                events[index] = encodeEvent(EventType.MD, terms.maturityDate);
                index++;
            }
        }

        // remove null entries from returned array
        bytes32[] memory schedule = new bytes32[](index);
        for (uint256 i = 0; i < index; i++) {
            schedule[i] = events[i];
        }

        return schedule;
    }

    /**
     * @notice Computes a schedule segment of cyclic contract events based on the contract terms
     * and the specified timestamps.
     * @param terms terms of the contract
     * @param segmentStart start timestamp of the segment
     * @param segmentEnd end timestamp of the segement
     * @param eventType eventType of the cyclic schedule
     * @return event schedule segment
     */
    function computeCyclicScheduleSegment(
        CERTFTerms calldata terms,
        uint256 segmentStart,
        uint256 segmentEnd,
        EventType eventType
    )
        external
        pure
        override
        returns(bytes32[] memory)
    {
        bytes32[MAX_EVENT_SCHEDULE_SIZE] memory events;
        uint256 index;

        if (eventType == EventType.COF) {
            if (terms.cycleAnchorDateOfCoupon != 0) {
                uint256[MAX_CYCLE_SIZE] memory couponSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfCoupon,
                    (terms.maturityDate > 0) ? terms.maturityDate : segmentEnd,
                    terms.cycleOfCoupon,
                    terms.endOfMonthConvention,
                    (terms.maturityDate > 0) ? true : false,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (couponSchedule[i] == 0) break;
                    if (isInSegment(couponSchedule[i], segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.COF, couponSchedule[i]);
                    index++;
                }
            }
        }

         if (eventType == EventType.COP) {
            if (terms.cycleAnchorDateOfCoupon != 0) {
                uint256[MAX_CYCLE_SIZE] memory couponSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfCoupon,
                    (terms.maturityDate > 0) ? terms.maturityDate : segmentEnd,
                    terms.cycleOfCoupon,
                    terms.endOfMonthConvention,
                    (terms.maturityDate > 0) ? true : false,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (couponSchedule[i] == 0) break;
                    uint256 couponPaymentDayScheduleTime = getTimestampPlusPeriod(terms.settlementPeriod, couponSchedule[i]);
                    if (isInSegment(couponPaymentDayScheduleTime, segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.COF, couponPaymentDayScheduleTime);
                    index++;
                }
            }
        }

        if (eventType == EventType.REF) {
            if (terms.cycleAnchorDateOfRedemption != 0) {
                uint256[MAX_CYCLE_SIZE] memory redemptionSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfRedemption,
                    (terms.maturityDate > 0) ? terms.maturityDate : segmentEnd,
                    terms.cycleOfRedemption,
                    terms.endOfMonthConvention,
                    (terms.maturityDate > 0) ? true : false,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (redemptionSchedule[i] == 0) break;
                    if (isInSegment(redemptionSchedule[i], segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.REF, redemptionSchedule[i]);
                    index++;
                }
            }
        }

        if (eventType == EventType.REP) {
            if (terms.cycleAnchorDateOfRedemption != 0) {
                uint256[MAX_CYCLE_SIZE] memory redemptionSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfRedemption,
                    (terms.maturityDate > 0) ? terms.maturityDate : segmentEnd,
                    terms.cycleOfRedemption,
                    terms.endOfMonthConvention,
                    (terms.maturityDate > 0) ? true : false,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (redemptionSchedule[i] == 0) break;
                    uint256 redemptionPaymentDayScheduleTime = getTimestampPlusPeriod(terms.settlementPeriod, redemptionSchedule[i]);
                    if (isInSegment(redemptionPaymentDayScheduleTime, segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.REP, redemptionPaymentDayScheduleTime);
                    index++;
                }
            }
        }

        if (eventType == EventType.EXE) {
            if (terms.cycleAnchorDateOfRedemption != 0) {
                uint256[MAX_CYCLE_SIZE] memory redemptionSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfRedemption,
                    (terms.maturityDate > 0) ? terms.maturityDate : segmentEnd,
                    terms.cycleOfRedemption,
                    terms.endOfMonthConvention,
                    (terms.maturityDate > 0) ? true : false,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (redemptionSchedule[i] == 0) break;
                    if (redemptionSchedule[i] == terms.maturityDate) continue;
                    uint256 executionDateScheduleTime = getTimestampPlusPeriod(terms.exercisePeriod, redemptionSchedule[i]);
                    if (isInSegment(executionDateScheduleTime, segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.EXE, executionDateScheduleTime);
                    index++;
                }
            }
        }

        // remove null entries from returned array
        bytes32[] memory schedule = new bytes32[](index);
        for (uint256 i = 0; i < index; i++) {
            schedule[i] = events[i];
        }

        return schedule;
    }

    /**
     * @notice Computes a schedule segment of cyclic contract events based on the contract terms
     * and the specified timestamps.
     * @param terms terms of the contract
     * @param lastScheduleTime last occurrence of cyclic event
     * @param eventType eventType of the cyclic schedule
     * @return event schedule segment
     */
    function computeNextCyclicEvent(
        CERTFTerms calldata terms,
        uint256 lastScheduleTime,
        EventType eventType
    )
        external
        pure
        override
        returns(bytes32)
    {
        if (eventType == EventType.COF) {
            if (terms.cycleAnchorDateOfCoupon != 0) {
                uint256 nextCouponDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfCoupon,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfCoupon,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextCouponDate == uint256(0)) return bytes32(0);
                return encodeEvent(EventType.COF, nextCouponDate);
            }
        }

         if (eventType == EventType.COP) {
            if (terms.cycleAnchorDateOfCoupon != 0) {
                uint256 nextCouponDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfCoupon,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfCoupon,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextCouponDate == uint256(0)) return bytes32(0);
                uint256 couponPaymentDayScheduleTime = getTimestampPlusPeriod(terms.settlementPeriod, nextCouponDate);
                return encodeEvent(EventType.COF, couponPaymentDayScheduleTime);
            }
        }

        if (eventType == EventType.REF) {
            if (terms.cycleAnchorDateOfRedemption != 0) {
                uint256 nextRedemptionDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfRedemption,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfRedemption,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextRedemptionDate == uint256(0)) return bytes32(0);
                return encodeEvent(EventType.REF, nextRedemptionDate);
            }
        }

        if (eventType == EventType.REP) {
            if (terms.cycleAnchorDateOfRedemption != 0) {
                uint256 nextRedemptionDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfRedemption,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfRedemption,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextRedemptionDate == uint256(0)) return bytes32(0);
                uint256 redemptionPaymentDayScheduleTime = getTimestampPlusPeriod(terms.settlementPeriod, nextRedemptionDate);
                return encodeEvent(EventType.REP, redemptionPaymentDayScheduleTime);
            }
        }

        if (eventType == EventType.EXE) {
            if (terms.cycleAnchorDateOfRedemption != 0) {
                uint256 nextRedemptionDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfRedemption,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfRedemption,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextRedemptionDate == uint256(0)) return bytes32(0);
                if (nextRedemptionDate == terms.maturityDate) return bytes32(0);
                uint256 executionDateScheduleTime = getTimestampPlusPeriod(terms.exercisePeriod, nextRedemptionDate);
                return encodeEvent(EventType.EXE, executionDateScheduleTime);
            }
        }

       return bytes32(0);
    }

    /**
     * @notice Verifies that the provided event is still scheduled under the terms, the current state of the
     * contract and the current state of the underlying.
     * param _event event for which to check if its still scheduled
     * param terms terms of the contract
     * param state current state of the contract
     * param hasUnderlying boolean indicating whether the contract has an underlying contract
     * param underlyingState state of the underlying (empty state object if non-existing)
     * @return boolean indicating whether event is still scheduled
     */
    function isEventScheduled(
        bytes32 /* _event */,
        CERTFTerms calldata /* terms */,
        State calldata /* state */,
        bool /* hasUnderlying */,
        State calldata /* underlyingState */
    )
        external
        pure
        override
        returns (bool)
    {
        return true;
    }

    /**
     * @notice Implements abstract method which is defined in BaseEngine.
     * Applies an event to the current state of the contract and returns the resulting state.
     * The inheriting Engine contract has to map the events type to the designated STF.
     * todo Annuity calculator for RR/RRF events, IPCB events and ICB state variable
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which to evaluate the next state for
     * @param externalData external data needed for STF evaluation (e.g. rate for RR events)
     * @return the resulting contract state
     */
    function stateTransitionFunction(
        CERTFTerms memory terms,
        State memory state,
        bytes32 _event,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        if (eventType == EventType.ISS) return STF_CERTF_ISS(terms, state, scheduleTime, externalData);
        if (eventType == EventType.IED) return STF_CERTF_IED(terms, state, scheduleTime, externalData);
        if (eventType == EventType.COF) return STF_CERTF_COF(terms, state, scheduleTime, externalData);
        if (eventType == EventType.COP) return STF_CERTF_COP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.REF) return STF_CERTF_REF(terms, state, scheduleTime, externalData);
        if (eventType == EventType.EXE) return STF_CERTF_EXE(terms, state, scheduleTime, externalData);
        if (eventType == EventType.REP) return STF_CERTF_REP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.TD) return STF_CERTF_TD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.MD) return STF_CERTF_MD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.CE) return STF_CERTF_CE(terms, state, scheduleTime, externalData);

        revert("CERTFEngine.stateTransitionFunction: ATTRIBUTE_NOT_FOUND");
    }

    /**
     * @notice Implements abstract method which is defined in BaseEngine.
     * Computes the payoff for an event under the current state of the contract.
     * The inheriting Engine contract has to map the events type to the designated POF.
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which the payoff should be evaluated
     * @param externalData external data needed for POF evaluation
     * @return the payoff of the event
     */
    function payoffFunction(
        CERTFTerms memory terms,
        State memory state,
        bytes32 _event,
        bytes32 externalData
    )
        internal
        pure
        returns (int256)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        if (eventType == EventType.ISS) return 0;
        if (eventType == EventType.COF) return 0;
        if (eventType == EventType.REF) return 0;
        if (eventType == EventType.EXE) return 0;
        if (eventType == EventType.MD) return 0;
        if (eventType == EventType.CE) return 0;
        if (eventType == EventType.IED) return POF_CERTF_IED(terms, state, scheduleTime, externalData);
        if (eventType == EventType.COP) return POF_CERTF_COP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.REP) return POF_CERTF_REP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.TD) return POF_CERTF_TD(terms, state, scheduleTime, externalData);

        revert("CERTFEngine.payoffFunction: ATTRIBUTE_NOT_FOUND");
    }
}
