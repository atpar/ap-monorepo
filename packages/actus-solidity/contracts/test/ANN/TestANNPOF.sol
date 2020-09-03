// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../../Engines/ANN/ANNPOF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestANNPOF is ANNPOF {

    function _POF_ANN_FP (
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns(int256)
    {
        return POF_ANN_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_ANN_IED (
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns(int256)
    {
         return POF_ANN_IED(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_ANN_IP (
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns(int256)
    {
         return POF_ANN_IP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_ANN_PP (
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns(int256)
    {
         return POF_ANN_PP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_ANN_MD (
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns(int256)
    {
         return POF_ANN_MD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_ANN_PY (
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns(int256)
    {
         return POF_ANN_PY(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_ANN_TD (
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns(int256)
    {
         return POF_ANN_TD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_ANN_PR(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_ANN_PR(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

}