pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "truffle/Assert.sol";

import "../../contracts/Core/Core.sol";


/** Covered test cases:
    - cycle not set, different overlaps, with or without endtime
    - Different overlaps of segment and cycle with or without addEndtime
        - start before, end before
        - start before, end within
        - start before, end after
        - start within, end within
        - start within, end after
        - start after, end after

        The tests are divided into multiple parts to avoid a stack which is too deep
*/
contract TestCoreSchedule is Core {

    /*
     * test cases where cycle.isSet == false
     */
    function testComputeDatesFromCycleSegment_1() public {
        IPS memory c = IPS(1, P.M, S.LONG, false); // Every 1 month, isSet = false
        bool addEndTime = false;
        uint256 cStart = 1514764800; // Monday, 2018-01-01 00:00:00 UTC
        uint256 cEnd = 1538352000; // Monday, 2018-10-01 00:00:00 UTC
        uint256 sStart = 1525132800; // Tuesday, 2018-05-01 00:00:00 UTC
        uint256 sEnd = 1535760000; // Saturday, 2018-09-01 00:00:00 UTC

        // Segment lies before cycle
        uint256[MAX_CYCLE_SIZE] memory result_t1; // empty array
        Assert.equal(
            keccak256(abi.encode(computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, 0, 0))),
            keccak256(abi.encode(result_t1)),
            "Should return an empty array"
        );

        // Segment lies after cycle
        uint256[MAX_CYCLE_SIZE] memory result_t2; // empty array
        Assert.equal(
            keccak256(abi.encode(computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, 9999999999, 9999999999))),
            keccak256(abi.encode(result_t2)),
            "Should return an empty array"
        );

        // Segment lies within cycle
        uint256[MAX_CYCLE_SIZE] memory result_t3;
        uint256[MAX_CYCLE_SIZE] memory dates_t3 = computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd);

        Assert.equal(
            keccak256(abi.encode(dates_t3)), keccak256(abi.encode(result_t3)),
            "Should return an empty array");

        // Cycle lies within Segment, addEndTime == false
        uint256[MAX_CYCLE_SIZE] memory result_t4;
        addEndTime = false;
        result_t4[0] = cStart;
        sStart = 0;
        sEnd = 9999999999;
        uint256[MAX_CYCLE_SIZE] memory dates_t4 = computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd);

        Assert.equal(keccak256(abi.encode(dates_t4)), keccak256(abi.encode(result_t4)),
            "Array should contain only the cycle start date");
    }

    /*
     * test cases where cycle.isSet == false (continued)
     */
    function testComputeDatesFromCycleSegment_2() public {
        IPS memory c = IPS(1, P.M, S.LONG, false); // Every 1 month
        bool addEndTime = false;
        uint256 cStart = 1514764800; // Monday, 2018-01-01 00:00:00 UTC
        uint256 cEnd = 1538352000; // Monday, 2018-10-01 00:00:00 UTC
        uint256 sStart = 1525132800; // Tuesday, 2018-05-01 00:00:00 UTC
        uint256 sEnd = 1535760000; // Saturday, 2018-09-01 00:00:00 UTC

        // Cycle lies within Segment, addEndTime == true
        uint256[MAX_CYCLE_SIZE] memory result_t5;
        addEndTime = true;
        result_t5[0] = cStart;
        result_t5[1] = cEnd;

        Assert.equal(
            keccak256(abi.encode(computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, 0, 9999999999))),
            keccak256(abi.encode(result_t5)),
            "Array should contain cycle start and end dates");

        // Only cycle start lies within segment, addEndTime == true
        addEndTime = true;
        uint256[MAX_CYCLE_SIZE] memory result_t6;
        result_t6[0] = cStart;
        Assert.equal(
            keccak256(abi.encode(computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, 0, sEnd))),
            keccak256(abi.encode(result_t6)),
            "Should contain cycle start date"
        );

        // Only cycle end lies within segment, addEndTime == false
        addEndTime = false;
        uint256[MAX_CYCLE_SIZE] memory result_t7; // empty array
        Assert.equal(
            keccak256(abi.encode(computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, 9999999999))),
            keccak256(abi.encode(result_t7)),
            "Should return an empty array"
        );
    }

    /*
     * test cases where cycle.isSet == true
     */
    function testComputeDatesFromCycleSegment_3() public {
        // Initialize variables
        IPS memory c = IPS(1, P.M, S.LONG, true); // Every 1 month
        bool addEndTime = false;
        uint256 cStart = 1514764800; // Monday, 2018-01-01 00:00:00 UTC
        uint256 cEnd = 1538352000; // Monday, 2018-10-01 00:00:00 UTC
        uint256 sStart = 1525132800; // Tuesday, 2018-05-01 00:00:00 UTC
        uint256 sEnd = 1535760000; // Saturday, 2018-09-01 00:00:00 UTC

        // Segment lies in cycle
        uint256[MAX_CYCLE_SIZE] memory result_t7; // empty array
        uint256[MAX_CYCLE_SIZE] memory dates_t7;
        dates_t7 = computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd);

        result_t7[0] = uint256(1525132800); // Tuesday, 2018-05-01 00:00:00 UTC
        result_t7[1] = uint256(1527811200); // Friday, 2018-06-01 00:00:00 UTC
        result_t7[2] = uint256(1530403200); // Sunday, 2018-07-01 00:00:00 UTC
        result_t7[3] = uint256(1533081600); // Wednesday, 2018-08-01 00:00:00 UTC
        result_t7[4] = uint256(1535760000); // Saturday, 2018-09-01 00:00:00 UTC

        Assert.equal(
            keccak256(abi.encode(dates_t7)),
            keccak256(abi.encode(result_t7)),
            "Should return 152513280, 1527811200, 1530403200, 1533081600, 1535760000"
        );

        // Segment lies in cycle, addEndTime = false
        addEndTime = false;
        uint256[MAX_CYCLE_SIZE] memory result_t8; // empty array
        uint256[MAX_CYCLE_SIZE] memory dates_t8;
        dates_t8 = computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, 0, 9999999999);

        result_t8[0] = uint256(1514764800); // Monday, 2018-01-01 00:00:00 UTC
        result_t8[1] = uint256(1517443200); // Thursday, 2018-02-01 00:00:00 UTC
        result_t8[2] = uint256(1519862400); // Thursday, 2018-03-01 00:00:00 UTC
        result_t8[3] = uint256(1522540800); // Sunday, 2018-04-01 00:00:00 UTC
        result_t8[4] = uint256(1525132800); // Tuesday, 2018-05-01 00:00:00 UTC
        result_t8[5] = uint256(1527811200); // Friday, 2018-06-01 00:00:00 UTC
        result_t8[6] = uint256(1530403200); // Sunday, 2018-07-01 00:00:00 UTC
        result_t8[7] = uint256(1533081600); // Wednesday, 2018-08-01 00:00:00 UTC
        result_t8[8] = uint256(1535760000); // Saturday, 2018-09-01 00:00:00 UTC

        Assert.equal(
            keccak256(abi.encode(dates_t8)),
            keccak256(abi.encode(result_t8)),
            "Should return 1514764800, 1517443200, 1519862400, 1522540800, 1525132800, 1527811200, 1530403200, 1533081600, 1535760000"
        );

        // Segment lies in cycle, addEndTime = true
        addEndTime = true;
        uint256[MAX_CYCLE_SIZE] memory result_t9; // empty array
        uint256[MAX_CYCLE_SIZE] memory dates_t9;
        dates_t9 = computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, 0, 9999999999);

        result_t9[0] = uint256(1514764800); // Monday, 2018-01-01 00:00:00 UTC
        result_t9[1] = uint256(1517443200); // Thursday, 2018-02-01 00:00:00 UTC
        result_t9[2] = uint256(1519862400); // Thursday, 2018-03-01 00:00:00 UTC
        result_t9[3] = uint256(1522540800); // Sunday, 2018-04-01 00:00:00 UTC
        result_t9[4] = uint256(1525132800); // Tuesday, 2018-05-01 00:00:00 UTC
        result_t9[5] = uint256(1527811200); // Friday, 2018-06-01 00:00:00 UTC
        result_t9[6] = uint256(1530403200); // Sunday, 2018-07-01 00:00:00 UTC
        result_t9[7] = uint256(1533081600); // Wednesday, 2018-08-01 00:00:00 UTC
        result_t9[8] = uint256(1535760000); // Saturday, 2018-09-01 00:00:00 UTC
        result_t9[9] = uint256(1538352000); // Monday, 2018-10-01 00:00:00 UTC

        Assert.equal(
            keccak256(abi.encode(dates_t9)),
            keccak256(abi.encode(result_t9)),
            "Should return 1514764800, 1517443200, 1519862400, 1522540800, 1525132800, 1527811200, 1530403200, 1533081600, 1535760000, 1538352000"
        );
    }

    /*
     * The two following test ar for the case when the SD end of month convention
     * is selected but the start date is on the 30th of a month. For all months with
     * >= 30 days the date will be on the 30th. For Febuary it will be on
     * the 28th except for leap years, where it will be on the 29th
     */
    function test_Schedule_Monthly_SD_shortstub_startEndMonthApr() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.SHORT, true);
        uint256 start = 1461974400; // 2016-04-30T00:00:00
        uint256 end = 1488326400; // 2017-03-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1461974400; // 2016-04-30T00:00:00
        expectedDates[1] = 1464566400; // 2016-05-30T00:00:00
        expectedDates[2] = 1467244800; // 2016-06-30T00:00:00
        expectedDates[3] = 1469836800; // 2016-07-30T00:00:00
        expectedDates[4] = 1472515200; // 2016-08-30T00:00:00
        expectedDates[5] = 1475193600; // 2016-09-30T00:00:00
        expectedDates[6] = 1477785600; // 2016-10-30T00:00:00
        expectedDates[7] = 1480464000; // 2016-11-30T00:00:00
        expectedDates[8] = 1483056000; // 2016-12-30T00:00:00
        expectedDates[9] = 1485734400; // 2017-01-30T00:00:00
        expectedDates[10] = 1488240000; // 2017-02-28T00:00:00
        expectedDates[11] = 1488326400; // 2017-03-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }
    function test_Schedule_Monthly_SD_shortstub_startEndMonthApr_leapyear() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.SHORT, true);
        uint256 start = 1430352000; // 2015-04-30T00:00:00
        uint256 end = 1456790400; // 2016-03-01T00:00:00 - 2016 is a leap year

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1430352000; // 2015-04-30T00:00:00
        expectedDates[1] = 1432944000; // 2015-05-30T00:00:00
        expectedDates[2] = 1435622400; // 2015-06-30T00:00:00
        expectedDates[3] = 1438214400; // 2015-07-30T00:00:00
        expectedDates[4] = 1440892800; // 2015-08-30T00:00:00
        expectedDates[5] = 1443571200; // 2015-09-30T00:00:00
        expectedDates[6] = 1446163200; // 2015-10-30T00:00:00
        expectedDates[7] = 1448841600; // 2015-11-30T00:00:00
        expectedDates[8] = 1451433600; // 2015-12-30T00:00:00
        expectedDates[9] = 1454112000; // 2016-01-30T00:00:00
        expectedDates[10] = 1456704000; // 2016-02-29T00:00:00
        expectedDates[11] = 1456790400; // 2016-03-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }
}
