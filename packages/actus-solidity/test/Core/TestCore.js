const BigNumber = require('bignumber.js');

const TestCore = artifacts.require('TestCore.sol');


contract('Core', () => {
  before(async () => {       
    this.TestCore = await TestCore.new();
  });

  it('should test ContractDefaultConvention', async () => {
    assert.equal(await this.TestCore._performanceIndicator(0), 1); // PF
    assert.equal(await this.TestCore._performanceIndicator(1), 1); // DL
    assert.equal(await this.TestCore._performanceIndicator(2), 1); // DQ
    assert.equal(await this.TestCore._performanceIndicator(3), 0); // DF
  });

  it('should test ContractRoleConvention', async () => {
    assert.equal(await this.TestCore._roleSign(0), 1); // RPA
    assert.equal(await this.TestCore._roleSign(1), -1); // RPL
  });

  it('should test DayCountConvention', async () => {
    // A/360 convention
    assert.equal(await this.TestCore._yearFraction('1138665600', '1141084800', '1', '0'), new BigNumber('0.077777777777777777').shiftedBy(18).toFixed()); // A360-1
    assert.equal(await this.TestCore._yearFraction('1138579200', '1141084800', '1', '0'), new BigNumber('0.080555555555555555').shiftedBy(18).toFixed()); // A360-2
    assert.equal(await this.TestCore._yearFraction('1141084800', '1141344000', '1', '0'), new BigNumber('0.008333333333333333').shiftedBy(18).toFixed()); // A360-3
    assert.equal(await this.TestCore._yearFraction('1139875200', '1141084800', '1', '0'), new BigNumber('0.038888888888888888').shiftedBy(18).toFixed()); // A360-4
    assert.equal(await this.TestCore._yearFraction('1159574400', '1162252800', '1', '0'), new BigNumber('0.086111111111111111').shiftedBy(18).toFixed()); // A360-5
    assert.equal(await this.TestCore._yearFraction('1162252800', '1164672000', '1', '0'), new BigNumber('0.077777777777777777').shiftedBy(18).toFixed()); // A360-6
    assert.equal(await this.TestCore._yearFraction('1188518400', '1204156800', '1', '0'), new BigNumber('0.502777777777777777').shiftedBy(18).toFixed()); // A360-7 
    assert.equal(await this.TestCore._yearFraction('1204156800', '1219881600', '1', '0'), new BigNumber('0.505555555555555555').shiftedBy(18).toFixed()); // A360-8 
    assert.equal(await this.TestCore._yearFraction('1204156800', '1220054400', '1', '0'), new BigNumber('0.511111111111111111').shiftedBy(18).toFixed()); // A360-9 
    assert.equal(await this.TestCore._yearFraction('1204156800', '1220140800', '1', '0'), new BigNumber('0.513888888888888888').shiftedBy(18).toFixed()); // A360-10
    assert.equal(await this.TestCore._yearFraction('1172448000', '1204156800', '1', '0'), new BigNumber('1.019444444444444444').shiftedBy(18).toFixed()); // A360-11
    assert.equal(await this.TestCore._yearFraction('1172448000', '1204243200', '1', '0'), new BigNumber('1.022222222222222222').shiftedBy(18).toFixed()); // A360-12
    assert.equal(await this.TestCore._yearFraction('1204243200', '1235779200', '1', '0'), new BigNumber('1.013888888888888888').shiftedBy(18).toFixed()); // A360-13
    assert.equal(await this.TestCore._yearFraction('1204156800', '1206835200', '1', '0'), new BigNumber('0.086111111111111111').shiftedBy(18).toFixed()); // A360-14
    assert.equal(await this.TestCore._yearFraction('1204156800', '1206921600', '1', '0'), new BigNumber('0.088888888888888888').shiftedBy(18).toFixed()); // A360-15

    // A/365 convention
    assert.equal(await this.TestCore._yearFraction('1138665600', '1141084800', '2', '0'), new BigNumber('0.076712328767123287').shiftedBy(18).toFixed()); // A365-1
    assert.equal(await this.TestCore._yearFraction('1138579200', '1141084800', '2', '0'), new BigNumber('0.079452054794520547').shiftedBy(18).toFixed()); // A365-2
    assert.equal(await this.TestCore._yearFraction('1141084800', '1141344000', '2', '0'), new BigNumber('0.008219178082191780').shiftedBy(18).toFixed()); // A365-3
    assert.equal(await this.TestCore._yearFraction('1139875200', '1141084800', '2', '0'), new BigNumber('0.038356164383561643').shiftedBy(18).toFixed()); // A365-4
    assert.equal(await this.TestCore._yearFraction('1159574400', '1162252800', '2', '0'), new BigNumber('0.084931506849315068').shiftedBy(18).toFixed()); // A365-5
    assert.equal(await this.TestCore._yearFraction('1162252800', '1164672000', '2', '0'), new BigNumber('0.076712328767123287').shiftedBy(18).toFixed()); // A365-6
    assert.equal(await this.TestCore._yearFraction('1188518400', '1204156800', '2', '0'), new BigNumber('0.495890410958904109').shiftedBy(18).toFixed()); // A365-7
    assert.equal(await this.TestCore._yearFraction('1204156800', '1219881600', '2', '0'), new BigNumber('0.498630136986301369').shiftedBy(18).toFixed()); // A365-8
    assert.equal(await this.TestCore._yearFraction('1204156800', '1220054400', '2', '0'), new BigNumber('0.504109589041095890').shiftedBy(18).toFixed()); // A365-9
    assert.equal(await this.TestCore._yearFraction('1204156800', '1220140800', '2', '0'), new BigNumber('0.506849315068493150').shiftedBy(18).toFixed()); // A365-10
    assert.equal(await this.TestCore._yearFraction('1172448000', '1204156800', '2', '0'), new BigNumber('1.005479452054794520').shiftedBy(18).toFixed()); // A365-11
    assert.equal(await this.TestCore._yearFraction('1172448000', '1204243200', '2', '0'), new BigNumber('1.008219178082191780').shiftedBy(18).toFixed()); // A365-12
    assert.equal(await this.TestCore._yearFraction('1204243200', '1235779200', '2', '0'), new BigNumber('1.000000000000000000').shiftedBy(18).toFixed()); // A365-13
    assert.equal(await this.TestCore._yearFraction('1204156800', '1206835200', '2', '0'), new BigNumber('0.084931506849315068').shiftedBy(18).toFixed()); // A365-14
    assert.equal(await this.TestCore._yearFraction('1204156800', '1206921600', '2', '0'), new BigNumber('0.087671232876712328').shiftedBy(18).toFixed()); // A365-15

    // 30E/360 ISDA convention
    assert.equal(await this.TestCore._yearFraction('1138665600', '1141084800', '3', '1204243200'), new BigNumber('0.083333333333333333').shiftedBy(18).toFixed()); // _30E360ISDA-1
    assert.equal(await this.TestCore._yearFraction('1138579200', '1141084800', '3', '1204243200'), new BigNumber('0.083333333333333333').shiftedBy(18).toFixed()); // _30E360ISDA-2
    assert.equal(await this.TestCore._yearFraction('1141084800', '1141344000', '3', '1204243200'), new BigNumber('0.008333333333333333').shiftedBy(18).toFixed()); // _30E360ISDA-3
    assert.equal(await this.TestCore._yearFraction('1139875200', '1141084800', '3', '1204243200'), new BigNumber('0.044444444444444444').shiftedBy(18).toFixed()); // _30E360ISDA-4
    assert.equal(await this.TestCore._yearFraction('1159574400', '1162252800', '3', '1204243200'), new BigNumber('0.083333333333333333').shiftedBy(18).toFixed()); // _30E360ISDA-5
    assert.equal(await this.TestCore._yearFraction('1162252800', '1164672000', '3', '1204243200'), new BigNumber('0.077777777777777777').shiftedBy(18).toFixed()); // _30E360ISDA-6
    assert.equal(await this.TestCore._yearFraction('1188518400', '1204156800', '3', '1204243200'), new BigNumber('0.494444444444444444').shiftedBy(18).toFixed()); // _30E360ISDA-7
    assert.equal(await this.TestCore._yearFraction('1204156800', '1219881600', '3', '1204243200'), new BigNumber('0.500000000000000000').shiftedBy(18).toFixed()); // _30E360ISDA-8
    assert.equal(await this.TestCore._yearFraction('1204156800', '1220054400', '3', '1204243200'), new BigNumber('0.505555555555555555').shiftedBy(18).toFixed()); // _30E360ISDA-9
    assert.equal(await this.TestCore._yearFraction('1204156800', '1220140800', '3', '1204243200'), new BigNumber('0.505555555555555555').shiftedBy(18).toFixed()); // _30E360ISDA-10
    assert.equal(await this.TestCore._yearFraction('1172620800', '1204156800', '3', '1204243200'), new BigNumber('0.994444444444444444').shiftedBy(18).toFixed()); // _30E360ISDA-11
    assert.equal(await this.TestCore._yearFraction('1172620800', '1204243200', '3', '1204243200'), new BigNumber('0.997222222222222222').shiftedBy(18).toFixed()); // _30E360ISDA-12
    assert.equal(await this.TestCore._yearFraction('1204243200', '1235779200', '3', '1204243200'), new BigNumber('1.000000000000000000').shiftedBy(18).toFixed()); // _30E360ISDA-13
    assert.equal(await this.TestCore._yearFraction('1204243200', '1206835200', '3', '1204243200'), new BigNumber('0.083333333333333333').shiftedBy(18).toFixed()); // _30E360ISDA-14
    assert.equal(await this.TestCore._yearFraction('1204243200', '1206921600', '3', '1204243200'), new BigNumber('0.083333333333333333').shiftedBy(18).toFixed()); // _30E360ISDA-15

    // 30E/360 convention
    assert.equal(await this.TestCore._yearFraction('1138665600', '1141084800', '4', '0'), new BigNumber('0.077777777777777777').shiftedBy(18).toFixed()); // "_30E360-1
    assert.equal(await this.TestCore._yearFraction('1138579200', '1141084800', '4', '0'), new BigNumber('0.077777777777777777').shiftedBy(18).toFixed()); // "_30E360-2
    assert.equal(await this.TestCore._yearFraction('1141084800', '1141344000', '4', '0'), new BigNumber('0.013888888888888888').shiftedBy(18).toFixed()); // "_30E360-3
    assert.equal(await this.TestCore._yearFraction('1139875200', '1141084800', '4', '0'), new BigNumber('0.038888888888888888').shiftedBy(18).toFixed()); // "_30E360-4
    assert.equal(await this.TestCore._yearFraction('1159574400', '1162252800', '4', '0'), new BigNumber('0.083333333333333333').shiftedBy(18).toFixed()); // "_30E360-5
    assert.equal(await this.TestCore._yearFraction('1162252800', '1164672000', '4', '0'), new BigNumber('0.077777777777777777').shiftedBy(18).toFixed()); // "_30E360-6
    assert.equal(await this.TestCore._yearFraction('1188518400', '1204156800', '4', '0'), new BigNumber('0.494444444444444444').shiftedBy(18).toFixed()); // "_30E360-7
    assert.equal(await this.TestCore._yearFraction('1204156800', '1219881600', '4', '0'), new BigNumber('0.500000000000000000').shiftedBy(18).toFixed()); // "_30E360-8
    assert.equal(await this.TestCore._yearFraction('1204156800', '1220054400', '4', '0'), new BigNumber('0.505555555555555555').shiftedBy(18).toFixed()); // "_30E360-9
    assert.equal(await this.TestCore._yearFraction('1204156800', '1220140800', '4', '0'), new BigNumber('0.505555555555555555').shiftedBy(18).toFixed()); // "_30E360-10
    assert.equal(await this.TestCore._yearFraction('1172448000', '1204156800', '4', '0'), new BigNumber('1.005555555555555555').shiftedBy(18).toFixed()); // "_30E360-11
    assert.equal(await this.TestCore._yearFraction('1172448000', '1204243200', '4', '0'), new BigNumber('1.008333333333333333').shiftedBy(18).toFixed()); // "_30E360-12
    assert.equal(await this.TestCore._yearFraction('1204243200', '1235779200', '4', '0'), new BigNumber('0.997222222222222222').shiftedBy(18).toFixed()); // "_30E360-13
    assert.equal(await this.TestCore._yearFraction('1204156800', '1206835200', '4', '0'), new BigNumber('0.088888888888888888').shiftedBy(18).toFixed()); // "_30E360-14
    assert.equal(await this.TestCore._yearFraction('1204156800', '1206921600', '4', '0'), new BigNumber('0.088888888888888888').shiftedBy(18).toFixed()); // "_30E360-15
  });

  it('should test isInSegment', async () => {
    assert.equal(await this.TestCore._isInSegment('100', '99', '101'), true); // Timestamp should be contained in the period
    assert.equal(await this.TestCore._isInSegment('100', '99', '100'), true); // Timestamp should be contained in the period
    assert.equal(await this.TestCore._isInSegment('100', '100', '100'), true); // Timestamp should be contained in the period
    assert.equal(await this.TestCore._isInSegment('101', '100', '100'), false); // Timestamp should not be contained in the period
    assert.equal(await this.TestCore._isInSegment('100', '100', '99'), false); // Timestamp should not be contained in the period
  });

  it('should test getTimestampPlusPeriod', async () => {
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '1', p: '0', isSet: 'true'}, '1514764800'), '1514851200'); // Timestamp + 1D+ should be 1514851200
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '5', p: '0', isSet: 'true'}, '1514764800'), '1515196800'); // Timestamp + 5D+ should be 1515196800
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '1', p: '1', isSet: 'true'}, '1514764800'), '1515369600'); // Timestamp + 1W+ should be 1515369600
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '5', p: '1', isSet: 'true'}, '1514764800'), '1517788800'); // Timestamp + 5W+ should be 1517788800
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '1', p: '3', isSet: 'true'}, '1514764800'), '1522540800'); // Timestamp + 1Q+ should be 1522540800
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '3', p: '3', isSet: 'true'}, '1514764800'), '1538352000'); // Timestamp + 3Q+ should be 1538352000
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '1', p: '4', isSet: 'true'}, '1514764800'), '1530403200'); // Timestamp + 1H+ should be 1530403200
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '5', p: '4', isSet: 'true'}, '1514764800'), '1593561600'); // Timestamp + 5H+ should be 1593561600
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '1', p: '5', isSet: 'true'}, '1514764800'), '1546300800'); // Timestamp + 1Y+ should be 1546300800
    assert.equal(await this.TestCore._getTimestampPlusPeriod({ i: '5', p: '5', isSet: 'true'}, '1514764800'), '1672531200'); // Timestamp + 5Y+ should be 1672531200
  });

  it('should test getNextCycleDate', async () => {
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '0', s: '0', isSet: true}, '1514764800', '0'), '1514764800'); // Timestamp + 1D+ with CycleIndex 0 should be 1514764800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '1', s: '0', isSet: true}, '1514764800', '0'), '1514764800'); // Timestamp + 1W+ with CycleIndex 0 should be 1514764800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '3', s: '0', isSet: true}, '1514764800', '0'), '1514764800'); // Timestamp + 1Q+ with CycleIndex 0 should be 1514764800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '4', s: '0', isSet: true}, '1514764800', '0'), '1514764800'); // Timestamp + 1H+ with CycleIndex 0 should be 1514764800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '5', s: '0', isSet: true}, '1514764800', '0'), '1514764800'); // Timestamp + 1Y+ with CycleIndex 0 should be 1514764800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '0', s: '0', isSet: true}, '1514764800', '1'), '1514851200'); // Timestamp + 1D+ with CycleIndex 1 should be 1514851200
    assert.equal(await this.TestCore._getNextCycleDate({ i: '5', p: '0', s: '0', isSet: true}, '1514764800', '1'), '1515196800'); // Timestamp + 5D+ with CycleIndex 1 should be 1515196800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '1', s: '0', isSet: true}, '1514764800', '1'), '1515369600'); // Timestamp + 1W+ with CycleIndex 1 should be 1515369600
    assert.equal(await this.TestCore._getNextCycleDate({ i: '5', p: '1', s: '0', isSet: true}, '1514764800', '1'), '1517788800'); // Timestamp + 5W+ with CycleIndex 1 should be 1517788800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '3', s: '0', isSet: true}, '1514764800', '1'), '1522540800'); // Timestamp + 1Q+ with CycleIndex 1 should be 1522540800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '3', p: '3', s: '0', isSet: true}, '1514764800', '1'), '1538352000'); // Timestamp + 3Q+ with CycleIndex 1 should be 1538352000
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '4', s: '0', isSet: true}, '1514764800', '1'), '1530403200'); // Timestamp + 1H+ with CycleIndex 1 should be 1530403200
    assert.equal(await this.TestCore._getNextCycleDate({ i: '5', p: '4', s: '0', isSet: true}, '1514764800', '1'), '1593561600'); // Timestamp + 5H+ with CycleIndex 1 should be 1593561600
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '5', s: '0', isSet: true}, '1514764800', '1'), '1546300800'); // Timestamp + 1Y+ with CycleIndex 1 should be 1546300800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '5', p: '5', s: '0', isSet: true}, '1514764800', '1'), '1672531200'); // Timestamp + 5Y+ with CycleIndex 1 should be 1672531200
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '0', s: '0', isSet: true}, '1514764800', '3'), '1515024000'); // Timestamp + 1D+ with CycleIndex 3 should be 1515024000
    assert.equal(await this.TestCore._getNextCycleDate({ i: '5', p: '0', s: '0', isSet: true}, '1514764800', '3'), '1516060800'); // Timestamp + 5D+ with CycleIndex 3 should be 1516060800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '1', s: '0', isSet: true}, '1514764800', '3'), '1516579200'); // Timestamp + 1W+ with CycleIndex 3 should be 1516579200
    assert.equal(await this.TestCore._getNextCycleDate({ i: '5', p: '1', s: '0', isSet: true}, '1514764800', '3'), '1523836800'); // Timestamp + 5W+ with CycleIndex 3 should be 1523836800
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '3', s: '0', isSet: true}, '1514764800', '3'), '1538352000'); // Timestamp + 1Q+ with CycleIndex 3 should be 1538352000
    assert.equal(await this.TestCore._getNextCycleDate({ i: '3', p: '3', s: '0', isSet: true}, '1514764800', '3'), '1585699200'); // Timestamp + 3Q+ with CycleIndex 3 should be 1585699200
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '4', s: '0', isSet: true}, '1514764800', '3'), '1561939200'); // Timestamp + 1H+ with CycleIndex 3 should be 1561939200
    assert.equal(await this.TestCore._getNextCycleDate({ i: '5', p: '4', s: '0', isSet: true}, '1514764800', '3'), '1751328000'); // Timestamp + 5H+ with CycleIndex 3 should be 1751328000
    assert.equal(await this.TestCore._getNextCycleDate({ i: '1', p: '5', s: '0', isSet: true}, '1514764800', '3'), '1609459200'); // Timestamp + 1Y+ with CycleIndex 3 should be 1609459200
    assert.equal(await this.TestCore._getNextCycleDate({ i: '5', p: '5', s: '0', isSet: true}, '1514764800', '3'), '1988150400'); // Timestamp + 5Y+ with CycleIndex 3 should be 1988150400
  });
});
