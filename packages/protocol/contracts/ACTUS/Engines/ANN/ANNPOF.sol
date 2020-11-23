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
contract ANNPOF is Core {

    using SignedSafeMath for int;
    using SignedMath for int;


    /**
     * Calculate the pay-off for PAM Fees. The method how to calculate the fee
     * heavily depends on the selected Fee Basis.
     * @return the fee amount for PAM contracts
     */
    function POF_ANN_FP (
        ANNTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
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

        return (
            state.feeAccrued
            .add(
                timeFromLastEvent
                .floatMult(terms.feeRate)
                .floatMult(state.notionalPrincipal)
            )
        );
    }

    /**
     * Calculate the payoff for the initial exchange
     * @return the payoff at iniitial exchange for PAM contracts
     */
    function POF_ANN_IED (
        ANNTerms memory terms,
        State memory /* state */,
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
     * @return the interest amount to pay for PAM contracts
     */
    function POF_ANN_IP (
        ANNTerms memory terms,
        State memory state,
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
     * Calculate the principal prepayment payoff
     * @return the principal prepayment amount for PAM contracts
     */
    function POF_ANN_PP (
        ANNTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole)
            * state.notionalPrincipal
        );
    }

    /**
     * Calculate the payoff in case of maturity
     * @return the maturity payoff for PAM contracts
     */
    function POF_ANN_MD (
        ANNTerms memory /* terms */,
        State memory state,
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

    /**
     * Calculate the payoff in case of termination of a contract
     * @return the termination payoff amount for PAM contracts
     */
    function POF_ANN_TD (
        ANNTerms memory terms,
        State memory state,
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
            roleSign(terms.contractRole)
            * terms.priceAtTerminationDate
            .add(state.accruedInterest)
            .add(
                timeFromLastEvent
                .floatMult(state.nominalInterestRate)
                .floatMult(state.notionalPrincipal)
            )
        );
    }

    /**
     * Calculate the payoff for principal redemption
     * @dev This is a replacement of the POF_PR_NAM which we have not implemented, yet
     * @return the principal redemption amount for ANN contracts
     */
    function POF_ANN_PR (
        ANNTerms memory terms,
        State memory state,
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
            (state.notionalScalingMultiplier * roleSign(terms.contractRole))
            .floatMult(
                (roleSign(terms.contractRole) * state.notionalPrincipal)
                .min(
                    roleSign(terms.contractRole)
                    * (
                        state.nextPrincipalRedemptionPayment
                        .sub(state.accruedInterest)
                        .sub(timeFromLastEvent
                            .floatMult(state.nominalInterestRate)
                            .floatMult(state.notionalPrincipal))
                    )
                )
            )
        );
    }
}
