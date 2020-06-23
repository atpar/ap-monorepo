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
     * State transition for CERTF analysis events
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_AD (
        CERTFTerms memory terms,
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
        CERTFTerms memory terms,
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
        // TODO
        return state;
    }


    /**
     * State transition for CERTF coupon payment day
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_CPD (
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        // TODO
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
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        // TODO
        return state;
    }

        /**
     * State transition for CERTF exercise order
     * @param state the old state
     * @return the new state
     */
    function STF_CERTF_XO (
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        // TODO
        // int256 exerciseQuantityOrdered = state.quantity;
        // exerciseQuantityOrdered.min(state.exerciseQuantityOrdered.add(state.exerciseQuantity))
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
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {

        // TODO
        // state.exerciseQuantity = state.exerciseQuantityOrdered; //??
        // state.exerciseQuantityOrdered = 0;
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

        // TODO
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
        // TODO
        // state.exerciseQuantity = 0; //??
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
        CERTFTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        // TODO
        // state.exerciseQuantityOrdered = state.quantity ??
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
        CERTFTerms memory /* terms */,
        State memory state,
        uint256 scheduleTime,
        bytes32 /* externalData */
    )
        internal
        pure
        returns (State memory)
    {
        // TODO
        // POF_AD_OPTNS()
        return state;
    }

    function _yearFraction_STF (
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime
    )
        private
        pure
        returns(int256)
    {
        return yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
            terms.dayCountConvention,
            terms.maturityDate
        );
    }
}
