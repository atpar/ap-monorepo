// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/FixedPointMath.sol";
import "./ICECEngine.sol";
import "./CECSTF.sol";
import "./CECPOF.sol";


/**
 * @title CECEngine
 * @notice Inherits from BaseEngine by implementing STFs, POFs according to the ACTUS standard for a CEC contract
 * @dev All numbers except unix timestamp are represented as multiple of 10 ** 18
 * inputs have to be multiplied by 10 ** 18, outputs have to multplied by 10 ** -18
 */
contract CECEngine is Core, CECSTF, CECPOF, ICECEngine {

    using SignedSafeMath for int;
    using FixedPointMath for int;


    function contractType() external pure override returns (ContractType) {
        return ContractType.CEC;
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
        CECTerms calldata terms,
        CECState calldata state,
        bytes32 _event,
        bytes calldata externalData
    )
        external
        pure
        override
        returns (CECState memory)
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
        CECTerms calldata terms,
        CECState calldata state,
        bytes32 _event,
        bytes calldata externalData
    )
        external
        pure
        override
        returns (int256)
    {
        // // if alternative settlementCurrency is set then apply fxRate to payoff
        // if (terms.settlementCurrency != address(0) && terms.currency != terms.settlementCurrency) {
        //     return payoffFunction(
        //         terms,
        //         state,
        //         _event,
        //         externalData
        //     ).fixedMul(int256(externalData));
        // }

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
     * @return initial state of the contract
     */
    function computeInitialState(CECTerms calldata terms)
        external
        pure
        override
        returns (CECState memory)
    {
        CECState memory state;

        state.contractPerformance = ContractPerformance.PF;
        state.statusDate = terms.statusDate;
        state.maturityDate = terms.maturityDate;

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
        CECTerms calldata terms,
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

        // maturity event
        if (isInSegment(terms.maturityDate, segmentStart, segmentEnd) == true) {
            events[index] = encodeEvent(EventType.MD, terms.maturityDate);
            index++;
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
     * param terms terms of the contract
     * param segmentStart start timestamp of the segment
     * param segmentEnd end timestamp of the segement
     * param eventType eventType of the cyclic schedule
     * @return event schedule segment
     */
    function computeCyclicScheduleSegment(
        CECTerms calldata /* terms */,
        uint256 /* segmentStart */,
        uint256 /* segmentEnd */,
        EventType /* eventType */
    )
        external
        pure
        override
        returns (bytes32[] memory)
    {
        bytes32[] memory schedule = new bytes32[](0);

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
        CECTerms calldata terms,
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

        // maturity event
        if (
            // date for event has to be set in terms and date of event can be in the past
            (terms.maturityDate != 0 && (lastScheduleTime <= terms.maturityDate))
            // date for event has to come before previous candidate for the next event
            // && (scheduleTimeNextEvent == 0 || terms.maturityDate < scheduleTimeNextEvent)
            // avoid endless loop by requiring that the event is not the lastNonCyclicEvent
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
     * param terms terms of the contract
     * param lastScheduleTime last occurrence of cyclic event
     * param eventType eventType of the cyclic schedule
     * @return event schedule segment
     */
    function computeNextCyclicEvent(
        CECTerms calldata /* terms */,
        uint256 /* lastScheduleTime */,
        EventType /* eventType */
    )
        external
        pure
        override
        returns(bytes32)
    {
        return bytes32(0);
    }

    /**
     * @notice Verifies that the provided event is still scheduled under the terms, the current state of the
     * contract and the current state of the underlying.
     * param _event event for which to check if its still scheduled
     * param terms terms of the contract
     * param state current state of the contract
     * param underlyingState state of the underlying (empty state object if non-existing)
     * @return boolean indicating whether event is still scheduled
     */
    function isEventScheduled(
        bytes32 /* _event */,
        CECTerms calldata /* terms */,
        CECState calldata /* state */,
        UnderlyingState calldata /* underlyingState */
    )
        external
        pure
        override
        returns (bool)
    {
        // no contract performance for CEC
        return true;
    }

    /**
     * @notice Implements abstract method which is defined in BaseEngine.
     * Applies an event to the current state of the contract and returns the resulting state.
     * The inheriting Engine contract has to map the events type to the designated STF.
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which to evaluate the next state for
     * @param externalData external data needed for STF evaluation (e.g. rate for RR events)
     * @return the resulting contract state
     */
    function stateTransitionFunction(
        CECTerms memory terms,
        CECState memory state,
        bytes32 _event,
        bytes calldata externalData
    )
        internal
        pure
        returns (CECState memory)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        if (eventType == EventType.EXE) return STF_CEC_EXE(terms, state, scheduleTime, externalData);
        if (eventType == EventType.MD) return STF_CEC_MD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.ST) return STF_CEC_ST(terms, state, scheduleTime, externalData);
        if (eventType == EventType.CE) return STF_CEC_CE(terms, state, scheduleTime, externalData);

        revert("CECEngine.stateTransitionFunction: ATTRIBUTE_NOT_FOUND");
    }

    /**
     * @notice Implements abstract method which is defined in BaseEngine.
     * Computes the payoff for an event under the current state of the contract.
     * The inheriting Engine contract has to map the events type to the designated POF.
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which the payoff should be evaluated
     * @param externalData external data needed for POF evaluation (e.g. fxRate)
     * @return the payoff of the event
     */
    function payoffFunction(
        CECTerms memory terms,
        CECState memory state,
        bytes32 _event,
        bytes calldata externalData
    )
        internal
        pure
        returns (int256)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        if (eventType == EventType.CE) return 0;
        if (eventType == EventType.EXE) return 0;
        if (eventType == EventType.ST) return POF_CEC_ST(terms, state, scheduleTime, externalData);
        if (eventType == EventType.MD) return 0;

        revert("CECEngine.payoffFunction: ATTRIBUTE_NOT_FOUND");
    }
}
