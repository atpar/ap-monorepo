pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "./ACTUSTypes.sol";
import "./Utils.sol";


/**
 * @title Schedule
 * @notice Methods related to generating event schedules.
 */
contract Schedule is ACTUSTypes, Utils {

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
            newTimestamp = BokkyPooBahsDateTimeLibrary.addDays(cycleStart, cycle.i * cycleIndex);
        } else if (cycle.p == P.W) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addDays(cycleStart, cycle.i * 7 * cycleIndex);
        } else if (cycle.p == P.M) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(cycleStart, cycle.i * cycleIndex);
        } else if (cycle.p == P.Q) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(cycleStart, cycle.i * 3 * cycleIndex);
        } else if (cycle.p == P.H) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(cycleStart, cycle.i * 6 * cycleIndex);
        } else if (cycle.p == P.Y) {
            newTimestamp = BokkyPooBahsDateTimeLibrary.addYears(cycleStart, cycle.i * cycleIndex);
        } else {
            revert("Schedule.getNextCycleDate: ATTRIBUTE_NOT_FOUND");
        }

        return newTimestamp;
    }

    /**
     * This function computes an array of UNIX timestamps that
     * represent dates in a cycle falling within a given segment.
     * @dev There are some notable edge cases: If the cycle is "not set" we return the start end end dates
     * of the cycle if they lie within the segment. Otherwise and empty array is returned.
     * @param cycleStart the start time of the cycle
     * @param cycleEnd the end time of the cycle
     * @param cycle struct that describe sthe cycle
     * @param addEndTime specifies if the timestamp of the end of the cycle should be added to the result if it falls in the segment
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
        uint256 index = 0;

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
        uint256 cycleIndex = 0;

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
}
