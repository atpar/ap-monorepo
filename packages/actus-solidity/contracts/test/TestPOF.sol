pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Engines/POF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestPOF is POF {
    function _POF_PAM_FP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256) {
        return POF_PAM_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_IED (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_PAM_IED(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_IP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_PAM_IP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_PP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_PAM_PP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_MD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_PAM_MD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_PY (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_PAM_PY(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_PAM_TD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_PAM_TD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_ANN_PR (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_ANN_PR(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_CEG_STD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_CEG_STD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _POF_CEG_FP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(int256)
    {
        return POF_CEG_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }
}