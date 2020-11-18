/* eslint-disable @typescript-eslint/no-var-requires */
const buidlerRuntime = require('hardhat');
const { toWei } = require('web3-utils');

const { getDefaultTestTerms, getDefaultState, assertEqualStates } = require('../../../helper/ACTUS/tests');
const { getSnapshotTaker, deployTestSTKSTF } = require('../../../helper/setupTestEnvironment');


describe('TestSTKPOF', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestSTF = await deployTestSTKSTF(buidlerRuntime);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.STKTerms = await getDefaultTestTerms('STK');
  });

  const zeroBytes32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

  /*
  * TEST STF_STK_AD
  */
  it('STK Monitoring event STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000C0FE0000C0FE000DAD00A'; // nonsense
    const scheduleTime = 6307200;

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_STK_AD(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_ISS
  */
  it('STK Issue STF', async () => {
    const oldState = getDefaultState();
    const externalData = zeroBytes32;
    const scheduleTime = 6307200;

    this.STKTerms.notionalPrincipal = toWei(`${500e6}`);
    this.STKTerms.quantity = toWei(`${1e6}`);

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.notionalPrincipal = toWei(`${500e6}`);
    expectedState.quantity = toWei(`${1e6}`);
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_STK_ISS(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_DIF
  */
  it('STK Dividend Fixing STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000422ca8b0a00a425000000'; // 5e6 * 10e18
    const scheduleTime = 6307200;

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.lastDividendFixingDate = 6307200;
    expectedState.dividendPaymentAmount = toWei(`${5e6}`);
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_STK_DIF(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_DIP
  */
  it('STK Dividend Payment STF', async () => {
    const oldState = getDefaultState();
    const externalData = zeroBytes32;
    const scheduleTime = 6307200;

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.dividendPaymentAmount = 0;
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_STK_DIP(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_SPF
  */
  it('STK Split Fixing STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x00000000000000000000000000000000000000000000000006f05b59d3b20000'; // 0.5 * 10e18
    const scheduleTime = 6307200;

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.splitRatio = toWei('0.5');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_STK_SPF(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_SPS
  */
  it('STK Split Settlement STF', async () => {
    const oldState = getDefaultState();
    const externalData = zeroBytes32;
    const scheduleTime = 6307200;
    oldState.quantity = toWei(`${2e6}`);
    oldState.splitRatio = toWei('0.5');

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.quantity = toWei(`${1e6}`);
    expectedState.splitRatio = 0;

    const newState = await this.TestSTF.methods._STF_STK_SPS(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_REF
  */
  it('STK Redemption Fixing STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x00000000000000000000000000000000000000000052b7d2dcc80cd2e4000000'; // 100*10e6 * 10e18
    const scheduleTime = 6307200;

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.exerciseQuantity = toWei(`${100e6}`);
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_STK_REF(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_REP
  */
  it('STK Redemption Payment STF', async () => {
    const oldState = getDefaultState();
    const externalData = zeroBytes32;
    const scheduleTime = 6307200;
    oldState.quantity = toWei(`${30e6}`);
    oldState.exerciseQuantity = toWei(`${10e6}`);

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.quantity = toWei(`${20e6}`);
    expectedState.exerciseQuantity = 0;
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF.methods._STF_STK_REP(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });
});
