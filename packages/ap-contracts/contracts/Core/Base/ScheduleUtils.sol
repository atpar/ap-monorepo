// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;

import "./SharedTypes.sol";


contract ScheduleUtils {

    function isUnscheduledEventType(EventType eventType)
        internal
        pure
        returns (bool)
    {
        if (eventType == EventType.CE || eventType == EventType.EXE) {
            return true;
        }

        return false;
    }

    function isCyclicEventType(EventType eventType)
        internal
        pure
        returns (bool)
    {
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
