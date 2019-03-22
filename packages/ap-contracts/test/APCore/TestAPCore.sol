pragma solidity ^0.5.2;

import "truffle/Assert.sol";

import "../../contracts/APCore/APCore.sol";


contract TestAPCore is APCore {

  function testPerformanceIndicator() public {
    Assert.equal(performanceIndicator(ContractStatus.PF), 1, "Performance should be 1");
    Assert.equal(performanceIndicator(ContractStatus.DL), 1, "Performance should be 1");
    Assert.equal(performanceIndicator(ContractStatus.DQ), 1, "Performance should be 1");
    Assert.equal(performanceIndicator(ContractStatus.DF), 0, "Performance should be 0");
  }

  function testRoleSign() public {
    Assert.equal(roleSign(ContractRole.RPA), 1, "Sign should be 1");
    Assert.equal(roleSign(ContractRole.RPL), -1, "Sign should be -1");
  }

  function testSignum() public {
    Assert.equal(signum(1), 1, "Sign should be 1");
    Assert.equal(signum(-2), -1, "Sign should be -1");
  }

  function testYearFraction() public {
    Assert.equal(yearFraction(1506816000, 1538352000, DayCountConvention.A_360), 1013888888888888888, "YearFraction should be 1.013888888888888888");
    Assert.equal(yearFraction(1506816000, 1538352000, DayCountConvention.A_365), 1000000000000000000, "YearFraction should be 1.0");
    Assert.equal(yearFraction(1506816000, 1538352000, DayCountConvention._30E_360), 1000000000000000000, "YearFraction should be 1.0");
  }

  function testGetTimestampPlusPeriod() public {
    Assert.equal(getTimestampPlusPeriod(IPS(1, P.D, S.LONG, true), 1514764800), 1514851200, "Timestamp + 1D+ should be 1514851200");
    Assert.equal(getTimestampPlusPeriod(IPS(5, P.D, S.LONG, true), 1514764800), 1515196800, "Timestamp + 5D+ should be 1515196800");
    Assert.equal(getTimestampPlusPeriod(IPS(1, P.W, S.LONG, true), 1514764800), 1515369600, "Timestamp + 1W+ should be 1515369600");
    Assert.equal(getTimestampPlusPeriod(IPS(5, P.W, S.LONG, true), 1514764800), 1517788800, "Timestamp + 5W+ should be 1517788800");
    Assert.equal(getTimestampPlusPeriod(IPS(1, P.Q, S.LONG, true), 1514764800), 1522540800, "Timestamp + 1Q+ should be 1522540800");
    Assert.equal(getTimestampPlusPeriod(IPS(3, P.Q, S.LONG, true), 1514764800), 1538352000, "Timestamp + 3Q+ should be 1538352000");
    Assert.equal(getTimestampPlusPeriod(IPS(1, P.H, S.LONG, true), 1514764800), 1530403200, "Timestamp + 1H+ should be 1530403200");
    Assert.equal(getTimestampPlusPeriod(IPS(5, P.H, S.LONG, true), 1514764800), 1593561600, "Timestamp + 5H+ should be 1593561600");
    Assert.equal(getTimestampPlusPeriod(IPS(1, P.Y, S.LONG, true), 1514764800), 1546300800, "Timestamp + 1Y+ should be 1546300800");
    Assert.equal(getTimestampPlusPeriod(IPS(5, P.Y, S.LONG, true), 1514764800), 1672531200, "Timestamp + 5Y+ should be 1672531200");
  }
}
