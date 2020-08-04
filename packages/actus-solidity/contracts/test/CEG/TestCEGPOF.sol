// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../../Engines/CEG/CEGPOF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestCEGPOF is CEGPOF {

    function _POF_CEG_STD(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_CEG_STD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_CEG_FP(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_CEG_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }
    
}