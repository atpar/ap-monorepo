// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/FixedPointMath.sol";


/**
 * @title POF
 * @notice Contains all payoff functions (POFs) currently used by all Engines
 */
contract CEGPOF is Core {

    using SignedSafeMath for int;
    using FixedPointMath for int;


    /**
     * Calculate the payoff in case of settlement
     * @return the settlement payoff amount for CEG contracts
     */
    function POF_CEG_ST (
        CEGTerms memory /* terms */,
        CEGState memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return state.exerciseAmount.add(state.feeAccrued);
    }

    /**
     * Calculate the pay-off for CEG Fees.
     * @return the fee amount for CEG contracts
     */
    function POF_CEG_FP (
        CEGTerms memory terms,
        CEGState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        internal
        pure
        returns(int256)
    {
        if (terms.feeBasis == FeeBasis.A) {
            return (
                roleSign(terms.contractRole)
                * terms.feeRate
            );
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

        int256 notionalPrincipal = (terms.notionalPrincipal > 0)
            ? terms.notionalPrincipal
            // decode state.notionalPrincipal of underlying from externalData
            : terms.coverageOfCreditEnhancement.fixedMul(abi.decode(externalData, (int256)));

        return (
            state.feeAccrued
            .add(
                timeFromLastEvent
                .fixedMul(terms.feeRate)
                .fixedMul(notionalPrincipal)
            )
        );
    }
}
