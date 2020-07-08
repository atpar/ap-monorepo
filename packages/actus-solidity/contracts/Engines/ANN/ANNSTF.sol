// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) currently used by all Engines
 */
contract ANNSTF is Core {

    /**
     * State transition for PAM analysis events
     * @param state the old state
     * @return the new state
     */
    function STF_ANN_NE (
        ANNTerms memory /* terms */,
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
    function STF_ANN_AD (
        ANNTerms memory terms,
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
     * State transition for PAM fee payment events
     * @param state the old state
     * @return the new state
     */
    function STF_ANN_FP (
        ANNTerms memory terms,
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
     * State transition for PAM principal prepayment
     * @param state the old state
     * @return the new state
     */
    function STF_ANN_PP (
        ANNTerms memory terms,
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
     * State transition for PAM penalty payments
     * @param state the old state
     * @return the new state
     */
    function STF_ANN_PY (
        ANNTerms memory terms,
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
     * State transition for PAM fixed rate resets
     * @param state the old state
     * @return the new state
     */
    function STF_ANN_RRF (
        ANNTerms memory terms,
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
     * State transition for PAM termination events
     * @param state the old state
     * @return the new state
     */
    function STF_ANN_TD (
        ANNTerms memory /* terms */,
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
    function STF_ANN_CE (
        ANNTerms memory terms,
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

    function STF_ANN_IED (
        ANNTerms memory terms,
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

    function STF_ANN_IPCI (
        ANNTerms memory terms,
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

    function STF_ANN_IP (
        ANNTerms memory terms,
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

    function STF_ANN_PR (
        ANNTerms memory terms,
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
        state.notionalPrincipal = state.notionalPrincipal
        .sub(
            roleSign(terms.contractRole)
            * (
                roleSign(terms.contractRole)
                * state.notionalPrincipal
            )
            .min(
                roleSign(terms.contractRole)
                * (
                    state.nextPrincipalRedemptionPayment
                    .sub(state.accruedInterest)
                )
            )
        );

        state.statusDate = scheduleTime;

        return state;
    }

    function STF_ANN_MD (
        ANNTerms memory terms,
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
        state.notionalPrincipal = 0.0;
        state.contractPerformance = ContractPerformance.MD;
        state.statusDate = scheduleTime;

        return state;
    }

    function STF_ANN_RR (
        ANNTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        // riskFactor not supported
        int256 rate = int256(externalData) * terms.rateMultiplier + terms.rateSpread;
        int256 deltaRate = rate.sub(state.nominalInterestRate);

        // apply period cap/floor
        if ((terms.lifeCap < deltaRate) && (terms.lifeCap < ((-1) * terms.periodFloor))) {
            deltaRate = terms.lifeCap;
        } else if (deltaRate < ((-1) * terms.periodFloor)) {
            deltaRate = ((-1) * terms.periodFloor);
        }
        rate = state.nominalInterestRate.add(deltaRate);

        // apply life cap/floor
        if (terms.lifeCap < rate && terms.lifeCap < terms.lifeFloor) {
            rate = terms.lifeCap;
        } else if (rate < terms.lifeFloor) {
            rate = terms.lifeFloor;
        }

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
        state.nextPrincipalRedemptionPayment = 0; // annuity calculator not supported
        state.statusDate = scheduleTime;

        return state;
    }

    function STF_ANN_SC (
        ANNTerms memory terms,
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
}
