// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/SignedMath.sol";


/**
 * @title POF
 * @notice Contains all Payoff Functions (POFs) for STK contracts
 */
contract STKPOF is Core {

    using SignedSafeMath for int;
    using SignedMath for int;


    /**
     * Payoff Function for STK dividend payment events
     * @return the dividend payoff
     */
    function POF_STK_DIP (
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
     * Payoff Function for STK redemption payment events
     * @return the redemption payoff
     */
    function POF_STK_REP (
        STKTerms memory terms,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 externalData
    )
        internal
        pure
        returns(int256)
    {
        if (terms.redeemableByIssuer == RedeemableByIssuer.Y) {
            return (
                roleSign(terms.contractRole) * state.exerciseQuantity
                .floatMult(terms.redemptionPrice != 0 ? terms.redemptionPrice : int256(externalData))
            );
        }
        
        return 0;
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
