pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "./ACTUSTypes.sol";
import "./Conventions/BusinessDayConvention.sol";


/**
 * @title Utils
 * @notice Utility methods used throughout Core and all Engines
 */
contract Utils is ACTUSTypes, BusinessDayConvention {

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
     * @notice Returns the event time for a given schedule time
     * by applying the BDC specified in the terms
     */
    function computeEventTimeForEvent(bytes32 _event, LifecycleTerms memory terms)
        public
        pure
        returns (uint256)
    {
        (, uint256 scheduleTime) = decodeEvent(_event);
        return shiftEventTime(scheduleTime, terms.businessDayConvention, terms.calendar);
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
        if (eventType == EventType.IED) return 20;
        if (eventType == EventType.PR) return 25;
        if (eventType == EventType.IP) return 30;
        if (eventType == EventType.IPCI) return 40;
        if (eventType == EventType.FP) return 50;
        if (eventType == EventType.DV) return 60;
        if (eventType == EventType.MR) return 80;
        if (eventType == EventType.RRF) return 90;
        if (eventType == EventType.RR) return 100;
        if (eventType == EventType.SC) return 110;
        if (eventType == EventType.IPCB) return 120;
        if (eventType == EventType.PRD) return 130;
        if (eventType == EventType.TD) return 140;
        if (eventType == EventType.STD) return 150;
        if (eventType == EventType.MD) return 160;
        if (eventType == EventType.AD) return 950;
        return 0;
    }

    /**
     * @notice Applies a period in IP notation to a given timestamp
     */
    function getTimestampPlusPeriod(IP memory period, uint256 timestamp)
        internal
        pure
        returns (uint256)
    {
        uint256 newTimestamp;

        if (period.p == P.D) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addDays(timestamp, period.i);
        } else if (period.p == P.W) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addDays(timestamp, period.i * 7);
        } else if (period.p == P.M) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(timestamp, period.i);
        } else if (period.p == P.Q) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(timestamp, period.i * 3);
        } else if (period.p == P.H) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(timestamp, period.i * 6);
        } else if (period.p == P.Y) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addYears(timestamp, period.i);
        } else {
            revert("Core.getTimestampPlusPeriod: ATTRIBUTE_NOT_FOUND");
        }

        return newTimestamp;
    }

    /**
     * @notice Checks if a timestamp is in a given range.
     */
    function isInSegment(
        uint256 timestamp,
        uint256 startTimestamp,
        uint256 endTimestamp
    )
        internal
        pure
        returns (bool)
    {
        if (startTimestamp > endTimestamp) return false;
        if (startTimestamp <= timestamp && timestamp <= endTimestamp) return true;
        return false;
    }
}
