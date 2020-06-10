pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../../Engines/CEC/CECSTF.sol";


/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestCECSTF is CECSTF {

    function _STF_CEC_CE(
        CECTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEC_CE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEC_MD(
        CECTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEC_MD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEC_XD(
        CECTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEC_XD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEC_STD(
        CECTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEC_STD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }


}
