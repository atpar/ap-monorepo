// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/CEC/CECSTF.sol";


/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestCECSTF is CECSTF {

    function _STF_CEC_CE(
        CECTerms memory terms,
        CECState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (CECState memory)
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
        CECState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (CECState memory)
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
        CECState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (CECState memory)
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
        CECState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (CECState memory)
    {
        return STF_CEC_ST(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }


}
