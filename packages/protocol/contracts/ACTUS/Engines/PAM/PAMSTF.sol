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
contract PAMSTF is Core {

    using SignedSafeMath for int;
    using SignedMath for int;


    /**
     * State transition for PAM analysis events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_NE (
        PAMTerms memory /* terms */,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        return state;
    }

    /**
     * State transition for PAM analysis events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_AD (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = state.feeAccrued
        .add(
            terms.feeRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM issue events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_ISS (
        PAMTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for PAM fee payment events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_FP (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM initial exchange
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_IED (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
     * State transition for PAM interest capitalization
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_IPCI (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = state.feeAccrued
        .add(
            terms.feeRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM interest payment
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_IP (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = state.feeAccrued
        .add(
            terms.feeRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM principal prepayment
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_PP (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = state.feeAccrued
        .add(
            terms.feeRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        // state.notionalPrincipal -= 0; // riskFactor not supported
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM principal redemption
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_PR (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = state.feeAccrued
        .add(
            terms.feeRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.notionalPrincipal = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM fixed rate resets
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_RRF (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = state.feeAccrued
        .add(
            terms.feeRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.nominalInterestRate = terms.nextResetRate;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM variable rate resets
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_RR (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        // apply external rate, multiply with rateMultiplier and add the spread
        // riskFactor not supported
        int256 rate = int256(uint256(externalData)).floatMult(terms.rateMultiplier).add(terms.rateSpread);

        // deltaRate is the difference between the rate that includes external data, spread and multiplier and the currently active rate from the state
        int256 deltaRate = rate.sub(state.nominalInterestRate);

        // apply period cap/floor
        // the deltaRate (the interest rate change) cannot be bigger than the period cap
        // and not smaller than the period floor
        // math: deltaRate = min(max(deltaRate, periodFloor),lifeCap)
        deltaRate = deltaRate.max(terms.periodFloor).min(terms.periodCap);
        rate = state.nominalInterestRate.add(deltaRate);

        // apply life cap/floor
        // the rate cannot be higher than the lifeCap
        // and not smaller than the lifeFloor
        // math: rate = min(max(rate,lifeFloor),lifeCap)
        rate = rate.max(terms.lifeFloor).min(terms.lifeCap);

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
        state.nominalInterestRate = rate;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM scaling index revision events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_SC (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = state.feeAccrued
        .add(
            terms.feeRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );

        if ((terms.scalingEffect == ScalingEffect.I00) || (terms.scalingEffect == ScalingEffect.IN0)) {
            state.interestScalingMultiplier = 0; // riskFactor not supported
        }
        if ((terms.scalingEffect == ScalingEffect._0N0) || (terms.scalingEffect == ScalingEffect.IN0)) {
            state.notionalScalingMultiplier = 0; // riskFactor not supported
        }

        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM principal redemption
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_MD (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        state.feeAccrued = state.feeAccrued
        .add(
            terms.feeRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.notionalPrincipal = 0;
        state.contractPerformance = ContractPerformance.MD;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM termination events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_TD (
        PAMTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.notionalPrincipal = 0;
        state.nominalInterestRate = 0;
        state.accruedInterest = 0;
        state.feeAccrued = 0;
        state.contractPerformance = ContractPerformance.TD;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM credit events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_CE (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
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

        uint256 currentTimestamp = uint256(externalData);

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
}
