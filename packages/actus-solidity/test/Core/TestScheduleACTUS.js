const TestCore = artifacts.require('TestCore.sol');


/*
 * Test modelled after the official ACTUS tests
*/
contract('Core', () => {
  before(async () => {       
    this.TestCore = await TestCore.new();
  });

  function removeNullDates (dates) {
    const compactDates = [];

    for (date of dates) {
    if (date.toString() === '0') { continue; }
      compactDates.push(date.toString());
    }
  
    return compactDates;
  }

  it('should test computeDatesFromCycleSegment Daily_SD_shortstub', async () => {
    const c = { i: '1', p: '0', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1452816000'; // 2016-01-15T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [];
    for (i = 0; i < 15; i++) {
      result_1.push(String(Number(cStart) + i * 86400));
    }

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Daily_EOM_shortstub', async () => {
    const c = { i: '1', p: '0', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1452816000'; // 2016-01-15T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [];
    for (i = 0; i < 15; i++) {
      result_1.push(String(Number(cStart) + i * 86400));
    }

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Daily_SD_longstub', async () => {
    const c = { i: '1', p: '0', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1452816000'; // 2016-01-15T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [];
    for (i = 0; i < 15; i++) {
      result_1.push(String(Number(cStart) + i * 86400));
    }

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Daily_SD_shortstub_endT24', async () => {
    const c = { i: '1', p: '0', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1452815999'; // 2016-01-14T23:59:59
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [];
    for (i = 0; i < 14; i++) {
      result_1.push(String(Number(cStart) + i * 86400));
    }

    result_1[14] = cEnd; // 2016-01-14T23:59:59

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Daily_SD_longstub_endT24', async () => {
    const c = { i: '1', p: '0', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1452815999'; // 2016-01-14T23:59:59
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [];
    for (i = 0; i < 13; i++) {
      result_1.push(String(Number(cStart) + i * 86400));
    }

    result_1[13] = cEnd; // 2016-01-14T23:59:59

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment BiDaily_SD_shortstub', async () => {
    const c = { i: '2', p: '0', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1453852800'; // 2016-01-27T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [];
    for (i = 0; i < 28; i = i + 2) {
      result_1.push(String(Number(cStart) + i * 86400));
    }

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  // it('should test computeDatesFromCycleSegment 31Daily_EOM_shortstub_startEndMonth', async () => {
  //   const c = { i: '2', p: '0', s: '1', isSet: true };
  //   const addEndTime = true;
  //   const cStart = '1456704000'; // 2016-02-29T00:00:00
  //   const cEnd = '1483228800'; // 2017-01-01T00:00:00
  //   const sStart = '0';
  //   const sEnd = '9999999999';

  //   const result_1 = [];

  //   assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  // });

  it('should test computeDatesFromCycleSegment Weekly_SD_shortstub', async () => {
    const c = { i: '1', p: '1', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1459468800'; // 2016-04-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '7', p: '0', s: '1', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Weekly_SD_longstub', async () => {
    const c = { i: '1', p: '1', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1459468800'; // 2016-04-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '7', p: '0', s: '1', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  // it('should test computeDatesFromCycleSegment Weekly_EOM_shortstub_startMidMonth', async () => {
  //   const c = { i: '1', p: '1', s: '1', isSet: true };
  //   const addEndTime = true;
  //   const cStart = '1451606400'; // 2016-01-01T00:00:00
  //   const cEnd = '1459468800'; // 2016-04-01T00:00:00
  //   const sStart = '0';
  //   const sEnd = '9999999999';

  //   const result_1 = removeNullDates(
  //     await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '7', p: '0', s: '1', isSet: true}, addEndTime, sStart, sEnd)
  //   );

  //   assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  // });

  it('should test computeDatesFromCycleSegment Weekly_EOM_shortstub_startEndMonth', async () => {
    const c = { i: '1', p: '1', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1459468800'; // 2016-04-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '7', p: '0', s: '1', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment 4Weekly_SD_longstub_startEndMonth', async () => {
    const c = { i: '4', p: '1', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '28', p: '0', s: '0', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment 4Weekly_EOM_longstub_startEndMonth', async () => {
    const c = { i: '4', p: '1', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '28', p: '0', s: '0', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment 4Weekly_EOM_shortstub_startEndMonth', async () => {
    const c = { i: '4', p: '1', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '28', p: '0', s: '1', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Monthly_SD_shortstub', async () => {
    const c = { i: '1', p: '2', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      '1454284800', // 2016-02-01T00:00:00
      '1456790400', // 2016-03-01T00:00:00
      '1459468800', // 2016-04-01T00:00:00
      '1462060800', // 2016-05-01T00:00:00
      '1464739200', // 2016-06-01T00:00:00
      '1467331200', // 2016-07-01T00:00:00
      '1470009600', // 2016-08-01T00:00:00
      '1472688000', // 2016-09-01T00:00:00
      '1475280000', // 2016-10-01T00:00:00
      '1477958400', // 2016-11-01T00:00:00
      '1480550400', // 2016-12-01T00:00:00
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Monthly_SD_longstub_startBeginningMonth', async () => {
    const c = { i: '1', p: '2', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      '1454284800', // 2016-02-01T00:00:00
      '1456790400', // 2016-03-01T00:00:00
      '1459468800', // 2016-04-01T00:00:00
      '1462060800', // 2016-05-01T00:00:00
      '1464739200', // 2016-06-01T00:00:00
      '1467331200', // 2016-07-01T00:00:00
      '1470009600', // 2016-08-01T00:00:00
      '1472688000', // 2016-09-01T00:00:00
      '1475280000', // 2016-10-01T00:00:00
      '1477958400', // 2016-11-01T00:00:00
      '1480550400', // 2016-12-01T00:00:00
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Monthly_SD_shortstub_startMidMonth', async () => {
    const c = { i: '1', p: '2', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1452816000'; // 2016-01-15T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      '1455494400', // 2016-02-15T00:00:00
      '1458000000', // 2016-03-15T00:00:00
      '1460678400', // 2016-04-15T00:00:00
      '1463270400', // 2016-05-15T00:00:00
      '1465948800', // 2016-06-15T00:00:00
      '1468540800', // 2016-07-15T00:00:00
      '1471219200', // 2016-08-15T00:00:00
      '1473897600', // 2016-09-15T00:00:00
      '1476489600', // 2016-10-15T00:00:00
      '1479168000', // 2016-11-15T00:00:00
      '1481760000', // 2016-12-15T00:00:00
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Monthly_SD_longstub_startMidMonth', async () => {
    const c = { i: '1', p: '2', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1452816000'; // 2016-01-15T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      '1455494400', // 2016-02-15T00:00:00
      '1458000000', // 2016-03-15T00:00:00
      '1460678400', // 2016-04-15T00:00:00
      '1463270400', // 2016-05-15T00:00:00
      '1465948800', // 2016-06-15T00:00:00
      '1468540800', // 2016-07-15T00:00:00
      '1471219200', // 2016-08-15T00:00:00
      '1473897600', // 2016-09-15T00:00:00
      '1476489600', // 2016-10-15T00:00:00
      '1479168000', // 2016-11-15T00:00:00
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment BiMonthly_SD_longstub_startBeginningMonth', async () => {
    const c = { i: '2', p: '2', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1451606400'; // 2016-01-01T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      '1456790400', // 2016-03-01T00:00:00
      '1462060800', // 2016-05-01T00:00:00
      '1467331200', // 2016-07-01T00:00:00
      '1472688000', // 2016-09-01T00:00:00
      '1477958400', // 2016-11-01T00:00:00
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment BiMonthly_SD_longstub_startMidMonth', async () => {
    const c = { i: '2', p: '2', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1452816000'; // 2016-01-15T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      '1458000000', // 2016-03-15T00:00:00
      '1463270400', // 2016-05-15T00:00:00
      '1468540800', // 2016-07-15T00:00:00
      '1473897600', // 2016-09-15T00:00:00
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Monthly_EOM_shortstub_startMidMonth', async () => {
    const c = { i: '1', p: '2', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1452816000'; // 2016-01-15T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      '1455494400', // 2016-02-15T00:00:00
      '1458000000', // 2016-03-15T00:00:00
      '1460678400', // 2016-04-15T00:00:00
      '1463270400', // 2016-05-15T00:00:00
      '1465948800', // 2016-06-15T00:00:00
      '1468540800', // 2016-07-15T00:00:00
      '1471219200', // 2016-08-15T00:00:00
      '1473897600', // 2016-09-15T00:00:00
      '1476489600', // 2016-10-15T00:00:00
      '1479168000', // 2016-11-15T00:00:00
      '1481760000', // 2016-12-15T00:00:00
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

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

  it('should test computeDatesFromCycleSegment BiMonthly_SD_shortstub_onlyStartAndEndTimes', async () => {
    const c = { i: '2', p: '2', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1477958400'; // 2016-11-01T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment BiMonthly_EOM_shortstub_onlyStartAndEndTimes', async () => {
    const c = { i: '2', p: '2', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1480464000'; // 2016-11-30T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment BiMonthly_EOM_longstub_onlyStartAndEndTimes', async () => {
    const c = { i: '2', p: '2', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1480464000'; // 2016-11-30T00:00:00
    const cEnd = '1483228800'; // 2017-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = [
      cStart,
      cEnd
    ];

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Quarterly_SD_shortstub', async () => {
    const c = { i: '1', p: '3', s: '1', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1546300800'; // 2019-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '3', p: '2', s: '1', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Quarterly_SD_longstub', async () => {
    const c = { i: '1', p: '3', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1546300800'; // 2019-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '3', p: '2', s: '0', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Quarterly_EOM_longstub', async () => {
    const c = { i: '1', p: '3', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1546300800'; // 2019-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '3', p: '2', s: '0', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment BiQuarterly_EOM_longstub', async () => {
    const c = { i: '2', p: '3', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1640995200'; // 2022-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '6', p: '2', s: '0', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Halfyear_EOM_longstub', async () => {
    const c = { i: '1', p: '4', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1640995200'; // 2022-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '2', p: '3', s: '0', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment Yearly_EOM_longstub', async () => {
    const c = { i: '1', p: '5', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1640995200'; // 2022-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '2', p: '4', s: '0', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });

  it('should test computeDatesFromCycleSegment BiYearly_EOM_longstub', async () => {
    const c = { i: '2', p: '5', s: '0', isSet: true };
    const addEndTime = true;
    const cStart = '1456704000'; // 2016-02-29T00:00:00
    const cEnd = '1767225600'; // 2026-01-01T00:00:00
    const sStart = '0';
    const sEnd = '9999999999';

    const result_1 = removeNullDates(
      await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, { i: '4', p: '4', s: '0', isSet: true}, addEndTime, sStart, sEnd)
    );

    assert.deepEqual(removeNullDates(await this.TestCore._computeDatesFromCycleSegment(cStart, cEnd, c, addEndTime, sStart, sEnd)), result_1);
  });
});
