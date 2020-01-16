pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "truffle/Assert.sol";

import "../../contracts/Core/Core.sol";


contract TestCore is Core {

    function testPerformanceIndicator() public {
        Assert.equal(performanceIndicator(ContractPerformance.PF), 1, "Performance should be 1");
        Assert.equal(performanceIndicator(ContractPerformance.DL), 1, "Performance should be 1");
        Assert.equal(performanceIndicator(ContractPerformance.DQ), 1, "Performance should be 1");
        Assert.equal(performanceIndicator(ContractPerformance.DF), 0, "Performance should be 0");
    }

    function testRoleSign() public {
        Assert.equal(roleSign(ContractRole.RPA), 1, "Sign should be 1");
        Assert.equal(roleSign(ContractRole.RPL), -1, "Sign should be -1");
    }

    function testYearFraction() public {
        // A/360 convention
        Assert.equal(
            yearFraction(1138665600, 1141084800, DayCountConvention.A_360, 0),
            0.077777777777777777*1000000000000000000,
            "_A_360-1 YearFraction should be 0.077777777777777777"
        );
        Assert.equal(
            yearFraction(1138579200, 1141084800, DayCountConvention.A_360, 0),
            0.080555555555555555*1000000000000000000,
            "_A_360-2 YearFraction should be 0.080555555555555555"
        );
        Assert.equal(
            yearFraction(1141084800, 1141344000, DayCountConvention.A_360, 0),
            0.008333333333333333*1000000000000000000,
            "_A_360-3 YearFraction should be 0.008333333333333333"
        );
        Assert.equal(
            yearFraction(1139875200, 1141084800, DayCountConvention.A_360, 0),
            0.038888888888888888*1000000000000000000,
            "_A_360-4 YearFraction should be 0.038888888888888888"
        );
        Assert.equal(
            yearFraction(1159574400, 1162252800, DayCountConvention.A_360, 0),
            0.086111111111111111*1000000000000000000,
            "_A_360-5 YearFraction should be 0.086111111111111111"
        );
        Assert.equal(
            yearFraction(1162252800, 1164672000, DayCountConvention.A_360, 0),
            0.077777777777777777*1000000000000000000,
            "_A_360-6 YearFraction should be 0.077777777777777777"
        );
        Assert.equal(
            yearFraction(1188518400, 1204156800, DayCountConvention.A_360, 0),
            0.502777777777777777*1000000000000000000,
            "_A_360-7 YearFraction should be 0.502777777777777777"
        );
        Assert.equal(
            yearFraction(1204156800, 1219881600, DayCountConvention.A_360, 0),
            0.505555555555555555*1000000000000000000,
            "_A_360-8 YearFraction should be 0.505555555555555555"
        );
        Assert.equal(
            yearFraction(1204156800, 1220054400, DayCountConvention.A_360, 0),
            0.511111111111111111*1000000000000000000,
            "_A_360-9 YearFraction should be 0.511111111111111111"
        );
        Assert.equal(
            yearFraction(1204156800, 1220140800, DayCountConvention.A_360, 0),
            0.513888888888888888*1000000000000000000,
            "_A_360-10 YearFraction should be 0.513888888888888888"
        );
        Assert.equal(
            yearFraction(1172448000, 1204156800, DayCountConvention.A_360, 0),
            1.019444444444444444*1000000000000000000,
            "_A_360-11 YearFraction should be 1.019444444444444444"
        );
        Assert.equal(
            yearFraction(1172448000, 1204243200, DayCountConvention.A_360, 0),
            1.022222222222222222*1000000000000000000,
            "_A_360-12 YearFraction should be 1.022222222222222222"
        );
        Assert.equal(
            yearFraction(1204243200, 1235779200, DayCountConvention.A_360, 0),
            1.013888888888888888*1000000000000000000,
            "_A_360-13 YearFraction should be 1.013888888888888888"
        );
        Assert.equal(
            yearFraction(1204156800, 1206835200, DayCountConvention.A_360, 0),
            0.086111111111111111*1000000000000000000,
            "_A_360-14 YearFraction should be 0.086111111111111111"
        );
        Assert.equal(
            yearFraction(1204156800, 1206921600, DayCountConvention.A_360, 0),
            0.088888888888888888*1000000000000000000,
            "_A_360-15 YearFraction should be 0.088888888888888888"
        );

        // A/365 convention
        Assert.equal(
            yearFraction(1138665600, 1141084800, DayCountConvention.A_365, 0),
            0.076712328767123287*1000000000000000000,
            "_A_365-1 YearFraction should be 0.076712328767123287"
        );
        Assert.equal(
            yearFraction(1138579200, 1141084800, DayCountConvention.A_365, 0),
            0.079452054794520547*1000000000000000000,
            "_A_365-2 YearFraction should be 0.079452054794520547"
        );
        Assert.equal(
            yearFraction(1141084800, 1141344000, DayCountConvention.A_365, 0),
            0.00821917808219178*1000000000000000000,
            "_A_365-3 YearFraction should be 0.00821917808219178"
        );
        Assert.equal(
            yearFraction(1139875200, 1141084800, DayCountConvention.A_365, 0),
            0.038356164383561643*1000000000000000000,
            "_A_365-4 YearFraction should be 0.038356164383561643"
        );
        Assert.equal(
            yearFraction(1159574400, 1162252800, DayCountConvention.A_365, 0),
            0.084931506849315068*1000000000000000000,
            "_A_365-5 YearFraction should be 0.084931506849315068"
        );
        Assert.equal(
            yearFraction(1162252800, 1164672000, DayCountConvention.A_365, 0),
            0.076712328767123287*1000000000000000000,
            "_A_365-6 YearFraction should be 0.076712328767123287"
        );
        Assert.equal(
            yearFraction(1188518400, 1204156800, DayCountConvention.A_365, 0),
            0.495890410958904109*1000000000000000000,
            "_A_365-7 YearFraction should be 0.495890410958904109"
        );
        Assert.equal(
            yearFraction(1204156800, 1219881600, DayCountConvention.A_365, 0),
            0.498630136986301369*1000000000000000000,
            "_A_365-8 YearFraction should be 0.498630136986301369"
        );
        Assert.equal(
            yearFraction(1204156800, 1220054400, DayCountConvention.A_365, 0),
            0.504109589041095890*1000000000000000000,
            "_A_365-9 YearFraction should be 0.504109589041095890"
        );
        Assert.equal(
            yearFraction(1204156800, 1220140800, DayCountConvention.A_365, 0),
            0.506849315068493150*1000000000000000000,
            "_A_365-10 YearFraction should be 0.506849315068493150"
        );
        Assert.equal(
            yearFraction(1172448000, 1204156800, DayCountConvention.A_365, 0),
            1.005479452054794520*1000000000000000000,
            "_A_365-11 YearFraction should be 1.005479452054794520"
        );
        Assert.equal(
            yearFraction(1172448000, 1204243200, DayCountConvention.A_365, 0),
            1.008219178082191780*1000000000000000000,
            "_A_365-12 YearFraction should be 1.008219178082191780"
        );
        Assert.equal(
            yearFraction(1204243200, 1235779200, DayCountConvention.A_365, 0),
            1.0*1000000000000000000,
            "_A_365-13 YearFraction should be 1.0"
        );
        Assert.equal(
            yearFraction(1204156800, 1206835200, DayCountConvention.A_365, 0),
            0.084931506849315068*1000000000000000000,
            "_A_365-14 YearFraction should be 0.084931506849315068"
        );
        Assert.equal(
            yearFraction(1204156800, 1206921600, DayCountConvention.A_365, 0),
            0.087671232876712328*1000000000000000000,
            "_A_365-15 YearFraction should be 0.087671232876712328"
        );

        // 30E/360 convention
        Assert.equal(
            yearFraction(1138665600, 1141084800, DayCountConvention._30E_360, 0),
            0.077777777777777777*1000000000000000000,
            "_30E_360-1 YearFraction should be 0.077777777777777777"
        );
        Assert.equal(
            yearFraction(1138579200, 1141084800, DayCountConvention._30E_360, 0),
            0.077777777777777777*1000000000000000000,
            "_30E_360-2 YearFraction should be 0.077777777777777777"
        );
        Assert.equal(
            yearFraction(1141084800, 1141344000, DayCountConvention._30E_360, 0),
            0.013888888888888888*1000000000000000000,
            "_30E_360-3 YearFraction should be 0.013888888888888888"
        );
        Assert.equal(
            yearFraction(1139875200, 1141084800, DayCountConvention._30E_360, 0),
            0.038888888888888888*1000000000000000000,
            "_30E_360-4 YearFraction should be 0.038888888888888888"
        );
        Assert.equal(
            yearFraction(1159574400, 1162252800, DayCountConvention._30E_360, 0),
            0.083333333333333333*1000000000000000000,
            "_30E_360-5 YearFraction should be 0.083333333333333333"
        );
        Assert.equal(
            yearFraction(1162252800, 1164672000, DayCountConvention._30E_360, 0),
            0.077777777777777777*1000000000000000000,
            "_30E_360-6 YearFraction should be 0.077777777777777777"
        );
        Assert.equal(
            yearFraction(1188518400, 1204156800, DayCountConvention._30E_360, 0),
            0.494444444444444444*1000000000000000000,
            "_30E_360-7 YearFraction should be 0.494444444444444444"
        );
        Assert.equal(
            yearFraction(1204156800, 1219881600, DayCountConvention._30E_360, 0),
            0.5*1000000000000000000,
            "_30E_360-8 YearFraction should be 0.5"
        );
        Assert.equal(
            yearFraction(1204156800, 1220054400, DayCountConvention._30E_360, 0),
            0.505555555555555555*1000000000000000000,
            "_30E_360-9 YearFraction should be 0.505555555555555555"
        );
        Assert.equal(
            yearFraction(1204156800, 1220140800, DayCountConvention._30E_360, 0),
            0.505555555555555555*1000000000000000000,
            "_30E_360-10 YearFraction should be 0.505555555555555555"
        );
        Assert.equal(
            yearFraction(1172448000, 1204156800, DayCountConvention._30E_360, 0),
            1.005555555555555555*1000000000000000000,
            "_30E_360-11 YearFraction should be 1.005555555555555555"
        );
        Assert.equal(
            yearFraction(1172448000, 1204243200, DayCountConvention._30E_360, 0),
            1.008333333333333333*1000000000000000000,
            "_30E_360-12 YearFraction should be 1.008333333333333333"
        );
        Assert.equal(
            yearFraction(1204243200, 1235779200, DayCountConvention._30E_360, 0),
            0.997222222222222222*1000000000000000000,
            "_30E_360-13 YearFraction should be 0.997222222222222222"
        );
        Assert.equal(
            yearFraction(1204156800, 1206835200, DayCountConvention._30E_360, 0),
            0.088888888888888888*1000000000000000000,
            "_30E_360-14 YearFraction should be 0.088888888888888888"
        );
        Assert.equal(
            yearFraction(1204156800, 1206921600, DayCountConvention._30E_360, 0),
            0.088888888888888888*1000000000000000000,
            "_30E_360-15 YearFraction should be 0.088888888888888888"
        );

        // 30E/360 ISDA convention
        Assert.equal(
            yearFraction(1138665600, 1141084800, DayCountConvention._30E_360ISDA, 1204243200),
            0.083333333333333333*1000000000000000000,
            "_30E_360ISDA-1 YearFraction should be 0.083333333333333333"
        );
        Assert.equal(
            yearFraction(1138579200, 1141084800, DayCountConvention._30E_360ISDA, 1204243200),
            0.083333333333333333*1000000000000000000,
            "_30E_360ISDA-2 YearFraction should be 0.083333333333333333"
        );
        Assert.equal(
            yearFraction(1141084800, 1141344000, DayCountConvention._30E_360ISDA, 1204243200),
            0.008333333333333333*1000000000000000000,
            "_30E_360ISDA-3 YearFraction should be 0.008333333333333333"
        );
        Assert.equal(
            yearFraction(1139875200, 1141084800, DayCountConvention._30E_360ISDA, 1204243200),
            0.044444444444444444*1000000000000000000,
            "_30E_360ISDA-4 YearFraction should be 0.044444444444444444"
        );
        Assert.equal(
            yearFraction(1159574400, 1162252800, DayCountConvention._30E_360ISDA, 1204243200),
            0.083333333333333333*1000000000000000000,
            "_30E_360ISDA-5 YearFraction should be 0.083333333333333333"
        );
        Assert.equal(
            yearFraction(1162252800, 1164672000, DayCountConvention._30E_360ISDA, 1204243200),
            0.077777777777777777*1000000000000000000,
            "_30E_360ISDA-6 YearFraction should be 0.077777777777777777"
        );
        Assert.equal(
            yearFraction(1188518400, 1204156800, DayCountConvention._30E_360ISDA, 1204243200),
            0.494444444444444444*1000000000000000000,
            "_30E_360ISDA-7 YearFraction should be 0.494444444444444444"
        );
        Assert.equal(
            yearFraction(1204156800, 1219881600, DayCountConvention._30E_360ISDA, 1204243200),
            0.5*1000000000000000000,
            "_30E_360ISDA-8 YearFraction should be 0.5"
        );
        Assert.equal(
            yearFraction(1204156800, 1220054400, DayCountConvention._30E_360ISDA, 1204243200),
            0.505555555555555555*1000000000000000000,
            "_30E_360ISDA-9 YearFraction should be 0.505555555555555555"
        );
        Assert.equal(
            yearFraction(1204156800, 1220140800, DayCountConvention._30E_360ISDA, 1204243200),
            0.505555555555555555*1000000000000000000,
            "_30E_360ISDA-10 YearFraction should be 0.505555555555555555"
        );
        Assert.equal(
            yearFraction(1172620800, 1204156800, DayCountConvention._30E_360ISDA, 1204243200),
            0.994444444444444444*1000000000000000000,
            "_30E_360ISDA-11 YearFraction should be 0.994444444444444444"
        );
        Assert.equal(
            yearFraction(1172620800, 1204243200, DayCountConvention._30E_360ISDA, 1204243200),
            0.997222222222222222*1000000000000000000,
            "_30E_360ISDA-12 YearFraction should be 0.997222222222222222"
        );
        Assert.equal(
            yearFraction(1204243200, 1235779200, DayCountConvention._30E_360ISDA, 1204243200),
            1.0*1000000000000000000,
            "_30E_360ISDA-13 YearFraction should be 1.0"
        );
        Assert.equal(
            yearFraction(1204243200, 1206835200, DayCountConvention._30E_360ISDA, 1204243200),
            0.083333333333333333*1000000000000000000,
            "_30E_360ISDA-14 YearFraction should be 0.083333333333333333"
        );
        Assert.equal(
            yearFraction(1204243200, 1206921600, DayCountConvention._30E_360ISDA, 1204243200),
            0.083333333333333333*1000000000000000000,
            "_30E_360ISDA-15 YearFraction should be 0.083333333333333333"
        );
    }

    // function testSortEventSchedule() public {
    //   Event[MAX_EVENT_SCHEDULE_SIZE] memory _eventSchedule;
    //   uint16 index = 0;

    //   _eventSchedule[index] = Event(
    //     uint256(4),
    //     uint256(4).add(getEpochOffset(EventType.TD)),
    //     uint256(4),
    //     EventType.TD,
    //     address(0)
    //   );
    //   index++;

    //   _eventSchedule[index] = Event(
    //     uint256(4),
    //     uint256(4).add(getEpochOffset(EventType.MD)),
    //     uint256(4),
    //     EventType.MD,
    //     address(0)
    //   );
    //   index++;

    //   _eventSchedule[index] = Event(
    //     uint256(1),
    //     uint256(1).add(getEpochOffset(EventType.IED)),
    //     uint256(1),
    //     EventType.IED,
    //     address(0)
    //   );
    //   index++;

    //   sortEventSchedule(_eventSchedule, index);

    //   Assert.equal(uint256(_eventSchedule[0].eventType), uint256(EventType.IED), "First Event in schedule should be IED");
    //   Assert.equal(uint256(_eventSchedule[1].eventType), uint256(EventType.TD), "Second Event in schedule should be TD");
    //   Assert.equal(uint256(_eventSchedule[2].eventType), uint256(EventType.MD), "Second Event in schedule should be MD");
    //   Assert.equal(uint256(_eventSchedule[3].eventTime), uint256(0), "Following Events should be 0");
    //   Assert.equal(uint256(_eventSchedule[4].eventTime), uint256(0), "Following Events should be 0");
    // }

    function testisInSegment() public {
        Assert.equal(isInSegment(uint256(100), uint256(99), uint256(101)), true, "Timestamp should be contained in the period");
        Assert.equal(isInSegment(uint256(100), uint256(99), uint256(100)), true, "Timestamp should be contained in the period");
        Assert.equal(isInSegment(uint256(100), uint256(100), uint256(100)), true, "Timestamp should be contained in the period");
        Assert.equal(isInSegment(uint256(101), uint256(100), uint256(100)), false, "Timestamp should not be contained in the period");
        Assert.equal(isInSegment(uint256(100), uint256(100), uint256(99)), false, "Timestamp should not be contained in the period");
    }

    function testGetTimestampPlusPeriod() public {
        Assert.equal(getTimestampPlusPeriod(IP(1, P.D, true), 1514764800), 1514851200, "Timestamp + 1D+ should be 1514851200");
        Assert.equal(getTimestampPlusPeriod(IP(5, P.D, true), 1514764800), 1515196800, "Timestamp + 5D+ should be 1515196800");
        Assert.equal(getTimestampPlusPeriod(IP(1, P.W, true), 1514764800), 1515369600, "Timestamp + 1W+ should be 1515369600");
        Assert.equal(getTimestampPlusPeriod(IP(5, P.W, true), 1514764800), 1517788800, "Timestamp + 5W+ should be 1517788800");
        Assert.equal(getTimestampPlusPeriod(IP(1, P.Q, true), 1514764800), 1522540800, "Timestamp + 1Q+ should be 1522540800");
        Assert.equal(getTimestampPlusPeriod(IP(3, P.Q, true), 1514764800), 1538352000, "Timestamp + 3Q+ should be 1538352000");
        Assert.equal(getTimestampPlusPeriod(IP(1, P.H, true), 1514764800), 1530403200, "Timestamp + 1H+ should be 1530403200");
        Assert.equal(getTimestampPlusPeriod(IP(5, P.H, true), 1514764800), 1593561600, "Timestamp + 5H+ should be 1593561600");
        Assert.equal(getTimestampPlusPeriod(IP(1, P.Y, true), 1514764800), 1546300800, "Timestamp + 1Y+ should be 1546300800");
        Assert.equal(getTimestampPlusPeriod(IP(5, P.Y, true), 1514764800), 1672531200, "Timestamp + 5Y+ should be 1672531200");
    }


    function testGetNextCycleDate() public {
        Assert.equal(getNextCycleDate(IPS(1, P.D, S.LONG, true), 1514764800, 0), 1514764800, "Timestamp + 1D+ with CycleIndex 0 should be 1514764800");
        Assert.equal(getNextCycleDate(IPS(1, P.W, S.LONG, true), 1514764800, 0), 1514764800, "Timestamp + 1W+ with CycleIndex 0 should be 1514764800");
        Assert.equal(getNextCycleDate(IPS(1, P.Q, S.LONG, true), 1514764800, 0), 1514764800, "Timestamp + 1Q+ with CycleIndex 0 should be 1514764800");
        Assert.equal(getNextCycleDate(IPS(1, P.H, S.LONG, true), 1514764800, 0), 1514764800, "Timestamp + 1H+ with CycleIndex 0 should be 1514764800");
        Assert.equal(getNextCycleDate(IPS(1, P.Y, S.LONG, true), 1514764800, 0), 1514764800, "Timestamp + 1Y+ with CycleIndex 0 should be 1514764800");

        Assert.equal(getNextCycleDate(IPS(1, P.D, S.LONG, true), 1514764800, 1), 1514851200, "Timestamp + 1D+ with CycleIndex 1 should be 1514851200");
        Assert.equal(getNextCycleDate(IPS(5, P.D, S.LONG, true), 1514764800, 1), 1515196800, "Timestamp + 5D+ with CycleIndex 1 should be 1515196800");
        Assert.equal(getNextCycleDate(IPS(1, P.W, S.LONG, true), 1514764800, 1), 1515369600, "Timestamp + 1W+ with CycleIndex 1 should be 1515369600");
        Assert.equal(getNextCycleDate(IPS(5, P.W, S.LONG, true), 1514764800, 1), 1517788800, "Timestamp + 5W+ with CycleIndex 1 should be 1517788800");
        Assert.equal(getNextCycleDate(IPS(1, P.Q, S.LONG, true), 1514764800, 1), 1522540800, "Timestamp + 1Q+ with CycleIndex 1 should be 1522540800");
        Assert.equal(getNextCycleDate(IPS(3, P.Q, S.LONG, true), 1514764800, 1), 1538352000, "Timestamp + 3Q+ with CycleIndex 1 should be 1538352000");
        Assert.equal(getNextCycleDate(IPS(1, P.H, S.LONG, true), 1514764800, 1), 1530403200, "Timestamp + 1H+ with CycleIndex 1 should be 1530403200");
        Assert.equal(getNextCycleDate(IPS(5, P.H, S.LONG, true), 1514764800, 1), 1593561600, "Timestamp + 5H+ with CycleIndex 1 should be 1593561600");
        Assert.equal(getNextCycleDate(IPS(1, P.Y, S.LONG, true), 1514764800, 1), 1546300800, "Timestamp + 1Y+ with CycleIndex 1 should be 1546300800");
        Assert.equal(getNextCycleDate(IPS(5, P.Y, S.LONG, true), 1514764800, 1), 1672531200, "Timestamp + 5Y+ with CycleIndex 1 should be 1672531200");

        Assert.equal(getNextCycleDate(IPS(1, P.D, S.LONG, true), 1514764800, 3), 1515024000, "Timestamp + 1D+ with CycleIndex 3 should be 1515024000");
        Assert.equal(getNextCycleDate(IPS(5, P.D, S.LONG, true), 1514764800, 3), 1516060800, "Timestamp + 5D+ with CycleIndex 3 should be 1516060800");
        Assert.equal(getNextCycleDate(IPS(1, P.W, S.LONG, true), 1514764800, 3), 1516579200, "Timestamp + 1W+ with CycleIndex 3 should be 1516579200");
        Assert.equal(getNextCycleDate(IPS(5, P.W, S.LONG, true), 1514764800, 3), 1523836800, "Timestamp + 5W+ with CycleIndex 3 should be 1523836800");
        Assert.equal(getNextCycleDate(IPS(1, P.Q, S.LONG, true), 1514764800, 3), 1538352000, "Timestamp + 1Q+ with CycleIndex 3 should be 1538352000");
        Assert.equal(getNextCycleDate(IPS(3, P.Q, S.LONG, true), 1514764800, 3), 1585699200, "Timestamp + 3Q+ with CycleIndex 3 should be 1585699200");
        Assert.equal(getNextCycleDate(IPS(1, P.H, S.LONG, true), 1514764800, 3), 1561939200, "Timestamp + 1H+ with CycleIndex 3 should be 1561939200");
        Assert.equal(getNextCycleDate(IPS(5, P.H, S.LONG, true), 1514764800, 3), 1751328000, "Timestamp + 5H+ with CycleIndex 3 should be 1751328000");
        Assert.equal(getNextCycleDate(IPS(1, P.Y, S.LONG, true), 1514764800, 3), 1609459200, "Timestamp + 1Y+ with CycleIndex 3 should be 1609459200");
        Assert.equal(getNextCycleDate(IPS(5, P.Y, S.LONG, true), 1514764800, 3), 1988150400, "Timestamp + 5Y+ with CycleIndex 3 should be 1988150400");
    }
}
