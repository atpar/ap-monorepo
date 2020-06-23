// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title POF
 * @notice Contains all Payoff Functions (POFs) for CERTF contracts
 */
contract CERTPOF is Core {

    /**
     * Payoff Function for CERTF analysis events
     * @return the payoff amount
     */
    function POF_CERTF_AD (
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        // TODO
        // POF_AD_PAM()
        return state;
    }

    /**
     * Payoff Function for CERTF initial exchange
     * @return the new state
     */
    function POF_CERTF_IED (
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole)
            * state.quantity
            * terms.issuePrice
        )
    }

    /**
     * Payoff Function for CERTF coupon payment day
     * @return the new state
     */
    function POF_CERTF_CPD (
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole)
            * state.quantity
            * state.couponAmountFixed // TODO ??
        )
    }

    /**
     * Payoff Function for CERTF Redemption Payment Day
     * @return the new state
     */
    function POF_CERTF_RPD (
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole)
            * state.exerciseQuantity // TODO ??
            * state.exerciseAmount // TODO ??
        )
    }

     /**
     * Payoff Function for CERTF termination events
     * @return the new state
     */
    function POF_CERTF_TD (
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole)
            * state.quantity
            * state.exerciseAmount // TODO ??
        )
    }


    /**
     * Payoff Function for CERTF settlement
     * @return the new state
     */
    function POF_CERTF_CE (
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        // TODO
        // POF_CE_PAM()
        return state;
    }

    function _yearFraction_STF (
        PAMTerms memory terms,
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
