// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "../../Lib.sol";


library ScheduleEncoder {

    function encodeAndSetSchedule(Asset storage asset, bytes32[] memory schedule) internal {
        for (uint256 i = 0; i < schedule.length; i++) {
            if (schedule[i] == bytes32(0)) break;
            asset.schedule.events[i] = schedule[i];
            asset.schedule.length = i + 1;
        }
    }

    function decodeAndGetSchedule(Asset storage asset) internal view returns (bytes32[] memory) {
        bytes32[] memory schedule = new bytes32[](asset.schedule.length);

        for (uint256 i = 0; i < asset.schedule.length; i++) {
            schedule[i] = asset.schedule.events[i];
        }

        return schedule;
    }
}
