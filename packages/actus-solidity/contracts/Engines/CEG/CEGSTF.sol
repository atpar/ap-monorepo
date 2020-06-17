// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) currently used by all Engines
 */
contract CEGSTF is Core {

    /**
     * State transition for PAM credit events
     * @param state the old state
     * @return the new state
     */
    function STF_CEG_CE (
        CEGTerms memory terms,
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
            ? shiftEventTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
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

    function STF_CEG_MD (
        CEGTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.notionalPrincipal = 0;
        state.contractPerformance = ContractPerformance.MD;
        state.statusDate = scheduleTime;

        return state;
    }

    function STF_CEG_XD (
        CEGTerms memory terms,
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
        state.exerciseAmount = terms.coverageOfCreditEnhancement.floatMult(int256(externalData));
        state.exerciseDate = scheduleTime;

        if (terms.feeBasis == FeeBasis.A) {
            state.feeAccrued = roleSign(terms.contractRole) * terms.feeRate;
        } else {
            state.feeAccrued = state.feeAccrued
            .add(
                yearFraction(
                    shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                    shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
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
        CEGTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.notionalPrincipal = 0;
        state.feeAccrued = 0;
        state.contractPerformance = ContractPerformance.MD;
        state.statusDate = scheduleTime;

        return state;
    }

    function STF_CEG_PRD (
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
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
        CEGTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.feeAccrued = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    function _yearFraction_STF (
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime
    )
        private
        pure
        returns(int256)
    {
        return yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
            terms.dayCountConvention,
            terms.maturityDate
        );
    }
}
