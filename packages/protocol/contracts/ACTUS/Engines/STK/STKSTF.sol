// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) for STK contracts
 */
contract STKSTF is Core {

    /**
     * State transition for STK monitoring events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_AD (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
    internal
    pure
    returns (State memory)
    {
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK issue fixing events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_ISS (
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.quantity = terms.quantity;
        state.notionalPrincipal = terms.notionalPrincipal;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for STK dividend fixing events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_DIF (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        state.dividendPaymentAmount = int256(externalData);
        state.lastDividendFixingDate = scheduleTime;
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK dividend fixing events
     * TODO: implement
     * @param state the old state
     * @return the new state
     */
    function STF_STK_DIX (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK dividend payment events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_DIP (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
    internal
    pure
    returns (State memory)
    {
        state.dividendPaymentAmount = 0;
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK split fixing events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_SPF (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    internal
    pure
    returns (State memory)
    {
        state.splitRatio = int256(externalData);
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK split settlement events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_SPS (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
    internal
    pure
    returns (State memory)
    {
        state.quantity = state.splitRatio.floatMult(state.quantity);
        state.splitRatio = 0;
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK redemption fixing events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_REF (
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    internal
    pure
    returns (State memory)
    {
        if (terms.redeemableByIssuer == RedeemableByIssuer.Y) {
            state.exerciseQuantity = int256(externalData);
        }

        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK redemption payment events
     * @param state the old state
     * TODO: implement
     * @return the new state
     */
    function STF_STK_REX (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK redemption payment events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_REP (
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        if (terms.redeemableByIssuer == RedeemableByIssuer.Y) {
            state.quantity = state.quantity.sub(state.exerciseQuantity);
            state.exerciseQuantity = 0;
        }

        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK redemption payment events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_TD (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for CERTF settlement
     * @param state the old state
     * @return the new state
     */
    function STF_STK_CE (
        STKTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.statusDate = scheduleTime;
        return state;
    }
}
