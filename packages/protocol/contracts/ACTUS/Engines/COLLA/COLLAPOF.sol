// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/SignedMath.sol";


/**
 * @title POF
 * @notice Contains all payoff functions (POFs) currently used by all Engines
 */
contract COLLAPOF is Core {

    using SignedSafeMath for int;
    using SignedMath for int;


    /**
     * Calculate the payoff for the initial exchange
     * @return the payoff at iniitial exchange for COLLA contracts
     */
    function POF_COLLA_IED (
        COLLATerms memory terms,
        COLLAState memory /* state */,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole)
            * (-1)
            * terms.notionalPrincipal
                .add(terms.premiumDiscountAtIED)
        );
    }

    /**
     * Calculate the interest payment payoff
     * @return the interest amount to pay for COLLA contracts
     */
    function POF_COLLA_IP (
        COLLATerms memory terms,
        COLLAState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
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

        return (
            state.interestScalingMultiplier
            .floatMult(
                state.accruedInterest
                .add(
                    timeFromLastEvent
                    .floatMult(state.nominalInterestRate)
                    .floatMult(state.notionalPrincipal)
                )
            )
        );
    }

    /**
     * Calculate the payoff in case of maturity
     * @return the maturity payoff for COLLA contracts
     */
    function POF_COLLA_MD (
        COLLATerms memory /* terms */,
        COLLAState memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            state.notionalScalingMultiplier
                .floatMult(state.notionalPrincipal)
        );
    }
}
