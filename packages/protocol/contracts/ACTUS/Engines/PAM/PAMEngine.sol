// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/SignedMath.sol";
import "./IPAMEngine.sol";
import "./PAMSTF.sol";
import "./PAMPOF.sol";


/**
 * @title PAMEngine
 * @notice Inherits from BaseEngine by implementing STFs, POFs according to the ACTUS standard for a PAM contract
 * @dev All numbers except unix timestamp are represented as multiple of 10 ** 18
 */
contract PAMEngine is Core, PAMSTF, PAMPOF, IPAMEngine {

    using SignedSafeMath for int;
    using SignedMath for int;


    function contractType() external pure override returns (ContractType) {
        return ContractType.PAM;
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
        PAMTerms calldata terms,
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
        PAMTerms calldata terms,
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
    function computeInitialState(PAMTerms calldata terms)
        external
        pure
        override
        returns (State memory)
    {
        State memory state;

        state.contractPerformance = ContractPerformance.PF;
        state.notionalScalingMultiplier = ONE_POINT_ZERO;
        state.interestScalingMultiplier = ONE_POINT_ZERO;
        state.statusDate = terms.statusDate;
        state.maturityDate = terms.maturityDate;
        state.notionalPrincipal = terms.notionalPrincipal;
        state.nominalInterestRate = terms.nominalInterestRate;
        state.accruedInterest = terms.accruedInterest;
        state.feeAccrued = terms.feeAccrued;

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
        PAMTerms calldata terms,
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

        // issuance
        if (terms.issueDate != 0) {
            if (isInSegment(terms.issueDate, segmentStart, segmentEnd)) {
                events[index] = encodeEvent(EventType.ISS, terms.issueDate);
                index++;
            }
        }

        // initial exchange
        if (terms.initialExchangeDate != 0) {
            if (terms.purchaseDate == 0 && isInSegment(terms.initialExchangeDate, segmentStart, segmentEnd)) {
                events[index] = encodeEvent(EventType.IED, terms.initialExchangeDate);
                index++;
            }
        }

        // purchase
        if (terms.purchaseDate != 0) {
            if (isInSegment(terms.purchaseDate, segmentStart, segmentEnd)) {
                events[index] = encodeEvent(EventType.PRD, terms.purchaseDate);
                index++;
            }
        }

        // principal redemption
        if (terms.maturityDate != 0) {
            if (isInSegment(terms.maturityDate, segmentStart, segmentEnd)) {
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
        PAMTerms calldata terms,
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

        // IP
        // interest payment related (starting with PRANX interest is paid following the PR schedule)
        if (eventType == EventType.IP) {
            if (terms.cycleAnchorDateOfInterestPayment != 0) {
                uint256[MAX_CYCLE_SIZE] memory interestPaymentSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfInterestPayment,
                    terms.maturityDate,
                    terms.cycleOfInterestPayment,
                    terms.endOfMonthConvention,
                    true,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (interestPaymentSchedule[i] == 0) break;
                    if (interestPaymentSchedule[i] <= terms.capitalizationEndDate) continue;
                    if (isInSegment(interestPaymentSchedule[i], segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.IP, interestPaymentSchedule[i]);
                    index++;
                }
            }
        }

        // IPCI
        if (eventType == EventType.IPCI) {
            if (terms.cycleAnchorDateOfInterestPayment != 0 && terms.capitalizationEndDate != 0) {
                IPS memory cycleOfInterestCapitalization = terms.cycleOfInterestPayment;
                cycleOfInterestCapitalization.s = S.SHORT;
                uint256[MAX_CYCLE_SIZE] memory interestPaymentSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfInterestPayment,
                    terms.capitalizationEndDate,
                    cycleOfInterestCapitalization,
                    terms.endOfMonthConvention,
                    true,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (interestPaymentSchedule[i] == 0) break;
                    if (isInSegment(interestPaymentSchedule[i], segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.IPCI, interestPaymentSchedule[i]);
                    index++;
                }
            }
        }

        // rate reset
        if (eventType == EventType.RR) {
            if (terms.cycleAnchorDateOfRateReset != 0) {
                uint256[MAX_CYCLE_SIZE] memory rateResetSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfRateReset,
                    terms.maturityDate,
                    terms.cycleOfRateReset,
                    terms.endOfMonthConvention,
                    false,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (rateResetSchedule[i] == 0) break;
                    if (isInSegment(rateResetSchedule[i], segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.RR, rateResetSchedule[i]);
                    index++;
                }
            }
            // ... nextRateReset
        }

        // fees
        if (eventType == EventType.FP) {
            if (terms.cycleAnchorDateOfFee != 0) {
                uint256[MAX_CYCLE_SIZE] memory feeSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfFee,
                    terms.maturityDate,
                    terms.cycleOfFee,
                    terms.endOfMonthConvention,
                    true,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (feeSchedule[i] == 0) break;
                    if (isInSegment(feeSchedule[i], segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.FP, feeSchedule[i]);
                    index++;
                }
            }
        }

        // scaling
        if (eventType == EventType.SC) {
            if ((terms.scalingEffect != ScalingEffect._000) && terms.cycleAnchorDateOfScalingIndex != 0) {
                uint256[MAX_CYCLE_SIZE] memory scalingSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfScalingIndex,
                    terms.maturityDate,
                    terms.cycleOfScalingIndex,
                    terms.endOfMonthConvention,
                    true,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (scalingSchedule[i] == 0) break;
                    if (isInSegment(scalingSchedule[i], segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.SC, scalingSchedule[i]);
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
     * @notice Computes the next non-cyclic contract events based on the contract terms
     * and the timestamp on which the prev. event occured.
     * @dev Assumes that non-cyclic events of the same event type have a unique schedule time
     * @param terms terms of the contract
     * @param lastNonCyclicEvent last non-cyclic event
     * @return next non-cyclic event
     */
    function computeNextNonCyclicEvent(
        PAMTerms calldata terms,
        bytes32 lastNonCyclicEvent
    )
        external
        pure
        override
        returns (bytes32)
    {
        (EventType lastEventType, uint256 lastScheduleTime) = decodeEvent(lastNonCyclicEvent);

        EventType eventTypeNextEvent;
        uint256 scheduleTimeNextEvent;

        // EventTypes ordered after epoch offset - so we don't have make an additional epochOffset check

        // issuance
        if (
            // date for event has to be set in terms and date of event can be in the past
            (terms.issueDate != 0 && (lastScheduleTime <= terms.issueDate))
            // date for event has to come before previous candidate for the next event
            && (scheduleTimeNextEvent == 0 || terms.issueDate < scheduleTimeNextEvent)
            // avoid endless loop by requiring that the event is not the lastNonCyclicEvent
            && (lastScheduleTime != terms.issueDate || lastEventType != EventType.ISS)
        ) {
            eventTypeNextEvent = EventType.ISS;
            scheduleTimeNextEvent = terms.issueDate;
        }
        
        // initial exchange
        if (
            // date for event has to be set in terms and date of event can be in the past
            (terms.initialExchangeDate != 0 && (lastScheduleTime <= terms.initialExchangeDate))
            && (scheduleTimeNextEvent == 0 || terms.initialExchangeDate < scheduleTimeNextEvent)
            && (lastScheduleTime != terms.initialExchangeDate || lastEventType != EventType.IED)
        ) {
            eventTypeNextEvent = EventType.IED;
            scheduleTimeNextEvent = terms.initialExchangeDate;
        }

        // purchase
        if (
            (terms.purchaseDate != 0 && (lastScheduleTime <= terms.purchaseDate))
            && (scheduleTimeNextEvent == 0 || terms.purchaseDate < scheduleTimeNextEvent)
            && (lastScheduleTime != terms.purchaseDate || lastEventType != EventType.PRD)
        ) {
            eventTypeNextEvent = EventType.PRD;
            scheduleTimeNextEvent = terms.purchaseDate;
        }

        // principal redemption at maturity
        if (
            (terms.maturityDate != 0 && (lastScheduleTime <= terms.maturityDate))
            && (scheduleTimeNextEvent == 0 || terms.maturityDate < scheduleTimeNextEvent)
            && (lastScheduleTime != terms.maturityDate || lastEventType != EventType.MD)
        ) {
            eventTypeNextEvent = EventType.MD;
            scheduleTimeNextEvent = terms.maturityDate;
        }

        return encodeEvent(eventTypeNextEvent, scheduleTimeNextEvent);
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
        PAMTerms calldata terms,
        uint256 lastScheduleTime,
        EventType eventType
    )
        external
        pure
        override
        returns(bytes32)
    {
        // IP
        // interest payment related (starting with PRANX interest is paid following the PR schedule)
        if (eventType == EventType.IP) {
            if (terms.cycleOfInterestPayment.isSet == true && terms.cycleAnchorDateOfInterestPayment != 0) {
                uint256 nextInterestPaymentDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfInterestPayment,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfInterestPayment,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextInterestPaymentDate == 0) return bytes32(0);
                if (nextInterestPaymentDate <= terms.capitalizationEndDate) return bytes32(0);
                return encodeEvent(EventType.IP, nextInterestPaymentDate);
            }
        }

        // IPCI
        if (eventType == EventType.IPCI) {
            if (terms.cycleAnchorDateOfInterestPayment != 0 && terms.capitalizationEndDate != 0) {
                IPS memory cycleOfInterestCapitalization = terms.cycleOfInterestPayment;
                cycleOfInterestCapitalization.s = S.SHORT;
                uint256 nextInterestCapitalizationDate = computeNextCycleDateFromPrecedingDate(
                    cycleOfInterestCapitalization,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfInterestPayment,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextInterestCapitalizationDate == 0) return bytes32(0);
                return encodeEvent(EventType.IPCI, nextInterestCapitalizationDate);
            }
        }

        // rate reset
        if (eventType == EventType.RR) {
            if (terms.cycleAnchorDateOfRateReset != 0) {
                uint256 nextRateResetDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfRateReset,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfRateReset,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextRateResetDate == 0) return bytes32(0);
                return encodeEvent(EventType.RR, nextRateResetDate);
            }
            // ... nextRateReset
        }

        // fees
        if (eventType == EventType.FP) {
            if (terms.cycleAnchorDateOfFee != 0) {
                uint256 nextFeeDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfFee,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfFee,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextFeeDate == 0) return bytes32(0);
                return encodeEvent(EventType.FP, nextFeeDate);
            }
        }

        // scaling
        if (eventType == EventType.SC) {
            if ((terms.scalingEffect != ScalingEffect._000) && terms.cycleAnchorDateOfScalingIndex != 0) {
                uint256 nextScalingDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfScalingIndex,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfScalingIndex,
                    lastScheduleTime,
                    true,
                    terms.maturityDate
                );
                if (nextScalingDate == 0) return bytes32(0);
                return encodeEvent(EventType.SC, nextScalingDate);
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
        PAMTerms calldata /* terms */,
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
        PAMTerms memory terms,
        State memory state,
        bytes32 _event,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        /*
         * Note:
         * Not supported: PRD (Purchase) events
         */

        if (eventType == EventType.AD) return STF_PAM_AD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.ISS) return STF_PAM_ISS(terms, state, scheduleTime, externalData);
        if (eventType == EventType.IED) return STF_PAM_IED(terms, state, scheduleTime, externalData);
        if (eventType == EventType.IPCI) return STF_PAM_IPCI(terms, state, scheduleTime, externalData);
        if (eventType == EventType.IP) return STF_PAM_IP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.FP) return STF_PAM_FP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.PP) return STF_PAM_PP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.MD) return STF_PAM_MD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.RRF) return STF_PAM_RRF(terms, state, scheduleTime, externalData);
        if (eventType == EventType.RR) return STF_PAM_RR(terms, state, scheduleTime, externalData);
        if (eventType == EventType.SC) return STF_PAM_SC(terms, state, scheduleTime, externalData);
        if (eventType == EventType.TD) return STF_PAM_TD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.CE)  return STF_PAM_CE(terms, state, scheduleTime, externalData);

        revert("PAMEngine.stateTransitionFunction: ATTRIBUTE_NOT_FOUND");
    }

    /**
     * @notice Implements abstract method which is defined in BaseEngine.
     * Computes the payoff for an event under the current state of the contract.
     * The inheriting Engine contract has to map the events type to the designated POF.
     * todo IPCB events and Icb state variable, Icb state variable updates in IP-paying events
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which the payoff should be evaluated
     * @param externalData external data needed for POF evaluation (e.g. fxRate)
     * @return the payoff of the event
     */
    function payoffFunction(
        PAMTerms memory terms,
        State memory state,
        bytes32 _event,
        bytes32 externalData
    )
        internal
        pure
        returns (int256)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        /*
         * Note: PAM contracts don't have IPCB and PR events.
         * Not supported: PRD (Purchase) events
         */

        if (eventType == EventType.AD) return 0;
        if (eventType == EventType.ISS) return 0;
        if (eventType == EventType.IPCI) return 0;
        if (eventType == EventType.RRF) return 0;
        if (eventType == EventType.RR) return 0;
        if (eventType == EventType.SC) return 0;
        if (eventType == EventType.CE) return 0;
        if (eventType == EventType.FP) return POF_PAM_FP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.IED) return POF_PAM_IED(terms, state, scheduleTime, externalData);
        if (eventType == EventType.IP) return POF_PAM_IP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.PP) return POF_PAM_PP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.MD) return POF_PAM_MD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.TD) return POF_PAM_TD(terms, state, scheduleTime, externalData);

        revert("PAMEngine.payoffFunction: ATTRIBUTE_NOT_FOUND");
    }
}
