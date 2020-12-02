// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../ACTUSTypes.sol";

/**
 * @title EventUtils
 * @notice Methods for encoding decoding events
 */
contract EventUtils {

    function encodeEvent(EventType eventType, uint256 scheduleTime)
        public
        pure
        returns (bytes32)
    {
        return (
            bytes32(uint256(uint8(eventType))) << 248 |
            bytes32(scheduleTime)
        );
    }

    function decodeEvent(bytes32 _event)
        public
        pure
        returns (EventType, uint256)
    {
        EventType eventType = EventType(uint8(uint256(_event >> 248)));
        uint256 scheduleTime = uint256(uint64(uint256(_event)));

        return (eventType, scheduleTime);
    }

    /**
     * @notice Returns the epoch offset for a given event type to determine the
     * correct order of events if multiple events have the same timestamp
     */
    function getEpochOffset(EventType eventType)
        public
        pure
        returns (uint256)
    {
        return uint256(eventType);
    }
}
