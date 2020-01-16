pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "truffle/Assert.sol";

import "../../contracts/Core/Core.sol";


/*
 * Test modelled after the official ACTUS tests
 */
contract TestCoreScheduleACTUS is Core {

    function test_Schedule_Daily_SD_shortstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.D, S.SHORT, true); // Every 1 day
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1452816000; // 2016-01-15T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        for (uint i = 0; i < 15; i++){
            expectedDates[i] = start + i*86400;
        }

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Daily_EOM_shortstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.D, S.SHORT, true); // Every 1 day
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1452816000; // 2016-01-15T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        for (uint i = 0; i < 15; i++){
            expectedDates[i] = start + i*86400;
        }

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Daily_SD_longstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.D, S.LONG, true); // Every 1 day
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1452816000; // 2016-01-15T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        for (uint i = 0; i < 15; i++){
            expectedDates[i] = start + i*86400;
        }

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Daily_SD_shortstub_endT24() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.D, S.SHORT, true); // Every 1 day
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1452815999; // 2016-01-14T23:59:59

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        for (uint i = 0; i < 14; i++){
            expectedDates[i] = start + i*86400;
        }
        expectedDates[14] = 1452815999; // 2016-01-14T23:59:59

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Daily_SD_longstub_endT24() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.D, S.LONG, true); // Every 1 day
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1452815999; // 2016-01-14T23:59:59

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        for (uint i = 0; i < 13; i++){
            expectedDates[i] = start + i*86400;
        }
        expectedDates[13] = 1452815999; // 2016-01-14T23:59:59

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_BiDaily_SD_shortstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.D, S.SHORT, true); // Every 2 days
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1453852800; // 2016-01-27T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        uint256 index;
        for (uint i = 0; i < 28; i += 2){
            expectedDates[index] = start + i*86400;
            index++;
        }

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
}

    function test_Schedule_31Daily_EOM_shortstub_startEndMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(31, P.D, S.SHORT, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Weekly_SD_shortstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.W, S.SHORT, true);
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1459468800; // 2016-04-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        c = IPS(7, P.D, S.SHORT, true);
        expectedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Weekly_SD_longstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.W, S.LONG, true);
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1459468800; // 2016-04-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        c = IPS(7, P.D, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Weekly_EOM_shortstub_startMidMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.W, S.SHORT, true);
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1459468800; // 2016-04-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        c = IPS(7, P.D, S.SHORT, true);
        expectedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Weekly_EOM_shortstub_startEndMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.W, S.SHORT, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1459468800; // 2016-04-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        c = IPS(7, P.D, S.SHORT, true);
        expectedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_4Weekly_SD_longstub_startEndMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(4, P.W, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        c = IPS(28, P.D, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_4Weekly_EOM_longstub_startEndMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(4, P.W, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        c = IPS(28, P.D, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_4Weekly_EOM_shortstub_startEndMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(4, P.W, S.SHORT, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        c = IPS(28, P.D, S.SHORT, true);
        expectedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Monthly_SD_shortstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.SHORT, true);
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1451606400; // 2016-01-01T00:00:00
        expectedDates[1] = 1454284800; // 2016-02-01T00:00:00
        expectedDates[2] = 1456790400; // 2016-03-01T00:00:00
        expectedDates[3] = 1459468800; // 2016-04-01T00:00:00
        expectedDates[4] = 1462060800; // 2016-05-01T00:00:00
        expectedDates[5] = 1464739200; // 2016-06-01T00:00:00
        expectedDates[6] = 1467331200; // 2016-07-01T00:00:00
        expectedDates[7] = 1470009600; // 2016-08-01T00:00:00
        expectedDates[8] = 1472688000; // 2016-09-01T00:00:00
        expectedDates[9] = 1475280000; // 2016-10-01T00:00:00
        expectedDates[10] = 1477958400; // 2016-11-01T00:00:00
        expectedDates[11] = 1480550400; // 2016-12-01T00:00:00
        expectedDates[12] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Monthly_SD_longstub_startBeginningMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.LONG, true);
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1451606400; // 2016-01-01T00:00:00
        expectedDates[1] = 1454284800; // 2016-02-01T00:00:00
        expectedDates[2] = 1456790400; // 2016-03-01T00:00:00
        expectedDates[3] = 1459468800; // 2016-04-01T00:00:00
        expectedDates[4] = 1462060800; // 2016-05-01T00:00:00
        expectedDates[5] = 1464739200; // 2016-06-01T00:00:00
        expectedDates[6] = 1467331200; // 2016-07-01T00:00:00
        expectedDates[7] = 1470009600; // 2016-08-01T00:00:00
        expectedDates[8] = 1472688000; // 2016-09-01T00:00:00
        expectedDates[9] = 1475280000; // 2016-10-01T00:00:00
        expectedDates[10] = 1477958400; // 2016-11-01T00:00:00
        expectedDates[11] = 1480550400; // 2016-12-01T00:00:00
        expectedDates[12] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Monthly_SD_shortstub_startMidMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.SHORT, true);
        uint256 start = 1452816000; // 2016-01-15T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1452816000; // 2016-01-15T00:00:00
        expectedDates[1] = 1455494400; // 2016-02-15T00:00:00
        expectedDates[2] = 1458000000; // 2016-03-15T00:00:00
        expectedDates[3] = 1460678400; // 2016-04-15T00:00:00
        expectedDates[4] = 1463270400; // 2016-05-15T00:00:00
        expectedDates[5] = 1465948800; // 2016-06-15T00:00:00
        expectedDates[6] = 1468540800; // 2016-07-15T00:00:00
        expectedDates[7] = 1471219200; // 2016-08-15T00:00:00
        expectedDates[8] = 1473897600; // 2016-09-15T00:00:00
        expectedDates[9] = 1476489600; // 2016-10-15T00:00:00
        expectedDates[10] = 1479168000; // 2016-11-15T00:00:00
        expectedDates[11] = 1481760000; // 2016-12-15T00:00:00
        expectedDates[12] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Monthly_SD_longstub_startMidMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.LONG, true);
        uint256 start = 1452816000; // 2016-01-15T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1452816000; // 2016-01-15T00:00:00
        expectedDates[1] = 1455494400; // 2016-02-15T00:00:00
        expectedDates[2] = 1458000000; // 2016-03-15T00:00:00
        expectedDates[3] = 1460678400; // 2016-04-15T00:00:00
        expectedDates[4] = 1463270400; // 2016-05-15T00:00:00
        expectedDates[5] = 1465948800; // 2016-06-15T00:00:00
        expectedDates[6] = 1468540800; // 2016-07-15T00:00:00
        expectedDates[7] = 1471219200; // 2016-08-15T00:00:00
        expectedDates[8] = 1473897600; // 2016-09-15T00:00:00
        expectedDates[9] = 1476489600; // 2016-10-15T00:00:00
        expectedDates[10] = 1479168000; // 2016-11-15T00:00:00
        expectedDates[11] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_BiMonthly_SD_longstub_startBeginningMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.M, S.LONG, true);
        uint256 start = 1451606400; // 2016-01-01T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1451606400; // 2016-01-01T00:00:00
        expectedDates[1] = 1456790400; // 2016-03-01T00:00:00
        expectedDates[2] = 1462060800; // 2016-05-01T00:00:00
        expectedDates[3] = 1467331200; // 2016-07-01T00:00:00
        expectedDates[4] = 1472688000; // 2016-09-01T00:00:00
        expectedDates[5] = 1477958400; // 2016-11-01T00:00:00
        expectedDates[6] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_BiMonthly_SD_longstub_startMidMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.M, S.LONG, true);
        uint256 start = 1452816000; // 2016-01-15T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1452816000; // 2016-01-15T00:00:00
        expectedDates[1] = 1458000000; // 2016-03-15T00:00:00
        expectedDates[2] = 1463270400; // 2016-05-15T00:00:00
        expectedDates[3] = 1468540800; // 2016-07-15T00:00:00
        expectedDates[4] = 1473897600; // 2016-09-15T00:00:00
        expectedDates[5] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Monthly_EOM_shortstub_startMidMonth() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.SHORT, true);
        uint256 start = 1452816000; // 2016-01-15T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1452816000; // 2016-01-15T00:00:00
        expectedDates[1] = 1455494400; // 2016-02-15T00:00:00
        expectedDates[2] = 1458000000; // 2016-03-15T00:00:00
        expectedDates[3] = 1460678400; // 2016-04-15T00:00:00
        expectedDates[4] = 1463270400; // 2016-05-15T00:00:00
        expectedDates[5] = 1465948800; // 2016-06-15T00:00:00
        expectedDates[6] = 1468540800; // 2016-07-15T00:00:00
        expectedDates[7] = 1471219200; // 2016-08-15T00:00:00
        expectedDates[8] = 1473897600; // 2016-09-15T00:00:00
        expectedDates[9] = 1476489600; // 2016-10-15T00:00:00
        expectedDates[10] = 1479168000; // 2016-11-15T00:00:00
        expectedDates[11] = 1481760000; // 2016-12-15T00:00:00
        expectedDates[12] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }


/*
 *  End of Month Tests (deactivated)
 *
        function test_Schedule_Monthly_EOM_shortstub_startEndMonthFeb() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.SHORT, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1456704000; // 2016-02-29T00:00:00
        expectedDates[1] = 1459382400; // 2016-03-31T00:00:00
        expectedDates[2] = 1461974400; // 2016-04-30T00:00:00
        expectedDates[3] = 1464652800; // 2016-05-31T00:00:00
        expectedDates[4] = 1467244800; // 2016-06-30T00:00:00
        expectedDates[5] = 1469923200; // 2016-07-31T00:00:00
        expectedDates[6] = 1472601600; // 2016-08-31T00:00:00
        expectedDates[7] = 1475193600; // 2016-09-30T00:00:00
        expectedDates[8] = 1477872000; // 2016-10-31T00:00:00
        expectedDates[9] = 1480464000; // 2016-11-30T00:00:00
        expectedDates[10] = 1483142400; // 2016-12-31T00:00:00
        expectedDates[11] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Monthly_EOM_longstub_startEndMonthFeb() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1456704000; // 2016-02-29T00:00:00
        expectedDates[1] = 1459382400; // 2016-03-31T00:00:00
        expectedDates[2] = 1461974400; // 2016-04-30T00:00:00
        expectedDates[3] = 1464652800; // 2016-05-31T00:00:00
        expectedDates[4] = 1467244800; // 2016-06-30T00:00:00
        expectedDates[5] = 1469923200; // 2016-07-31T00:00:00
        expectedDates[6] = 1472601600; // 2016-08-31T00:00:00
        expectedDates[7] = 1475193600; // 2016-09-30T00:00:00
        expectedDates[8] = 1477872000; // 2016-10-31T00:00:00
        expectedDates[9] = 1480464000; // 2016-11-30T00:00:00
        expectedDates[10] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Monthly_EOM_longstub_startEndMonthMar() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.LONG, true);
        uint256 start = 1459382400; // 2016-03-31T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1459382400; // 2016-03-31T00:00:00
        expectedDates[1] = 1461974400; // 2016-04-30T00:00:00
        expectedDates[2] = 1464652800; // 2016-05-31T00:00:00
        expectedDates[3] = 1467244800; // 2016-06-30T00:00:00
        expectedDates[4] = 1469923200; // 2016-07-31T00:00:00
        expectedDates[5] = 1472601600; // 2016-08-31T00:00:00
        expectedDates[6] = 1475193600; // 2016-09-30T00:00:00
        expectedDates[7] = 1477872000; // 2016-10-31T00:00:00
        expectedDates[8] = 1480464000; // 2016-11-30T00:00:00
        expectedDates[9] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Monthly_EOM_longstub_startEndMonthApr() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.M, S.LONG, true);
        uint256 start = 1461974400; // 2016-04-30T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1461974400; // 2016-04-30T00:00:00
        expectedDates[1] = 1464652800; // 2016-05-31T00:00:00
        expectedDates[2] = 1467244800; // 2016-06-30T00:00:00
        expectedDates[3] = 1469923200; // 2016-07-31T00:00:00
        expectedDates[4] = 1472601600; // 2016-08-31T00:00:00
        expectedDates[5] = 1475193600; // 2016-09-30T00:00:00
        expectedDates[6] = 1477872000; // 2016-10-31T00:00:00
        expectedDates[7] = 1480464000; // 2016-11-30T00:00:00
        expectedDates[8] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_BiMonthly_EOM_longstub_startEndMonthFeb() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.M, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1456704000; // 2016-02-29T00:00:00
        expectedDates[1] = 1461974400; // 2016-04-30T00:00:00
        expectedDates[2] = 1467244800; // 2016-06-30T00:00:00
        expectedDates[3] = 1472601600; // 2016-08-31T00:00:00
        expectedDates[4] = 1477872000; // 2016-10-31T00:00:00
        expectedDates[5] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    } */

    function test_Schedule_BiMonthly_SD_shortstub_onlyStartAndEndTimes() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.M, S.SHORT, true);
        uint256 start = 1477958400; // 2016-11-01T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1477958400; // 2016-11-01T00:00:00
        expectedDates[1] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_BiMonthly_EOM_shortstub_onlyStartAndEndTimes() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.M, S.SHORT, true);
        uint256 start = 1480464000; // 2016-11-30T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1480464000; // 2016-11-30T00:00:00
        expectedDates[1] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_BiMonthly_EOM_longstub_onlyStartAndEndTimes() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.M, S.LONG, true);
        uint256 start = 1480464000; // 2016-11-30T00:00:00
        uint256 end = 1483228800; // 2017-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(start, end, c, true, 0, 9999999999);

        expectedDates[0] = 1480464000; // 2016-11-30T00:00:00
        expectedDates[1] = 1483228800; // 2017-01-01T00:00:00

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Quarterly_SD_shortstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.Q, S.SHORT, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1546300800; // 2019-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        c = IPS(3, P.M, S.SHORT, true);
        expectedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Quarterly_SD_longstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.Q, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1546300800; // 2019-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        c = IPS(3, P.M, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Quarterly_EOM_longstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.Q, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1546300800; // 2019-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        c = IPS(3, P.M, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_BiQuarterly_EOM_longstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.Q, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1640995200; // 2022-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        c = IPS(6, P.M, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Halfyear_EOM_longstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.H, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1640995200; // 2022-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        c = IPS(2, P.Q, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_Yearly_EOM_longstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(1, P.Y, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1640995200; // 2022-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        c = IPS(2, P.H, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }

    function test_Schedule_BiYearly_EOM_longstub() public {
        uint256[MAX_CYCLE_SIZE] memory expectedDates;
        uint256[MAX_CYCLE_SIZE] memory generatedDates;

        IPS memory c = IPS(2, P.Y, S.LONG, true);
        uint256 start = 1456704000; // 2016-02-29T00:00:00
        uint256 end = 1767225600; // 2026-01-01T00:00:00

        generatedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        c = IPS(4, P.H, S.LONG, true);
        expectedDates = computeDatesFromCycleSegment(
                start, end, c, true, 0, 9999999999);

        Assert.equal(
            keccak256(abi.encode(expectedDates)),
            keccak256(abi.encode(generatedDates)),
            "Generated schedules should be equal."
        );
    }
}
