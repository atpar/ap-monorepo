// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/SignedSafeMath.sol";
import "../../../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "../ACTUSTypes.sol";
import "../ACTUSConstants.sol";

import "../FixedPointMath.sol";


/**
 * @title DayCountConventions
 * @notice Implements various ISDA day count conventions as specified by ACTUS
 */
contract DayCountConventions is ACTUSConstants {

    using SafeMath for uint;
    using SignedSafeMath for int;
    using FixedPointMath for int;

    /**
     * Returns the fraction of the year between two timestamps (as a fixed point number multiplied by 10 ** 18).
     */
    function yearFraction(
        uint256 startTimestamp,
        uint256 endTimestamp,
        DayCountConvention ipdc,
        uint256 maturityDate
    )
        internal
        pure
        returns (int256)
    {
        require(endTimestamp >= startTimestamp, "Core.yearFraction: START_NOT_BEFORE_END");
        if (ipdc == DayCountConvention.AA) {
            return actualActual(startTimestamp, endTimestamp);
        } else if (ipdc == DayCountConvention.A360) {
            return actualThreeSixty(startTimestamp, endTimestamp);
        } else if (ipdc == DayCountConvention.A365) {
            return actualThreeSixtyFive(startTimestamp, endTimestamp);
        } else if (ipdc == DayCountConvention._30E360) {
            return thirtyEThreeSixty(startTimestamp, endTimestamp);
        } else if (ipdc == DayCountConvention._30E360ISDA) {
            return thirtyEThreeSixtyISDA(startTimestamp, endTimestamp, maturityDate);
        } else if (ipdc == DayCountConvention._28E336) {
            return twentyEightEThreeThirtySix(startTimestamp, endTimestamp, maturityDate);
        } else if (ipdc == DayCountConvention.ONE) {
            return one(startTimestamp, endTimestamp);
        } else if (ipdc == DayCountConvention.OBYT) {
            return oneByTwelve(startTimestamp, endTimestamp);
        } else if (ipdc == DayCountConvention.HRSAA) {
            return hoursActualActual(startTimestamp, endTimestamp);
        } else if (ipdc == DayCountConvention.MINAA) {
            return minutesActualActual(startTimestamp, endTimestamp);
        } else if (ipdc == DayCountConvention.SECAA) {
            return secondsActualActual(startTimestamp, endTimestamp);
        } else {
            revert("DayCountConvention.yearFraction: ATTRIBUTE_NOT_FOUND.");
        }
    }

    /**
     * ISDA A/A day count convention
     */
    function actualActual(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        uint256 d1Year = BokkyPooBahsDateTimeLibrary.getYear(startTime);
        uint256 d2Year = BokkyPooBahsDateTimeLibrary.getYear(endTime);

        int256 firstBasis = (BokkyPooBahsDateTimeLibrary.isLeapYear(startTime)) ? 366 : 365;

        if (d1Year == d2Year) {
            // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
            return int256(BokkyPooBahsDateTimeLibrary.diffDays(startTime, endTime)).fixedDiv(firstBasis);
        }

        int256 secondBasis = (BokkyPooBahsDateTimeLibrary.isLeapYear(endTime)) ? 366 : 365;

        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        int256 firstFraction = int256(BokkyPooBahsDateTimeLibrary.diffDays(
            startTime,
            BokkyPooBahsDateTimeLibrary.timestampFromDate(d1Year.add(1), 1, 1)
        )).fixedDiv(firstBasis);
        int256 secondFraction = int256(BokkyPooBahsDateTimeLibrary.diffDays(
            BokkyPooBahsDateTimeLibrary.timestampFromDate(d2Year, 1, 1),
            endTime
        )).fixedDiv(secondBasis);

        return firstFraction.add(secondFraction).add(int256(d2Year.sub(d1Year).sub(1)));
    }

    /**
     * ISDA A/360 day count convention
     */
    function actualThreeSixty(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        return (int256((endTime.sub(startTime)).div(86400)).fixedDiv(360));
    }

    /**
     * ISDA A/365-Fixed day count convention
     */
    function actualThreeSixtyFive(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        return (int256((endTime.sub(startTime)).div(86400)).fixedDiv(365));
    }

    /**
     * ISDA 30E/360 day count convention
     */
    function thirtyEThreeSixty(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        uint256 d1Day;
        uint256 d1Month;
        uint256 d1Year;

        uint256 d2Day;
        uint256 d2Month;
        uint256 d2Year;

        (d1Year, d1Month, d1Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(startTime);
        (d2Year, d2Month, d2Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(endTime);

        if (d1Day == 31) {
            d1Day = 30;
        }

        if (d2Day == 31) {
            d2Day = 30;
        }

        int256 delD = int256(d2Day).sub(int256(d1Day));
        int256 delM = int256(d2Month).sub(int256(d1Month));
        int256 delY = int256(d2Year).sub(int256(d1Year));

        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        return ((delY.mul(360).add(delM.mul(30)).add(delD)).fixedDiv(360));
    }

    /**
     * ISDA 30E/360-ISDA day count convention
     */
    function thirtyEThreeSixtyISDA(uint256 startTime, uint256 endTime, uint256 maturityDate)
        internal
        pure
        returns (int256)
    {
        uint256 d1Day;
        uint256 d1Month;
        uint256 d1Year;

        uint256 d2Day;
        uint256 d2Month;
        uint256 d2Year;

        (d1Year, d1Month, d1Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(startTime);
        (d2Year, d2Month, d2Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(endTime);

        if (d1Day == BokkyPooBahsDateTimeLibrary.getDaysInMonth(startTime)) {
            d1Day = 30;
        }

        if (!(endTime == maturityDate && d2Month == 2) && d2Day == BokkyPooBahsDateTimeLibrary.getDaysInMonth(endTime)) {
            d2Day = 30;
        }

        int256 delD = int256(d2Day).sub(int256(d1Day));
        int256 delM = int256(d2Month).sub(int256(d1Month));
        int256 delY = int256(d2Year).sub(int256(d1Year));

        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        return ((delY.mul(360).add(delM.mul(30)).add(delD)).fixedDiv(360));
    }

    /**
     * ISDA 28E/336 day count convention
     */
    function twentyEightEThreeThirtySix(uint256 startTime, uint256 endTime, uint256 maturityDate)
        internal
        pure
        returns (int256)
    {
        (uint256 d1Year, uint256 d1Month, uint256 d1Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(startTime);
        (uint256 d2Year, uint256 d2Month, uint256 d2Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(endTime);

        if (d1Day == BokkyPooBahsDateTimeLibrary.getDaysInMonth(startTime)) {
            d1Day = 28;
        }

        // if (!(endTime == maturityDate && d2Month == 2) && d2Day == BokkyPooBahsDateTimeLibrary.getDaysInMonth(endTime)) {
        if (!(endTime == maturityDate && d2Month == 2) && (d2Day == BokkyPooBahsDateTimeLibrary.getDaysInMonth(startTime) || d2Day > 28)) {
            d2Day = 28;
        }

        int256 delD = int256(d2Day).sub(int256(d1Day));
        int256 delM = int256(d2Month).sub(int256(d1Month));
        int256 delY = int256(d2Year).sub(int256(d1Year));

        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        return ((delY.mul(336).add(delM.mul(28)).add(delD)).fixedDiv(336));
    }

    /**
     * One
     */
    function one(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        // as fixed point number (10 ** 18)
        return ONE_POINT_ZERO;
    }

    /**
     * One By Twelve
     */
    function oneByTwelve(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        return int256(ONE_POINT_ZERO).fixedDiv(12 * ONE_POINT_ZERO);
    }

    /**
     * Hours/Actual/Actual
     */
    function hoursActualActual(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        uint256 d1Year = BokkyPooBahsDateTimeLibrary.getYear(startTime);
        uint256 d2Year = BokkyPooBahsDateTimeLibrary.getYear(endTime);

        // no risk of overflow
        // 366 * 24, 365 * 24
        int256 firstBasis = (BokkyPooBahsDateTimeLibrary.isLeapYear(startTime)) ? 8784 : 8760;

        if (d1Year == d2Year) {
            // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
            return int256(BokkyPooBahsDateTimeLibrary.diffHours(startTime, endTime)).fixedDiv(firstBasis);
        }

        // no risk of overflow
        // 366 * 24, 365 * 24
        int256 secondBasis = (BokkyPooBahsDateTimeLibrary.isLeapYear(endTime)) ? 8784 : 8760;

        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        int256 firstFraction = int256(BokkyPooBahsDateTimeLibrary.diffHours(
            startTime,
            BokkyPooBahsDateTimeLibrary.timestampFromDate(d1Year.add(1), 1, 1)
        )).fixedDiv(firstBasis);
        int256 secondFraction = int256(BokkyPooBahsDateTimeLibrary.diffHours(
            BokkyPooBahsDateTimeLibrary.timestampFromDate(d2Year, 1, 1),
            endTime
        )).fixedDiv(secondBasis);

        return firstFraction.add(secondFraction).add(int256(d2Year.sub(d1Year).sub(1)));
    }

    /**
     * Minutes/Actual/Actual
     */
    function minutesActualActual(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        uint256 d1Year = BokkyPooBahsDateTimeLibrary.getYear(startTime);
        uint256 d2Year = BokkyPooBahsDateTimeLibrary.getYear(endTime);

        // no risk of overflow
        // 366 * 1440, 365 * 1440
        int256 firstBasis = (BokkyPooBahsDateTimeLibrary.isLeapYear(startTime)) ? 527040 : 525600;

        if (d1Year == d2Year) {
            // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
            return int256(BokkyPooBahsDateTimeLibrary.diffMinutes(startTime, endTime)).fixedDiv(firstBasis);
        }

        // no risk of overflow
        // 366 * 1440, 365 * 1440
        int256 secondBasis = (BokkyPooBahsDateTimeLibrary.isLeapYear(endTime)) ? 527040 : 525600;

        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        int256 firstFraction = int256(BokkyPooBahsDateTimeLibrary.diffMinutes(
            startTime,
            BokkyPooBahsDateTimeLibrary.timestampFromDate(d1Year.add(1), 1, 1)
        )).fixedDiv(firstBasis);
        int256 secondFraction = int256(BokkyPooBahsDateTimeLibrary.diffMinutes(
            BokkyPooBahsDateTimeLibrary.timestampFromDate(d2Year, 1, 1),
            endTime
        )).fixedDiv(secondBasis);

        return firstFraction.add(secondFraction).add(int256(d2Year.sub(d1Year).sub(1)));
    }

    /**
     * Seconds/Actual/Actual
     */
    function secondsActualActual(uint256 startTime, uint256 endTime)
        internal
        pure
        returns (int256)
    {
        uint256 d1Year = BokkyPooBahsDateTimeLibrary.getYear(startTime);
        uint256 d2Year = BokkyPooBahsDateTimeLibrary.getYear(endTime);

        // no risk of overflow
        // 366 * 86400, 365 * 86400
        int256 firstBasis = (BokkyPooBahsDateTimeLibrary.isLeapYear(startTime)) ? 31622400 : 31536000;

        if (d1Year == d2Year) {
            // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
            return int256(BokkyPooBahsDateTimeLibrary.diffSeconds(startTime, endTime)).fixedDiv(firstBasis);
        }

        // no risk of overflow
        // 366 * 86400, 365 * 86400
        int256 secondBasis = (BokkyPooBahsDateTimeLibrary.isLeapYear(endTime)) ? 31622400 : 31536000;

        // fixedDiv on two non fixed point integers returns the quotient in fixed point representation (10 ** 18)
        int256 firstFraction = int256(BokkyPooBahsDateTimeLibrary.diffSeconds(
            startTime,
            BokkyPooBahsDateTimeLibrary.timestampFromDate(d1Year.add(1), 1, 1)
        )).fixedDiv(firstBasis);
        int256 secondFraction = int256(BokkyPooBahsDateTimeLibrary.diffSeconds(
            BokkyPooBahsDateTimeLibrary.timestampFromDate(d2Year, 1, 1),
            endTime
        )).fixedDiv(secondBasis);

        return firstFraction.add(secondFraction).add(int256(d2Year.sub(d1Year).sub(1)));
    }
}
