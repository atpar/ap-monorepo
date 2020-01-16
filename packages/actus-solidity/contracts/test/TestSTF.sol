pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Engines/STF.sol";

/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestSTF is STF {
    function _STF_PAM_AD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_AD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_FP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_FP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_IED (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_IED(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_IPCI (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_IPCI(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_IP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_IP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_PP (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_PP(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_PR (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_PR(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_PY (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_PY(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_RRF (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_RRF(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_RR (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_RR(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_SC (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_SC(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_TD (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_TD(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }

    function _STF_PAM_CE (
        LifecycleTerms memory terms,
        State memory state,
        uint256 scheduleTime,
        bytes32 externalData
    )
    public
    pure
    returns(State memory) {
        return STF_PAM_CE(
            terms,
            state,
            scheduleTime,
            externalData
        );
    }
}