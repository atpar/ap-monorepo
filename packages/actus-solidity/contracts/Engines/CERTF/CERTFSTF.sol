// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) for CERTF contracts
 */
contract CERTFSTF is Core {

    /**
     * State transition for CERTF issue day events
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_ID (
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.quantity = terms.quantity;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for CERTF initial exchange
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_IED (
        CERTFTerms memory /* terms */,
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
     * State transition for CERTF coupon fixing day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_CFD (
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        if (terms.couponType == CouponType.FIX) {
            state.couponAmountFixed = yearFraction(
                shiftCalcTime(state.lastCouponDay, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                terms.dayCountConvention,
                terms.maturityDate
            ).floatMult(terms.nominalPrice).floatMult(terms.couponRate);
        }

        state.lastCouponDay = scheduleTime;
        state.statusDate = scheduleTime;
        
        return state;
    }


    /**
     * State transition for CERTF coupon payment day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_CPD (
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.couponAmountFixed = 0;
        state.statusDate = scheduleTime;
        return state;
    }


    /**
     * State transition for CERTF redemption fixing day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_RFD (
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        state.exerciseAmount = int256(externalData)
        .floatMult(terms.nominalPrice)
        .floatMult(state.marginFactor)
        .floatMult(state.adjustmentFactor);

        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for CERTF exercise day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_XD (
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        internal
        pure
        returns (State memory)
    {
        state.exerciseQuantity = int256(externalData);
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for CERTF Redemption Payment Day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_RPD (
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.quantity = state.quantity.sub(state.exerciseQuantity);
        state.exerciseQuantity = 0;
        state.exerciseAmount = 0;
        state.statusDate = scheduleTime;
        
        if (scheduleTime == state.maturityDate) {
            state.contractPerformance = ContractPerformance.MD;
        } else if (scheduleTime == state.terminationDate) {
            state.contractPerformance = ContractPerformance.TD;
        }

        return state;
    }

    /**
     * State transition for CERTF termination events
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_TD (
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.quantity = 0;
        state.terminationDate = scheduleTime;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for CERTF maturity
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_MD (
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        state.maturityDate = scheduleTime;
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for CERTF settlement
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_CE (
        CERTFTerms memory terms,
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
            ? shiftEventTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
            : state.nonPerformingDate;

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

    // function _yearFraction_STF (
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
