pragma solidity ^0.6.4;
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

    function _STF_CEG_XD(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEG_XD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEG_STD(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEG_STD(
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