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

    function _STF_STK_ISS(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_ISS(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_DIF(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_DIF(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_DIP(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_DIP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_SPF(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_SPF(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_STK_SPS(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_SPS(
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

    function _STF_STK_REP(
        STKTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_STK_REP(
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
