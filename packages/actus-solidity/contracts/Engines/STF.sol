pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/Core.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) currently used by all Engines
 */
contract STF is Core {

    /**
     * State transition for PAM analysis events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_AD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
    function STF_PAM_FP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
        state.notionalPrincipal = roleSign(terms.contractRole) * terms.notionalPrincipal;
        state.nominalInterestRate = terms.nominalInterestRate;
        state.statusDate = scheduleTime;

        state.accruedInterest = terms.accruedInterest;

        // if (terms.cycleAnchorDateOfInterestPayment != 0 &&
        //   terms.cycleAnchorDateOfInterestPayment < terms.initialExchangeDate
        // ) {
        //   state.accruedInterest = state.nominalInterestRate
        //   .floatMult(state.notionalPrincipal)
        //   .floatMult(
        //     yearFraction(
        //       terms.cycleAnchorDateOfInterestPayment,
        //       scheduleTime,
        //       terms.dayCountConvention,
        //       terms.maturityDate
        //     )
        //   );
        // }

        return state;
    }

    /**
     * State transition for PAM interest capitalization
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_IPCI (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
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
     * State transition for PAM principal prepayment
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_PP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
        state.notionalPrincipal -= 0; // riskFactor(terms.objectCodeOfPrepaymentModel, scheduleTime, state, terms) * state.notionalPrincipal;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM principal redemption
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_PR (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
     * State transition for PAM penalty payments
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_PY (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
    function STF_PAM_RRF (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        // int256 rate = //riskFactor(terms.marketObjectCodeOfRateReset, scheduleTime, state, terms)
        // 	* terms.rateMultiplier + terms.rateSpread;

        // apply external rate, multiply with rateMultiplier and add the spread
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

        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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

        if ((terms.scalingEffect == ScalingEffect.I00)
            || (terms.scalingEffect == ScalingEffect.IN0)
            || (terms.scalingEffect == ScalingEffect.I0M)
            || (terms.scalingEffect == ScalingEffect.INM)
        ) {
            state.interestScalingMultiplier = 0; // riskFactor(terms.marketObjectCodeOfScalingIndex, scheduleTime, state, terms)
        }
        if ((terms.scalingEffect == ScalingEffect._0N0)
            || (terms.scalingEffect == ScalingEffect._0NM)
            || (terms.scalingEffect == ScalingEffect.IN0)
            || (terms.scalingEffect == ScalingEffect.INM)
        ) {
            state.notionalScalingMultiplier = 0; // riskFactor(terms.marketObjectCodeOfScalingIndex, scheduleTime, state, terms)
        }

        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM termination events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_TD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
        state.notionalPrincipal = 0;
        state.accruedInterest = 0;
        state.feeAccrued = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for PAM credit events
     * @param state the old state
     * @return the new state
     */
    function STF_PAM_CE (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns(State memory)
    {
        uint256 nonPerformingDate = (state.nonPerformingDate == 0)
            ? shiftEventTime(scheduleTime, terms.businessDayConvention, terms.calendar)
            : state.nonPerformingDate;

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
            state.nonPerformingDate = shiftEventTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar
            );
        }

        return state;
    }

    // function STF_ANN_AD (
    //   uint256 scheduleTime,
    //   LifecycleTerms memory terms,
    //   State memory state
    // )
    //   internal
    //   pure
    //   returns (State memory)
    // {
    //   int256 timeFromLastEvent = yearFraction(
    //     shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
    //     shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
    //     terms.dayCountConvention,
    //     terms.maturityDate
    //   );
    //   state.nominalAccrued = state.nominalAccrued
    //   .add(
    //     state.nominalInterestRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.feeAccrued = state.feeAccrued
    //   .add(
    //     terms.feeRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.statusDate = scheduleTime;

    //   return state;
    // }

    // function STF_ANN_CD (
    //   uint256 scheduleTime,
    //   LifecycleTerms memory terms,
    //   State memory state
    // )
    //   internal
    //   pure
    //   returns (State memory)
    // {
    //   int256 timeFromLastEvent = yearFraction(
    //     shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
    //     shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
    //     terms.dayCountConvention,
    //     terms.maturityDate
    //   );
    //   state.nominalAccrued = state.nominalAccrued
    //   .add(
    //     state.nominalInterestRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.feeAccrued = state.feeAccrued
    //   .add(
    //     terms.feeRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.ContractPerformance = ContractPerformance.DF;
    //   state.statusDate = scheduleTime;

    //   return state;
    // }

    // function STF_ANN_FP (
    //   uint256 scheduleTime,
    //   LifecycleTerms memory terms,
    //   State memory state
    // )
    //   internal
    //   pure
    //   returns (State memory)
    // {
    //   int256 timeFromLastEvent = yearFraction(
    //     shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
    //     shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
    //     terms.dayCountConvention,
    //     terms.maturityDate
    //   );
    //   state.nominalAccrued = state.nominalAccrued
    //   .add(
    //     state.nominalInterestRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.feeAccrued = 0;
    //   state.statusDate = scheduleTime;

    //   return state;
    // }

    function STF_ANN_IED (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
        state.notionalPrincipal = roleSign(terms.contractRole) * terms.notionalPrincipal;
        state.nominalInterestRate = terms.nominalInterestRate;
        state.statusDate = scheduleTime;

        state.accruedInterest = terms.accruedInterest;

        // if (terms.cycleAnchorDateOfInterestPayment != 0 &&
        //   terms.cycleAnchorDateOfInterestPayment < terms.initialExchangeDate
        // ) {
        //   state.accruedInterest = state.nominalInterestRate
        //   .floatMult(state.notionalPrincipal)
        //   .floatMult(
        //     yearFraction(
        //       shiftCalcTime(terms.cycleAnchorDateOfInterestPayment, terms.businessDayConvention, terms.calendar),
        //       shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
        //       terms.dayCountConvention,
        //       terms.maturityDate
        //     )
        //   );
        // }

        return state;
    }

    function STF_ANN_IPCI (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
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

    // function STF_ANN_PP (
    //   uint256 scheduleTime,
    //   LifecycleTerms memory terms,
    //   State memory state
    // )
    //   internal
    //   pure
    //   returns (State memory)
    // {
    //   int256 timeFromLastEvent = yearFraction(
    //     shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
    //     shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
    //     terms.dayCountConvention,
    //     terms.maturityDate
    //   );
    //   state.nominalAccrued = state.nominalAccrued
    //   .add(
    //     state.nominalInterestRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.feeAccrued = state.feeAccrued
    //   .add(
    //     terms.feeRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.notionalPrincipal -= 0; // riskFactor(terms.objectCodeOfPrepaymentModel, scheduleTime, state, terms) * state.notionalPrincipal;
    //   state.statusDate = scheduleTime;

    //   return state;
    // }

    function STF_ANN_PR (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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
        state.statusDate = scheduleTime;

        return state;
    }

    // STF_PAM_PY
    // function STF_ANN_PY (
    //   uint256 scheduleTime,
    //   LifecycleTerms memory terms,
    //   State memory state
    // )
    //   internal
    //   pure
    //   returns (State memory)
    // {
    //   int256 timeFromLastEvent = yearFraction(
    //     shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
    //     shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
    //     terms.dayCountConvention,
    //     terms.maturityDate
    //   );
    //   state.nominalAccrued = state.nominalAccrued
    //   .add(
    //     state.nominalInterestRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.feeAccrued = state.feeAccrued
    //   .add(
    //     terms.feeRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.statusDate = scheduleTime;

    //   return state;
    // }

    // function STF_ANN_RRF (
    //   uint256 scheduleTime,
    //   LifecycleTerms memory terms,
    //   State memory state
    // )
    //   internal
    //   pure
    //   returns (State memory)
    // {
    //   int256 timeFromLastEvent = yearFraction(
    //     shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
    //     shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
    //     terms.dayCountConvention,
    //     terms.maturityDate
    //   );
    //   state.nominalAccrued = state.nominalAccrued
    //   .add(
    //     state.nominalInterestRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.feeAccrued = state.feeAccrued
    //   .add(
    //     terms.feeRate
    //     .floatMult(state.notionalPrincipal)
    //     .floatMult(timeFromLastEvent)
    //   );
    //   state.nominalInterestRate = terms.nextResetRate;
    //   state.statusDate = scheduleTime;

    //   return state;
    // }

    function STF_ANN_RR (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        // int256 rate = //riskFactor(terms.marketObjectCodeOfRateReset, scheduleTime, state, terms)
        // 	* terms.rateMultiplier + terms.rateSpread;
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

        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
        state.accruedInterest = state.accruedInterest
        .add(
            state.nominalInterestRate
            .floatMult(state.notionalPrincipal)
            .floatMult(timeFromLastEvent)
        );
        state.nominalInterestRate = rate;
        state.nextPrincipalRedemptionPayment = 0; // TODO: implement annuity calculator
        state.statusDate = scheduleTime;

        return state;
    }

    function STF_ANN_SC (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        int256 timeFromLastEvent = yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
            terms.dayCountConvention,
            terms.maturityDate
        );
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

        if ((terms.scalingEffect == ScalingEffect.I00)
            || (terms.scalingEffect == ScalingEffect.IN0)
            || (terms.scalingEffect == ScalingEffect.I0M)
            || (terms.scalingEffect == ScalingEffect.INM)
        ) {
            state.interestScalingMultiplier = 0; // riskFactor(terms.marketObjectCodeOfScalingIndex, scheduleTime, state, terms)
        }
        if ((terms.scalingEffect == ScalingEffect._0N0)
            || (terms.scalingEffect == ScalingEffect._0NM)
            || (terms.scalingEffect == ScalingEffect.IN0)
            || (terms.scalingEffect == ScalingEffect.INM)
        ) {
            state.notionalScalingMultiplier = 0; // riskFactor(terms.marketObjectCodeOfScalingIndex, scheduleTime, state, terms)
        }

        state.statusDate = scheduleTime;
        return state;
    }

    // function STF_ANN_TD (
    //   uint256 scheduleTime,
    //   LifecycleTerms memory terms,
    //   State memory state
    // )
    //   internal
    //   pure
    //   returns (State memory)
    // {
    //   int256 timeFromLastEvent = yearFraction(
    //     shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
    //     shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
    //     terms.dayCountConvention,
    //     terms.maturityDate
    //   );
    //   state.notionalPrincipal = 0;
    //   state.nominalAccrued = 0;
    //   state.feeAccrued = 0;
    //   state.statusDate = scheduleTime;

    //   return state;
    // }

    function STF_CEG_MD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        state.notionalPrincipal = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    function STF_CEG_XD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        state.statusDate = scheduleTime;
        // decode state.notionalPrincipal of underlying from externalData
        state.executionAmount = terms.coverageOfCreditEnhancement.floatMult(int256(externalData));
        state.executionDate = scheduleTime;

        if (terms.feeBasis == FeeBasis.A) {
            state.feeAccrued = roleSign(terms.contractRole) * terms.feeRate;
        } else {
            state.feeAccrued = state.feeAccrued
                    .add(
                        yearFraction(
                            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
                            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
                            terms.dayCountConvention,
                            terms.maturityDate
                        )
                        .floatMult(terms.feeRate)
                        .floatMult(state.notionalPrincipal)
                    );
        }

        return state;
    }

    function STF_CEG_STD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        state.statusDate = scheduleTime;
        state.notionalPrincipal = 0;
        state.feeAccrued = 0;

        return state;
    }

    function STF_CEG_PRD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        state.notionalPrincipal = roleSign(terms.contractRole) * terms.notionalPrincipal;
        state.nominalInterestRate = terms.feeRate;
        state.statusDate = scheduleTime;

        return state;
    }

    function STF_CEG_FP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        // uint256 timeFromLastEvent = yearFraction(
        //   shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
        //   shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
        //   terms.dayCountConvention,
        //   terms.maturityDate
        // );
        state.feeAccrued = 0;
        state.statusDate = scheduleTime;

        return state;
    }

        function STF_CEG_TD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        // uint256 timeFromLastEvent = yearFraction(
        //   shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar),
        //   shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar),
        //   terms.dayCountConvention,
        //   terms.maturityDate
        // );
        state.notionalPrincipal = 0;
        state.accruedInterest = 0;
        state.feeAccrued = 0;
        state.statusDate = scheduleTime;

        return state;
    }
}
