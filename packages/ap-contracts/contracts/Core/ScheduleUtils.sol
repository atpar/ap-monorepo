pragma solidity ^0.5.2;

import "./SharedTypes.sol";


contract ScheduleUtils is SharedTypes {

    function isUnscheduledEventType(EventType eventType) internal pure returns (bool) {
        if (eventType == EventType.CE || eventType == EventType.XD) {
            return true;
        }

        return false;
    }

    function isCyclicEventType(EventType eventType) internal pure returns (bool) {
        if (
            eventType == EventType.IP
            || eventType == EventType.IPCI
            || eventType == EventType.PR
            || eventType == EventType.SC
            || eventType == EventType.RR
            || eventType == EventType.PY
        ) {
            return true;
        }

        return false;
    }
}