// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title POF
 * @notice Contains all Payoff Functions (POFs) for CERTF contracts
 */
contract CERTFPOF is Core {

    /**
     * Payoff Function for CERTF initial exchange
     * @return the new state
     */
    function POF_CERTF_IED (
        CERTFTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.quantity.floatMult(terms.issuePrice)
        );
    }

    /**
     * Payoff Function for CERTF coupon payment day
     * @return the new state
     */
    function POF_CERTF_CPD (
        CERTFTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.quantity.floatMult(state.couponAmountFixed)
        );
    }

    /**
     * Payoff Function for CERTF Redemption Payment Day
     * @return the new state
     */
    function POF_CERTF_RPD (
        CERTFTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.exerciseQuantity.floatMult(state.exerciseAmount)
        );
    }

     /**
     * Payoff Function for CERTF termination events
     * @return the new state
     */
    function POF_CERTF_TD (
        CERTFTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.quantity.floatMult(state.exerciseAmount)
        );
    }

    // function _yearFraction_POF (
    //     CERTFTerms memory terms,
    //     State memory state,
    //     uint256 scheduleTime
    // )
    //     private
    //     pure
    //     returns(int256)
    // {
    //     return yearFraction(
    //         shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
    //         shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
    //         terms.dayCountConvention,
    //         terms.maturityDate
    //     );
    // }
}
