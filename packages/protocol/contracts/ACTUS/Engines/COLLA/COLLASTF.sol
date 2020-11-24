// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/SignedMath.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) currently used by all Engines
 */
contract COLLASTF is Core {

    using SignedSafeMath for int;
    using SignedMath for int;


    /**
     * State transition for COLLA analysis events
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_NE (
        COLLATerms memory /* terms */,
        State memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        return state;
    }

    /**
     * State transition for COLLA analysis events
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_AD (
        COLLATerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent;
        {
            timeFromLastEvent = yearFraction(
                shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                terms.dayCountConvention,
                terms.maturityDate
            );
        }
        state.accruedInterest = state.accruedInterest
        .add(
            state.nominalInterestRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for COLLA initial exchange
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_IED (
        COLLATerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.notionalPrincipal = roleSign(terms.contractRole) * terms.notionalPrincipal;
        state.nominalInterestRate = terms.nominalInterestRate;
        state.statusDate = scheduleTime;
        state.accruedInterest = terms.accruedInterest;

        return state;
    }

    /**
     * State transition for COLLA interest capitalization
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_IPCI (
        COLLATerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent;
        {
            timeFromLastEvent = yearFraction(
                shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                terms.dayCountConvention,
                terms.maturityDate
            );
        }
        state.notionalPrincipal = state.notionalPrincipal
        .add(
            state.accruedInterest
            .add(
                state.nominalInterestRate
                .floatMult(state.notionalPrincipal)
                .floatMult(timeFromLastEvent)
            )
        );
        state.accruedInterest = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for COLLA interest payment
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_IP (
        COLLATerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent;
        {
            timeFromLastEvent = yearFraction(
                shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                terms.dayCountConvention,
                terms.maturityDate
            );
        }
        state.accruedInterest = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for COLLA principal redemption
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_PR (
        COLLATerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent;
        {
            timeFromLastEvent = yearFraction(
                shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                terms.dayCountConvention,
                terms.maturityDate
            );
        }
        state.accruedInterest = state.accruedInterest
        .add(
            state.nominalInterestRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.notionalPrincipal = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for COLLA principal redemption
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_MD (
        COLLATerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent;
        {
            timeFromLastEvent = yearFraction(
                shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                terms.dayCountConvention,
                terms.maturityDate
            );
        }
        state.accruedInterest = state.accruedInterest
        .add(
            state.nominalInterestRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.notionalPrincipal = 0;
        state.contractPerformance = ContractPerformance.MD;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for COLLA credit events
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_CE (
        COLLATerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        internal
        pure
        returns(State memory)
    {
        // handle maturity date
        uint256 nonPerformingDate = (state.nonPerformingDate == 0)
            ? shiftEventTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar,
                terms.maturityDate
            ) : state.nonPerformingDate;

        uint256 currentTimestamp = abi.decode(externalData, (uint256));

        bool isInGracePeriod = false;
        if (terms.gracePeriod.isSet) {
            uint256 graceDate = getTimestampPlusPeriod(terms.gracePeriod, nonPerformingDate);
            if (currentTimestamp <= graceDate) {
                state.contractPerformance = ContractPerformance.DL;
                isInGracePeriod = true;
            }
        }

        if (terms.delinquencyPeriod.isSet && !isInGracePeriod) {
            uint256 delinquencyDate = getTimestampPlusPeriod(terms.delinquencyPeriod, nonPerformingDate);
            if (currentTimestamp <= delinquencyDate) {
                state.contractPerformance = ContractPerformance.DQ;
            } else {
                state.contractPerformance = ContractPerformance.DF;
            }
        }

        if (state.nonPerformingDate == 0) {
            // handle maturity date
            state.nonPerformingDate = shiftEventTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar,
                terms.maturityDate
            );
        }

        return state;
    }

    /**
     * State transition for COLLA principal redemption
     * @param state the old state
     * @return the new state
     */
    function STF_COLLA_EXE (
        COLLATerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.contractPerformance = ContractPerformance.DF;
        state.statusDate = scheduleTime;

        return state;
    }
}
