// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/ANN/ANNSTF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestANNSTF is ANNSTF {

    function _STF_ANN_NE(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_NE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_AD(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_AD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_FP(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_PP(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_PP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_RRF(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_RRF(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_TD(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_TD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_CE(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_CE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_IED(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_IED(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_IPCI(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_IPCI(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_IP(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_IP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_PR(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_PR(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_MD(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_MD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_RR(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_RR(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_ANN_SC(
        ANNTerms memory terms,
        ANNState memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (ANNState memory)
    {
        return STF_ANN_SC(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }
}