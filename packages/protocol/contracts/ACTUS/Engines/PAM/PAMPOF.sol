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
contract PAMPOF is Core {

    using SignedSafeMath for int;
    using SignedMath for int;


    /**
     * Calculate the pay-off for PAM Fees. The method how to calculate the fee
     * heavily depends on the selected Fee Basis.
     * @return the fee amount for PAM contracts
     */
    function POF_PAM_FP (
        PAMTerms memory terms,
        PAMState memory state,
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
    function POF_PAM_IED (
        PAMTerms memory terms,
        PAMState memory /* state */,
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
    function POF_PAM_IP (
        PAMTerms memory terms,
        PAMState memory state,
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
    function POF_PAM_PP (
        PAMTerms memory terms,
        PAMState memory state,
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
    function POF_PAM_MD (
        PAMTerms memory /* terms */,
        PAMState memory state,
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
    function POF_PAM_TD (
        PAMTerms memory terms,
        PAMState memory state,
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
}
