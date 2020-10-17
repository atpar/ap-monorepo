// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
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

    function _STF_CEC_EXE(
        CECTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEC_EXE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_CEC_ST(
        CECTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_CEC_ST(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }


}
