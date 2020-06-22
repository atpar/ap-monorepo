// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) currently used by all Engines
 */
contract CECSTF is Core {

    /**
     * State transition for PAM credit events
     * @param state the old state
     * @return the new state
     */
    function STF_CEC_CE (
        CECTerms memory /* terms */,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(State memory)
    {
        return state;
    }

    function STF_CEC_MD (
        CECTerms memory /* terms */,
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

    function STF_CEC_XD (
        CECTerms memory terms,
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

    function STF_CEC_STD (
        CECTerms memory /* terms */,
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

    function _yearFraction_STF (
        CECTerms memory terms,
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
