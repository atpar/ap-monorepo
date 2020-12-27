// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/FixedPointMath.sol";


/**
 * @title POF
 * @notice Contains all Payoff Functions (POFs) for CERTF contracts
 */
contract CERTFPOF is Core {

    using SignedSafeMath for int;
    using FixedPointMath for int;


    /**
     * Payoff Function for CERTF initial exchange
     * @return the new state
     */
    function POF_CERTF_IED (
        CERTFTerms memory terms,
        CERTFState memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.quantity.fixedMul(terms.issuePrice)
        );
    }

    /**
     * Payoff Function for CERTF coupon payment day
     * @return the new state
     */
    function POF_CERTF_COP (
        CERTFTerms memory terms,
        CERTFState memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.quantity.fixedMul(state.couponAmountFixed)
        );
    }

    /**
     * Payoff Function for CERTF Redemption Payment Day
     * @return the new state
     */
    function POF_CERTF_REP (
        CERTFTerms memory terms,
        CERTFState memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.exerciseQuantity.fixedMul(state.exerciseAmount)
        );
    }

     /**
     * Payoff Function for CERTF termination events
     * @return the new state
     */
    function POF_CERTF_TD (
        CERTFTerms memory terms,
        CERTFState memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.quantity.fixedMul(state.exerciseAmount)
        );
    }
}
