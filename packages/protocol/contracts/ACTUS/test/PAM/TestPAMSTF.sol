// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Engines/PAM/PAMSTF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestPAMSTF is PAMSTF {


    function _STF_PAM_NE(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_NE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_AD(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_AD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_FP(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_IED(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_IED(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_IPCI(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_IPCI(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_IP(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_IP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_PP(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_PP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_PR(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_PR(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_RRF(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_RRF(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_RR(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_RR(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_SC(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_SC(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_MD(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_MD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_TD(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_TD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_CE(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes calldata externalData
    )
        public
        pure
        returns (State memory)
    {
        return STF_PAM_CE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }
}