// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/FixedPointMath.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) currently used by all Engines
 */
contract CECSTF is Core {

    using SignedSafeMath for int;
    using FixedPointMath for int;


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
        
        // decode state.notionalPrincipal of underlying from externalData
        int256 underlyingNotionalPrincipal = terms.coverageOfCreditEnhancement.fixedMul(
            abi.decode(externalData, (int256))
        );

        state.statusDate = scheduleTime;
        state.exerciseAmount = underlyingNotionalPrincipal;
        state.exerciseDate = scheduleTime;

        if (terms.feeBasis == FeeBasis.A) {
            state.feeAccrued = roleSign(terms.contractRole) * terms.feeRate;
        } else {
            state.feeAccrued = state.feeAccrued
            .add(
                timeFromLastEvent
                .fixedMul(terms.feeRate)
                .fixedMul(underlyingNotionalPrincipal)
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
        state.feeAccrued = 0;
        state.contractPerformance = ContractPerformance.MD;
        state.statusDate = scheduleTime;

        return state;
    }
}
