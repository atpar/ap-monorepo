/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getSnapshotTaker, deployTestCore } = require('../../helper/setupTestEnvironment');


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
describe('Core', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestCore = await deployTestCore(buidlerRuntime);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  function removeNullDates (dates) {
    const compactDates = [];

    for (date of dates) {
      if (date.toString() === '0') { continue; }
      compactDates.push(date.toString());
    }

    return compactDates;
  }

  it('should test computeDatesFromCycleSegment for isSet == false', async () => {
    const c = { i: '1', p: '2', s: '0', isSet: false }; // Every 1 month, isSet = false
    const addEndTime = false;
    const cStart = '1514764800'; // Monday, 2018-01-01 00:00:00 UTC
    const cEnd = '1538352000'; // Monday, 2018-10-01 00:00:00 UTC
    const sStart = '1525132800'; // Tuesday, 2018-05-01 00:00:00 UTC
    const sEnd = '1535760000'; // Saturday, 2018-09-01 00:00:00 UTC
    const eomc = 0;

    // Segment lies before cycle
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, '0', '0').call()), []);
    // Segment lies after cycle
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, '9999999999', '9999999999').call()), []);
    // Segment lies within cycle
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, sStart, sEnd).call()), []);
    // Cycle lies within Segment, addEndTime == false
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, '0', '9999999999').call()), [cStart]);
    // Cycle lies within Segment, addEndTime == true
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, true, '0', '9999999999').call()), [cStart, cEnd]);
    // Only cycle start lies within segment, addEndTime == true
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, true, '0', sEnd).call()), [cStart]);
    // Only cycle end lies within segment, addEndTime == false
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, sStart, '9999999999').call()), []);
  });

  it('should test computeDatesFromCycleSegment for isSet == true', async () => {
    const c = { i: '1', p: '2', s: '0', isSet: true }; // Every 1 month, isSet = false
    const addEndTime = false;
    const cStart = '1514764800'; // Monday, 2018-01-01 00:00:00 UTC
    const cEnd = '1538352000'; // Monday, 2018-10-01 00:00:00 UTC
    const sStart = '1525132800'; // Tuesday, 2018-05-01 00:00:00 UTC
    const sEnd = '1535760000'; // Saturday, 2018-09-01 00:00:00 UTC
    const eomc = 0;

    // Segment lies in cycle
    const result_1 = [
      sStart,
      '1527811200', // Friday, 2018-06-01 00:00:00 UTC
      '1530403200', // Sunday, 2018-07-01 00:00:00 UTC
      '1533081600', // Wednesday, 2018-08-01 00:00:00 UTC
      sEnd
    ];
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, sStart, sEnd).call()), result_1);

    // Segment lies in cycle, addEndTime = false
    const result_2 = [
      cStart,
      '1517443200', // Thursday, 2018-02-01 00:00:00 UTC
      '1519862400', // Thursday, 2018-03-01 00:00:00 UTC
      '1522540800', // Sunday, 2018-04-01 00:00:00 UTC
      '1525132800', // Tuesday, 2018-05-01 00:00:00 UTC
      '1527811200', // Friday, 2018-06-01 00:00:00 UTC
      '1530403200', // Sunday, 2018-07-01 00:00:00 UTC
      '1533081600', // Wednesday, 2018-08-01 00:00:00 UTC
      sEnd
    ];
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, '0', '9999999999').call()), result_2);

    // Segment lies in cycle, addEndTime = true
    const result_3 = [
      cStart,
      '1517443200', // Thursday, 2018-02-01 00:00:00 UTC
      '1519862400', // Thursday, 2018-03-01 00:00:00 UTC
      '1522540800', // Sunday, 2018-04-01 00:00:00 UTC
      '1525132800', // Tuesday, 2018-05-01 00:00:00 UTC
      '1527811200', // Friday, 2018-06-01 00:00:00 UTC
      '1530403200', // Sunday, 2018-07-01 00:00:00 UTC
      '1533081600', // Wednesday, 2018-08-01 00:00:00 UTC
      '1535760000', // Saturday, 2018-09-01 00:00:00 UTC
      cEnd
    ];
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, true, '0', '9999999999').call()), result_3);
  });

  /*
  * The two following test ar for the case when the SD end of month convention
  * is selected but the start date is on the 30th of a month. For all months with
  * >= 30 days the date will be on the 30th. For Febuary it will be on
  * the 28th except for leap years, where it will be on the 29th
  */
  it('should test computeDatesFromCycleSegment for isSet == true, stub == short, EOM == SD with cStart 30th of month', async () => {
    const c = { i: '1', p: '2', s: '1', isSet: true }; // Every 1 month, isSet = false
    const addEndTime = true;
    const cStart = '1461974400'; // 2016-04-30T00:00:00
    const cEnd = '1488326400'; // 2017-03-01T00:00:00
    const sStart = '0'; // Tuesday, 2018-05-01 00:00:00 UTC
    const sEnd = '9999999999'; // Saturday, 2018-09-01 00:00:00 UTC
    const eomc = 0;

    // Segment lies in cycle
    const result_1 = [
      cStart,
      '1464566400', // 2016-05-30T00:00:00
      '1467244800', // 2016-06-30T00:00:00
      '1469836800', // 2016-07-30T00:00:00
      '1472515200', // 2016-08-30T00:00:00
      '1475193600', // 2016-09-30T00:00:00
      '1477785600', // 2016-10-30T00:00:00
      '1480464000', // 2016-11-30T00:00:00
      '1483056000', // 2016-12-30T00:00:00
      '1485734400', // 2017-01-30T00:00:00
      '1488240000', // 2017-02-28T00:00:00
      cEnd
    ];
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, sStart, sEnd).call()), result_1);
  });

  it('should test computeDatesFromCycleSegment for isSet == true, stub == short, EOM == SD with cStart 30th of month in a leap year', async () => {
    const c = { i: '1', p: '2', s: '1', isSet: true }; // Every 1 month, isSet = false
    const addEndTime = true;
    const cStart = '1430352000'; // 2015-04-30T00:00:002016-04-30T00:00:00
    const cEnd = '1456790400'; // 2016-03-01T00:00:00 - 2016 is a leap year
    const sStart = '0'; // Tuesday, 2018-05-01 00:00:00 UTC
    const sEnd = '9999999999'; // Saturday, 2018-09-01 00:00:00 UTC
    const eomc = 0;

    // Segment lies in cycle
    const result_1 = [
      cStart,
      '1432944000', // 2015-05-30T00:00:00
      '1435622400', // 2015-06-30T00:00:00
      '1438214400', // 2015-07-30T00:00:00
      '1440892800', // 2015-08-30T00:00:00
      '1443571200', // 2015-09-30T00:00:00
      '1446163200', // 2015-10-30T00:00:00
      '1448841600', // 2015-11-30T00:00:00
      '1451433600', // 2015-12-30T00:00:00
      '1454112000', // 2016-01-30T00:00:00
      '1456704000', // 2016-02-29T00:00:00
      cEnd
    ];
    assert.deepEqual(removeNullDates(await this.TestCore.methods._computeDatesFromCycleSegment(cStart, cEnd, c, eomc, addEndTime, sStart, sEnd).call()), result_1);
  });
});
