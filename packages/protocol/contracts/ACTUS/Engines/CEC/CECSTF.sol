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
contract CECSTF is Core {

    using SignedSafeMath for int;
    using SignedMath for int;


    /**
     * State transition for PAM credit events
     * @param state the old state
     * @return the new state
     */
    function STF_CEC_CE (
        CECTerms memory /* terms */,
        CECState memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(CECState memory)
    {
        return state;
    }

    function STF_CEC_MD (
        CECTerms memory /* terms */,
        CECState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CECState memory)
    {
        state.notionalPrincipal = 0;
        state.contractPerformance = ContractPerformance.MD;
        state.statusDate = scheduleTime;

        return state;
    }

    function STF_CEC_EXE (
        CECTerms memory terms,
        CECState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        internal
        pure
        returns (CECState memory)
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
        state.statusDate = scheduleTime;
        // decode state.notionalPrincipal of underlying from externalData
        state.exerciseAmount = terms.coverageOfCreditEnhancement.floatMult(abi.decode(externalData, (int256)));
        state.exerciseDate = scheduleTime;

        if (terms.feeBasis == FeeBasis.A) {
            state.feeAccrued = roleSign(terms.contractRole) * terms.feeRate;
        } else {
            state.feeAccrued = state.feeAccrued
            .add(
                timeFromLastEvent
                .floatMult(terms.feeRate)
                .floatMult(state.notionalPrincipal)
            );
        }

        return state;
    }

    function STF_CEC_ST (
        CECTerms memory /* terms */,
        CECState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CECState memory)
    {
        state.notionalPrincipal = 0;
        state.feeAccrued = 0;
        state.contractPerformance = ContractPerformance.MD;
        state.statusDate = scheduleTime;

        return state;
    }
}
