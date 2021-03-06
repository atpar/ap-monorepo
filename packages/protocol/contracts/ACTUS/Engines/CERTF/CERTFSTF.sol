// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";
import "../../Core/FixedPointMath.sol";


/**
 * @title STF
 * @notice Contains all state transition functions (STFs) for CERTF contracts
 */
contract CERTFSTF is Core {

    using SignedSafeMath for int;
    using FixedPointMath for int;


    /**
     * State transition for CERTF issue events
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_ISS (
        CERTFTerms memory terms,
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CERTFState memory)
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
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CERTFState memory)
    {
        state.statusDate = scheduleTime;
        return state;
    }

    /**
     * State transition for CERTF coupon fixing day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_COF (
        CERTFTerms memory terms,
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CERTFState memory)
    {
        if (terms.couponType == CouponType.FIX) {
            state.couponAmountFixed = yearFraction(
                shiftCalcTime(state.lastCouponFixingDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
                terms.dayCountConvention,
                terms.maturityDate
            ).fixedMul(terms.nominalPrice).fixedMul(terms.couponRate);
        }

        state.lastCouponFixingDate = scheduleTime;
        state.statusDate = scheduleTime;

        return state;
    }


    /**
     * State transition for CERTF coupon payment day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_COP (
        CERTFTerms memory /* terms */,
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CERTFState memory)
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
    function STF_CERTF_REF (
        CERTFTerms memory terms,
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        internal
        pure
        returns (CERTFState memory)
    {
        state.exerciseAmount = abi.decode(externalData, (int256))
        .fixedMul(terms.nominalPrice)
        .fixedMul(state.marginFactor)
        .fixedMul(state.adjustmentFactor);

        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for CERTF exercise day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_EXE (
        CERTFTerms memory /* terms */,
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        internal
        pure
        returns (CERTFState memory)
    {
        state.exerciseQuantity = abi.decode(externalData, (int256));
        state.statusDate = scheduleTime;

        return state;
    }

    /**
     * State transition for CERTF Redemption Payment Day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_REP (
        CERTFTerms memory /* terms */,
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CERTFState memory)
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
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CERTFState memory)
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
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns (CERTFState memory)
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
        CERTFState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        internal
        pure
        returns (CERTFState memory)
    {
        // handle maturity date
        uint256 nonPerformingDate = (state.nonPerformingDate == 0)
            ? shiftEventTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar,
                terms.maturityDate
            ) : state.nonPerformingDate;

        uint256 currentTimestamp = abi.decode(externalData, (uint256));

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
