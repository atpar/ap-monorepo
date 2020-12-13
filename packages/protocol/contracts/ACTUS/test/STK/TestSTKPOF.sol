// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/STK/STKPOF.sol";


/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestSTKPOF is STKPOF {


    function _POF_STK_DIP(
        STKTerms memory terms,
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
    public
    pure
    returns (int256)
    {
        return POF_STK_DIP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_STK_REP(
        STKTerms memory terms,
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
    public
    pure
    returns (int256)
    {
        return POF_STK_REP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_STK_TD(
        STKTerms memory terms,
        STKState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
    public
    pure
    returns (int256)
    {
        return POF_STK_TD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

}
