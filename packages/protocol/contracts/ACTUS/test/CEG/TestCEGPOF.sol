// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/CEG/CEGPOF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestCEGPOF is CEGPOF {

    function _POF_CEG_ST(
        CEGTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_CEG_ST(
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
        bytes calldata externalData
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
