pragma solidity ^0.6.4;

import "../BaseRegistryStorage.sol";


library ScheduleEncoder {

    function encodeAndSetSchedule(Asset storage asset, bytes32[] memory schedule)
        internal
    {
        // require(
        //     schedule.length != 0,
        //     "ScheduleEncoder.encodeAndSetSchedule: EMPTY_SCHEDULE"
        // );
        // require(
        //     schedule.length < MAX_EVENT_SCHEDULE_SIZE,
        //     "ScheduleEncoder.encodeAndSetSchedule: MAX_EVENT_SCHEDULE_SIZE"
        // );

        for (uint256 i = 0; i < schedule.length; i++) {
            if (schedule[i] == bytes32(0)) break;
            asset.schedule.events[i] = schedule[i];
            asset.schedule.length = i + 1;
        }
    }
}
