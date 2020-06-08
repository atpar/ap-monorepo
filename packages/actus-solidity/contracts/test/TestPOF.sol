pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Engines/ANN/ANNPOF.sol";
import "../Engines/CEC/CECPOF.sol";
import "../Engines/CEG/CEGPOF.sol";
import "../Engines/PAM/PAMPOF.sol";


/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestPOF is ANNPOF, CECPOF, CEGPOF, PAMPOF {

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

    function _POF_PAM_PY(
        PAMTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
        public
        pure
        returns (int256)
    {
        return POF_PAM_PY(
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

    function _POF_ANN_PR(
        ANNTerms memory terms,
        State memory state,
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