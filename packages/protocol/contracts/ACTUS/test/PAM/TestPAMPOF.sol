// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/PAM/PAMPOF.sol";


/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestPAMPOF is PAMPOF {


    function _POF_PAM_FP(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_PAM_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_IED(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_PAM_IED(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_IP(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_PAM_IP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_PP(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_PAM_PP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_MD(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_PAM_MD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_TD(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_PAM_TD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

}