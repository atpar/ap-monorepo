// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/CEC/CECPOF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestCECPOF is CECPOF {

    function _POF_CEC_ST (
        CECTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns(int256)
    {
         return POF_CEC_ST(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

}
