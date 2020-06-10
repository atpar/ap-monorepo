pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../../SharedTypes.sol";


abstract contract IEconomics {

    // function getANNTerms(bytes32 assetId)
    //     external
    //     view
    //     virtual
    //     returns (ANNTerms memory);

    // function getCECTerms(bytes32 assetId)
    //     external
    //     view
    //     virtual
    //     returns (CECTerms memory);

    // function getCEGTerms(bytes32 assetId)
    //     external
    //     view
    //     virtual
    //     returns (CEGTerms memory);

    function getPAMTerms(bytes32 assetId)
        external
        view
        virtual
        returns (PAMTerms memory);

    function getState(bytes32 assetId)
        external
        view
        virtual
        returns (State memory);

    function getFinalizedState(bytes32 assetId)
        external
        view
        virtual
        returns (State memory);

    function getEngine(bytes32 assetId)
        external
        view
        virtual
        returns (address);

    function getActor(bytes32 assetId)
        external
        view
        virtual
        returns (address);

    function getPendingEvent (bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function pushPendingEvent (bytes32 assetId, bytes32 pendingEvent)
        external
        virtual;

    function popPendingEvent (bytes32 assetId)
        external
        virtual
        returns (bytes32);

    function getNextUnderlyingEvent (bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function getNextScheduleIndex(bytes32 assetId)
        external
        view
        virtual
        returns (uint256);

    function getNextScheduledEvent (bytes32 assetId)
        external
        view
        virtual
        returns (bytes32);

    function popNextScheduledEvent(bytes32 assetId)
        external
        virtual
        returns (bytes32);

    function isEventSettled(bytes32 assetId, bytes32 _event)
        external
        view
        virtual
        returns (bool, int256);

    function markEventAsSettled(bytes32 assetId, bytes32 _event, int256 _payoff)
        external
        virtual;

    // function setANNTerms(bytes32 assetId, ANNTerms calldata terms)
    //     external
    //     virtual;

    // function setCECTerms(bytes32 assetId, CECTerms calldata terms)
    //     external
    //     virtual;

    // function setCEGTerms(bytes32 assetId, CEGTerms calldata terms)
    //     external
    //     virtual;

    function setPAMTerms(bytes32 assetId, PAMTerms calldata terms)
        external
        virtual;

    function setState(bytes32 assetId, State calldata state)
        external
        virtual;

    function setFinalizedState(bytes32 assetId, State calldata state)
        external
        virtual;

    function setEngine(bytes32 assetId, address engine)
        external
        virtual;

    function setActor(bytes32 assetId, address actor)
        external
        virtual;
}
