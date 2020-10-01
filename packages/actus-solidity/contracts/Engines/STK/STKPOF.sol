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
     * Payoff Function for STK dividend payment date events
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
     * Payoff Function for STK redemption payment date events
     * @return the redemption payoff
     */
    function POF_STK_RPD (
        STKTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 externalData
    )
        internal
        pure
        returns(int256)
    {
        return (
            roleSign(terms.contractRole) * state.exerciseQuantity
                .floatMult(terms.redemptionPrice != 0 ? terms.redemptionPrice : int256(externalData))
        );
    }

     /**
     * Payoff Function for STK termination date events
     * @return the termination payoff
     */
    function POF_STK_TD (
        STKTerms memory /* terms */,
        State memory /* state */,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return (
            // TODO: review as soon as terms.priceAtTerminationDate gets supported
            // roleSign(terms.contractRole) * state.quantity.floatMult(terms.priceAtTerminationDate)
            0
        );
    }
}
