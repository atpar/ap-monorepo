// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "../ACTUSTypes.sol";
import "../ACTUSConstants.sol";
import "./PeriodUtils.sol";


/**
 * @title Schedule
 * @notice Methods related to generating event schedules.
 */
contract CycleUtils is ACTUSConstants, PeriodUtils {

    using BokkyPooBahsDateTimeLibrary for uint;

    /**
     * @notice Applies the cycle n - times (n := cycleIndex) to a given date
     */
    function getNextCycleDate(IPS memory cycle, uint256 cycleStart, uint256 cycleIndex)
        internal
        pure
        returns (uint256)
    {
        uint256 newTimestamp;

        if (cycle.p == P.D) {
            newTimestamp = cycleStart.addDays(cycle.i * cycleIndex);
        } else if (cycle.p == P.W) {
            newTimestamp = cycleStart.addDays(cycle.i * 7 * cycleIndex);
        } else if (cycle.p == P.M) {
            newTimestamp = cycleStart.addMonths(cycle.i * cycleIndex);
        } else if (cycle.p == P.Q) {
            newTimestamp = cycleStart.addMonths(cycle.i * 3 * cycleIndex);
        } else if (cycle.p == P.H) {
            newTimestamp = cycleStart.addMonths(cycle.i * 6 * cycleIndex);
        } else if (cycle.p == P.Y) {
            newTimestamp = cycleStart.addYears(cycle.i * cycleIndex);
        } else {
            revert("Schedule.getNextCycleDate: ATTRIBUTE_NOT_FOUND");
        }

        return newTimestamp;
    }

    /**
     * Computes an array of timestamps that represent dates in a cycle falling within a given segment.
     * @dev There are some notable edge cases: If the cycle is "not set" we return the start end end dates
     * of the cycle if they lie within the segment. Otherwise and empty array is returned.
     * @param cycleStart start time of the cycle
     * @param cycleEnd end time of the cycle
     * @param cycle IPS cycle
     * @param addEndTime timestamp of the end of the cycle should be added to the result if it falls in the segment
     * @param segmentStart start time of the segment
     * @param segmentEnd end time of the segment
     * @return an array of timestamps from the given cycle that fall within the specified segement
     */
    function computeDatesFromCycleSegment(
        uint256 cycleStart,
        uint256 cycleEnd,
        IPS memory cycle,
        bool addEndTime,
        uint256 segmentStart,
        uint256 segmentEnd
    )
        internal
        pure
        returns (uint256[MAX_CYCLE_SIZE] memory)
    {
        uint256[MAX_CYCLE_SIZE] memory dates;
        uint256 index;

        // if the cycle is not set we return only the cycle start end end dates under these conditions:
        // we return the cycle start, if it's in the segment
        // in case of addEntTime = true, the cycle end is also returned if in the segment
        if (cycle.isSet == false) {
            if (isInSegment(cycleStart, segmentStart, segmentEnd)) {
                dates[index] = cycleStart;
                index++;
            }
            if (isInSegment(cycleEnd, segmentStart, segmentEnd)) {
                if (addEndTime == true) dates[index] = cycleEnd;
            }
            return dates;
        }

        uint256 date = cycleStart;
        uint256 cycleIndex;

        // walk through the cycle and create the cycle dates to be returned
        while (date < cycleEnd) {
            // if date is in segment and MAX_CYCLE_SIZE is not reached add it to the output array
            if (isInSegment(date, segmentStart, segmentEnd)) {
                require(index < (MAX_CYCLE_SIZE - 2), "Schedule.computeDatesFromCycle: MAX_CYCLE_SIZE");
                dates[index] = date;
                index++;
            }

            cycleIndex++;

            date = getNextCycleDate(cycle, cycleStart, cycleIndex);
        }

        // add additional time at the end if addEndTime
        if (addEndTime == true) {
            if (isInSegment(cycleEnd, segmentStart, segmentEnd)) {
                dates[index] = cycleEnd;
            }
        }

        // handle a special case where S is set to LONG (e.g. for trimming a cycle to the maturity date)
        if (index > 0 && isInSegment(dates[index - 1], segmentStart, segmentEnd)) {
            if (cycle.s == S.LONG && index > 1 && cycleEnd != date) {
                dates[index - 1] = dates[index];
                delete dates[index];
            }
        }

        return dates;
    }

    /**
     * Computes the next date for a given an IPS cycle.
     * @param cycle IPS cycle
     * @param precedingDate the previous date of the cycle
     * @return next date of the cycle
     */
    function computeNextCycleDateFromPrecedingDate(
        IPS memory cycle,
        uint256 precedingDate
    )
        internal
        pure
        returns (uint256)
    {
        if (cycle.isSet == false) {
            return 0;
        }

        return getNextCycleDate(cycle, precedingDate, 1);
    }

    /*
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
