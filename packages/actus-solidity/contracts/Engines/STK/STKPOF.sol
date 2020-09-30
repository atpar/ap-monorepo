// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title POF
 * @notice Contains all Payoff Functions (POFs) for STK contracts
 */
contract STKPOF is Core {

    /**
     * Payoff Function for STK dividend payment day
     * @return the dividend payoff
     */
    function POF_STK_DPD (
        STKTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.dividendPaymentAmount
        );
    }

    /**
     * Payoff Function for STK Redemption Payment Day
     * @return the redemption payoff
     */
    function POF_STK_RPD (
        STKTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.exerciseQuantity.floatMult(state.redemptionPrice)
        );
    }

     /**
     * Payoff Function for STK termination events
     * @return the termination payoff
     */
    function POF_STK_TD (
        STKTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.quantity.floatMult(terms.priceAtTerminationDate)
        );
    }
}
