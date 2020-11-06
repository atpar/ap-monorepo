// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";


interface IScheduleFacet {

    function getPendingEvent (bytes32 assetId)
        external
        view
        returns (bytes32);

    function pushPendingEvent (bytes32 assetId, bytes32 pendingEvent)
        external;

    function popPendingEvent (bytes32 assetId)
        external
        returns (bytes32);

    function getNextComputedEvent(bytes32 assetId)
        external
        returns (bytes32, bool);

    function getNextUnderlyingEvent (bytes32 assetId)
        external
        view
        returns (bytes32);

    function getEventAtIndex(bytes32 assetId, uint256 index)
        external
        view
        returns (bytes32);
    
    function getScheduleLength(bytes32 assetId)
        external
        view
        returns (uint256);

    function getSchedule(bytes32 assetId)
        external
        view
        returns (bytes32[] memory);

    function getNextScheduleIndex(bytes32 assetId)
        external
        view
        returns (uint256);

    function getNextScheduledEvent (bytes32 assetId)
        external
        view
        returns (bytes32);

    function popNextScheduledEvent(bytes32 assetId)
        external
        returns (bytes32);

    function isEventSettled(bytes32 assetId, bytes32 _event)
        external
        view
        returns (bool, int256);

    function markEventAsSettled(bytes32 assetId, bytes32 _event, int256 _payoff)
        external;
}
