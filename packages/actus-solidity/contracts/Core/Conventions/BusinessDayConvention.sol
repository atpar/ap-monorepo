pragma solidity ^0.5.2;

import "../../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "../ACTUSTypes.sol";


/**
 * @title BusinessDayConvention
 * @notice Contains conventions of how to handle non-business days when generating schedules of events.
 * The events schedule time can be shifted or not, if shifted it is possible that it is shifted to the next
 * or previous valid business days, etc.
 */
contract BusinessDayConvention is ACTUSTypes {

    /**
     * @notice Used in POFs and STFs for DCFs.
     * No shifting is applied if a Calc/Shift instead of Shift/Calc BDC is provided.
     */
    function shiftCalcTime(
        uint256 timestamp,
        BusinessDayConvention convention,
        Calendar calendar
    )
        internal
        pure
        returns (uint256)
    {
        if (
            convention == BusinessDayConvention.CSF ||
            convention == BusinessDayConvention.CSMF ||
            convention == BusinessDayConvention.CSP ||
            convention == BusinessDayConvention.CSMP
        ) {
            return timestamp;
        }

        return shiftEventTime(timestamp, convention, calendar);
    }

    /*
     * @notice Used for generating event schedules (for single events and event cycles schedules).
     * This convention assumes that when shifting the events schedule time according
     * to a BDC, the time is shifted first and calculations are performed thereafter.
     * (Calculations in POFs and STFs are based on the shifted time as well)
     */
    function shiftEventTime(
        uint256 timestamp,
        BusinessDayConvention convention,
        Calendar calendar
    )
        internal
        pure
        returns (uint256)
    {
        // Shift/Calc Following, Calc/Shift following
        if (convention == BusinessDayConvention.SCF || convention == BusinessDayConvention.CSF) {
            return getClosestBusinessDaySameDayOrFollowing(timestamp, calendar);
        // Shift/Calc Modified Following, Calc/Shift Modified following
        // Same as unmodified if shifted date is in the same month, if not it returns the previous buiness-day
        } else if (convention == BusinessDayConvention.SCMF || convention == BusinessDayConvention.CSMF) {
            uint256 followingOrSameBusinessDay = getClosestBusinessDaySameDayOrFollowing(timestamp, calendar);
            if (BokkyPooBahsDateTimeLibrary.getMonth(followingOrSameBusinessDay) == BokkyPooBahsDateTimeLibrary.getMonth(timestamp)) {
                return followingOrSameBusinessDay;
            }
            return getClosestBusinessDaySameDayOrPreceeding(timestamp, calendar);
        // Shift/Calc Preceeding, Calc/Shift Preceeding
        } else if (convention == BusinessDayConvention.SCP || convention == BusinessDayConvention.CSP) {
            return getClosestBusinessDaySameDayOrPreceeding(timestamp, calendar);
        // Shift/Calc Modified Preceeding, Calc/Shift Modified Preceeding
        // Same as unmodified if shifted date is in the same month, if not it returns the following buiness-day
        } else if (convention == BusinessDayConvention.SCMP || convention == BusinessDayConvention.CSMP) {
            uint256 preceedingOrSameBusinessDay = getClosestBusinessDaySameDayOrPreceeding(timestamp, calendar);
            if (BokkyPooBahsDateTimeLibrary.getMonth(preceedingOrSameBusinessDay) == BokkyPooBahsDateTimeLibrary.getMonth(timestamp)) {
                return preceedingOrSameBusinessDay;
            }
            return getClosestBusinessDaySameDayOrFollowing(timestamp, calendar);
        }

        return timestamp;
    }

    /**
     * @notice Returns the following business day if a non-business day is provided.
     * (Returns the same day if calendar != MondayToFriday)
     */
    function getClosestBusinessDaySameDayOrFollowing(uint256 timestamp, Calendar calendar)
        internal
        pure
        returns (uint256)
    {
        if (calendar == Calendar.MondayToFriday) {
            if (BokkyPooBahsDateTimeLibrary.getDayOfWeek(timestamp) == 6) {
                return BokkyPooBahsDateTimeLibrary.addDays(timestamp, 2);
            } else if (BokkyPooBahsDateTimeLibrary.getDayOfWeek(timestamp) == 7) {
                return BokkyPooBahsDateTimeLibrary.addDays(timestamp, 1);
            }
        }
        return timestamp;
    }

    /**
     * @notice Returns the previous buiness day if a non-businessday is provided.
     * (Returns the same day if calendar != MondayToFriday)
     */
    function getClosestBusinessDaySameDayOrPreceeding(uint256 timestamp, Calendar calendar)
        internal
        pure
        returns (uint256)
    {
        if (calendar == Calendar.MondayToFriday) {
            if (BokkyPooBahsDateTimeLibrary.getDayOfWeek(timestamp) == 6) {
                return BokkyPooBahsDateTimeLibrary.subDays(timestamp, 1);
            } else if (BokkyPooBahsDateTimeLibrary.getDayOfWeek(timestamp) == 7) {
                return BokkyPooBahsDateTimeLibrary.subDays(timestamp, 2);
            }
        }
        return timestamp;
    }
}
