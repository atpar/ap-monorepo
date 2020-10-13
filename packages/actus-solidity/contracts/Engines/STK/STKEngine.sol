// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";
import "./ISTKEngine.sol";
import "./STKSTF.sol";
import "./STKPOF.sol";


/**
 * @title STKEngine
 * @notice Inherits from BaseEngine by implementing STFs, POFs according to the ACTUS standard for a STK contract
 * @dev All numbers except unix timestamp are represented as multiple of 10 ** 18
 */
contract STKEngine is Core, STKSTF, STKPOF, ISTKEngine {

    // TODO: move redeemableByIssuer logic to STKEngine
    /* if (terms.redeemableByIssuer != RedeemableByIssuer.Y) { return state; } */

    function contractType() external pure override returns (ContractType) {
        return ContractType.STK;
    }

    /**
     * Applies an event to the current state of a contract and returns the resulting contract state.
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event to be applied to the contract state
     * @param externalData external data needed for STF evaluation (e.g. rate for RR events)
     * @return the resulting contract state
     */
    function computeStateForEvent(
        STKTerms calldata terms,
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
        STKTerms calldata terms,
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
    function computeInitialState(STKTerms calldata terms)
        external
        pure
        override
        returns (State memory)
    {
        State memory state;

        state.contractPerformance = ContractPerformance.PF;
        state.statusDate = terms.statusDate;

        return state;
    }

    /**
     * @notice Computes a schedule segment of non-cyclic contract events based on the contract terms
     * and the specified timestamps.
     * _param terms terms of the contract
     * _param segmentStart start timestamp of the segment
     * _param segmentEnd end timestamp of the segment
     * @return segment of the non-cyclic schedule
     */
    function computeNonCyclicScheduleSegment(
        STKTerms calldata /* terms */,
        uint256 /* segmentStart */,
        uint256 /* segmentEnd */
    )
        external
        pure
        override
        returns (bytes32[] memory)
    {
        // TODO: implement computeNonCyclicScheduleSegment for STK when 'Ex/Settlement'- dates supported in State/Terms
        return new bytes32[](0);
    }

    /**
     * @notice Computes a schedule segment of cyclic contract events based on the contract terms
     * and the specified timestamps.
     * @param terms terms of the contract
     * @param segmentStart start timestamp of the segment
     * @param segmentEnd end timestamp of the segment
     * @param eventType eventType of the cyclic schedule
     * @return event schedule segment
     */
    function computeCyclicScheduleSegment(
        STKTerms calldata terms,
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

        if (eventType == EventType.DIF) {
            if (terms.cycleAnchorDateOfDividend != 0) {
                uint256[MAX_CYCLE_SIZE] memory dividendSchedule = computeDatesFromCycleSegment(
                    terms.cycleAnchorDateOfDividend,
                    segmentEnd,
                    terms.cycleOfDividend,
                    terms.endOfMonthConvention,
                    false,
                    segmentStart,
                    segmentEnd
                );
                for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
                    if (dividendSchedule[i] == 0) break;
                    if (isInSegment(dividendSchedule[i], segmentStart, segmentEnd) == false) continue;
                    events[index] = encodeEvent(EventType.DIF, dividendSchedule[i]);
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
        STKTerms calldata terms,
        uint256 lastScheduleTime,
        EventType eventType
    )
        external
        pure
        override
        returns(bytes32)
    {
        if (eventType == EventType.DIF) {
            if (terms.cycleAnchorDateOfDividend != 0) {
                uint256 nextDividendDeclarationDate = computeNextCycleDateFromPrecedingDate(
                    terms.cycleOfDividend,
                    terms.endOfMonthConvention,
                    terms.cycleAnchorDateOfDividend,
                    lastScheduleTime,
                    true,
                    0
                );
                if (nextDividendDeclarationDate == uint256(0)) return bytes32(0);
                return encodeEvent(EventType.DIF, nextDividendDeclarationDate);
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
        STKTerms calldata /* terms */,
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
     * @param terms terms of the contract
     * @param state current state of the contract
     * @param _event event for which to evaluate the next state for
     * @param externalData external data needed for STF evaluation (e.g. rate for RR events)
     * @return the resulting contract state
     */
    function stateTransitionFunction(
        STKTerms memory terms,
        State memory state,
        bytes32 _event,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        if (eventType == EventType.AD) return STF_STK_AD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.ISS) return STF_STK_ISS(terms, state, scheduleTime, externalData);
        if (eventType == EventType.DIF) return STF_STK_DIF(terms, state, scheduleTime, externalData);
        if (eventType == EventType.DIX) return STF_STK_AD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.DIP) return STF_STK_DIP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.SPF) return STF_STK_SPF(terms, state, scheduleTime, externalData);
        if (eventType == EventType.SPS) return STF_STK_SPS(terms, state, scheduleTime, externalData);
        if (eventType == EventType.REF) return STF_STK_REF(terms, state, scheduleTime, externalData);
        if (eventType == EventType.REX) return STF_STK_AD(terms, state, scheduleTime, externalData);
        if (eventType == EventType.REP) return STF_STK_REP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.CE) return STF_STK_AD(terms, state, scheduleTime, externalData);
        // TODO: check against the `actus-specs` as soon as it defines the STF for the TD event
        if (eventType == EventType.TD) return STF_STK_AD(terms, state, scheduleTime, externalData);

        revert("STKEngine.stateTransitionFunction: ATTRIBUTE_NOT_FOUND");
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
        STKTerms memory terms,
        State memory state,
        bytes32 _event,
        bytes32 externalData
    )
        internal
        pure
        returns (int256)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        if (eventType == EventType.AD) return 0;
        if (eventType == EventType.ISS) return 0;
        if (eventType == EventType.DIF) return 0;
        if (eventType == EventType.DIX) return 0;
        if (eventType == EventType.DIP) return POF_STK_DIP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.SPF) return 0;
        if (eventType == EventType.SPS) return 0;
        if (eventType == EventType.REF) return 0;
        if (eventType == EventType.REX) return 0;
        if (eventType == EventType.REP) return POF_STK_REP(terms, state, scheduleTime, externalData);
        if (eventType == EventType.CE) return 0;
        if (eventType == EventType.TD) return POF_STK_TD(terms, state, scheduleTime, externalData);

        revert("STKEngine.payoffFunction: ATTRIBUTE_NOT_FOUND");
    }
}