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
     * State transition for STK issue date events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_ID (
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
     * State transition for STK dividend declaration date events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_DDD (
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        state.dividendPaymentAmount = int256(externalData);

        state.lastDividendDeclarationDate = scheduleTime;

        // TODO: make the actor generate DIX and DIP events
        /*state.dividendExDate = shiftCalcTime(
            terms.dividendExDate == 0
                ? getTimestampPlusPeriod(scheduleTime, terms.dividendRecordPeriod)
                : terms.dividendExDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );
        state.dividendPaymentDate = shiftCalcTime(
            terms.dividendPaymentDate == 0
                ? getTimestampPlusPeriod(scheduleTime, terms.dividendPaymentPeriod)
                : terms.dividendPaymentDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );*/

        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK dividend payment date events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_DPD (
        STKTerms memory terms,
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
     * State transition for STK split declaration date events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_SDD (
        STKTerms memory terms,
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
     * State transition for STK split settlement date events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_SSD (
        STKTerms memory terms,
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
     * State transition for STK redemption declaration date events
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
        // TODO: move redeemableByIssuer logic to STKEngine
        /*if (!terms.redeemableByIssuer) {
            return state;
        }*/
        // TODO: make the actor generate DIX and DIP events
        /* state.redemptionExDate = shiftCalcTime(
            terms.redemptionExDate == 0
                ? getTimestampPlusPeriod(scheduleTime, terms.redemptionRecordPeriod)
                : terms.redemptionExDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );
        state.redemptionPaymentDate = shiftCalcTime(
            terms.redemptionPaymentDate == 0
                ? getTimestampPlusPeriod(scheduleTime, terms.redemptionPaymentPeriod)
                : terms.redemptionPaymentDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );*/

        state.exerciseQuantity = int256(externalData);

        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK redemption payment date events
     * @param state the old state
     * @return the new state
     */
    function STF_STK_RPD (
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
    internal
    pure
    returns (State memory)
    {
        if (terms.redeemableByIssuer != RedeemableByIssuer.Y) {
            return state;
        }

        state.quantity = state.quantity.sub(state.exerciseQuantity);
        state.exerciseQuantity = 0;

        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for STK termination date event
     * @param state the old state
     * @return the new state
     */
    function STF_STK_TD (
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    internal
    pure
    returns (State memory)
    {
        // TODO: check against the `actus-specs` as soon as specs define `STF_STK_TD`
        state.terminationDate = uint256(externalData);

        state.statusDate = scheduleTime;
        return state;
    }
}
