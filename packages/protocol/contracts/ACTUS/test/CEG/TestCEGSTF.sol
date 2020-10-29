// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/CEG/CEGSTF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestCEGSTF is CEGSTF {

    function _STF_CEG_CE(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEG_CE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEG_MD(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEG_MD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEG_EXE(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEG_EXE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEG_ST(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEG_ST(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEG_PRD(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEG_PRD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEG_FP(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEG_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

}
