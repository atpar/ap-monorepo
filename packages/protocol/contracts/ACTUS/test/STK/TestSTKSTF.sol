// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/STK/STKSTF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestSTKSTF is STKSTF {


    function _STF_STK_AD(
        STKTerms memory terms,
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (STKState memory)
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
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (STKState memory)
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
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (STKState memory)
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
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (STKState memory)
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
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (STKState memory)
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
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (STKState memory)
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
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (STKState memory)
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
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (STKState memory)
    {
        return STF_STK_REP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }
}
