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
     * State transition for STK issue day events
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
     * State transition for STK dividend declaration day
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
        state.dividendPaymentAmount = terms.dividendPaymentAmount == 0 ?
            uint256(externalData) : terms.dividendPaymentAmount;

        state.lastDividendDeclarationDate = scheduleTime;
        state.statusDate = scheduleTime;

        state.dividendExDate = shiftCalcTime(
            terms.dividendExDate == 0 ? scheduleTime + terms.dividendRecordPeriod : terms.dividendExDate ,
            terms.businessDayConvention,
            terms.calendar,
            0
        );

        state.dividendPaymentDate = shiftCalcTime(
            terms.dividendPaymentDate == 0 ? scheduleTime + terms.dividendPaymentPeriod : terms.dividendPaymentDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );

        return state;
    }

    /**
     * State transition for STK dividend payment day events
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
        state.dividendDeclarationDate = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for STK split declaration day
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
        state.dividendPaymentAmount = terms.splitRatio == 0 ? uint256(externalData) : terms.splitRatio;
        state.statusDate = scheduleTime;

        state.splitExDate = shiftCalcTime(
            terms.splitExDate == 0 ? scheduleTime + terms.splitRecordPeriod : terms.splitExDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );

        state.splitSettlementDate = shiftCalcTime(
            terms.splitSettlementDate == 0 ? scheduleTime + terms.splitSettlementPeriod : terms.splitSettlementDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );

        return state;
    }

    /**
     * State transition for STK split settlement day
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
        state.quantity = terms.splitRatio.mul(state.quantity);
        state.splitRatio = 0;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for STK redemption declaration day
     * @param state the old state
     * @return the new state
     */
    function STF_STK_RDD (
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    internal
    pure
    returns (State memory)
    {
        if (!terms.redeemableByIssuer) {
            return state;
        }

        state.redemptionPrice = terms.redemptionPrice;
        state.exerciseQuantity = uint256(externalData);
        state.statusDate = scheduleTime;

        state.redemptionExDate = shiftCalcTime(
            terms.redemptionExDate == 0 ? scheduleTime + terms.redemptionRecordPeriod : terms.redemptionExDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );

        state.redemptionPaymentDate = shiftCalcTime(
            terms.redemptionPaymentDate == 0 ? scheduleTime + terms.redemptionPaymentPeriod : terms.redemptionPaymentDate,
            terms.businessDayConvention,
            terms.calendar,
            0
        );

        return state;
    }

    /**
     * State transition for STK settlement
     * @param state the old state
     * @return the new state
     */
    function STF_STK_CE (
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        // handle maturity date
        uint256 nonPerformingDate = (state.nonPerformingDate == 0)
            ? shiftEventTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar,
                terms.maturityDate
            ) : state.nonPerformingDate;

        uint256 currentTimestamp = uint256(externalData);

        bool isInGracePeriod = false;
        if (terms.gracePeriod.isSet) {
            uint256 graceDate = getTimestampPlusPeriod(terms.gracePeriod, nonPerformingDate);
            if (currentTimestamp <= graceDate) {
                state.contractPerformance = ContractPerformance.DL;
                isInGracePeriod = true;
            }
        }

        if (terms.delinquencyPeriod.isSet && !isInGracePeriod) {
            uint256 delinquencyDate = getTimestampPlusPeriod(terms.delinquencyPeriod, nonPerformingDate);
            if (currentTimestamp <= delinquencyDate) {
                state.contractPerformance = ContractPerformance.DQ;
            } else {
                state.contractPerformance = ContractPerformance.DF;
            }
        }

        if (state.nonPerformingDate == 0) {
            // handle maturity date
            state.nonPerformingDate = shiftEventTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar,
                terms.maturityDate
            );
        }

        return state;
    }
}
