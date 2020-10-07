// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../../Engines/STK/STKSTF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestSTKSTF is STKSTF {


    function _STF_STK_AD(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_AD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_ID(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_ID(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_DDD(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_DDD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_DPD(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_DPD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_SDD(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_SDD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_SSD(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_SSD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_REF(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_REF(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_RPD(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_RPD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_TD(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_TD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }
}
