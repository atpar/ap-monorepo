/* eslint-disable @typescript-eslint/no-var-requires */
const buidlerRuntime = require('@nomiclabs/buidler');
const { toWei } = require('web3-utils');

const { getDefaultTestTerms, getDefaultState, assertEqualStates } = require('../../../helper/ACTUS/tests');
const { getSnapshotTaker, deployTestPAMSTF } = require('../../../helper/setupTestEnvironment');


describe('TestPAMPOF', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestSTF = await deployTestPAMSTF(buidlerRuntime);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.PAMTerms = await getDefaultTestTerms('PAM');
  });

  /*
  * TEST STF_PAM_AD
  */
  it('PAM Analysis Event STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_PAM_AD(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_FP
  */
  it('PAM Fee Payment STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.nominalInterestRate = toWei('0.05');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('0');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_PAM_FP(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_IED
  */
  it('PAM Initial Exchange STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.nominalInterestRate = toWei('0.05');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL
    this.PAMTerms.notionalPrincipal = toWei('1000000'); // NULL
    this.PAMTerms.accruedInterest = toWei('0')

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.notionalPrincipal = toWei('1000000')
    expectedState.nominalInterestRate = toWei('0.05')
    expectedState.statusDate = 6307200;
    expectedState.accruedInterest = toWei('0')

    const newState = await this.TestSTF.methods._STF_PAM_IED(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_IPCI
  */
  it('PAM Interest Capitalization STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.nominalInterestRate = toWei('0.05');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL
    this.PAMTerms.notionalPrincipal = toWei('1000000')

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.notionalPrincipal = toWei('1010100');
    expectedState.accruedInterest = toWei('0');
    expectedState.feeAccrued = toWei('2030.2');
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF.methods._STF_PAM_IPCI(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_IP
  */
  it('PAM Interest Payment STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.nominalInterestRate = toWei('0.05');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('0');
    expectedState.feeAccrued = toWei('2010');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF.methods._STF_PAM_IP(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_PP
  */
  it('PAM Principal Payment STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.nominalInterestRate = toWei('0.05');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.notionalPrincipal = toWei('1000000');
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF.methods._STF_PAM_PP(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_PR
  */
  it('PAM Princiapl Redemption STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.nominalInterestRate = toWei('0.05');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.notionalPrincipal = toWei('0')
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF.methods._STF_PAM_PR(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_PY
  */
  it('PAM Princiapl Redemption STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.nominalInterestRate = toWei('0.05');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF.methods._STF_PAM_PY(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_RRF
  */
  it('PAM Fixed Rate Reset STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeRate = toWei('0.01');
    this.PAMTerms.nominalInterestRate = toWei('0.05');
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.businessDayConvention = 0; // NULL
    this.PAMTerms.nextResetRate = toWei('0.06')

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.nominalInterestRate = toWei('0.06')
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF.methods._STF_PAM_RRF(
      this.PAMTerms,
      oldState,
      scheduleTime,
      externalData
    ).call();

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_RR
  */

  //  it('PAM Fixed Rate Reset STF', async () => {
  // const oldState = getDefaultState();
  // const externalData = web3.utils.hexToBytes('0x00000000000000000000000000000000000000000000000000d529ae9e860000'); //0.6
  // const scheduleTime = 6307200; // .2 years

  // this.PAMTerms.feeRate = toWei('0.01');
  // this.PAMTerms.nominalInterestRate = toWei('0.05');
  // this.PAMTerms.dayCountConvention = 2; // A_365
  // this.PAMTerms.businessDayConvention = 0; // NULL
  // this.PAMTerms.rateSpread = toWei('0.001');
  // this.PAMTerms.rateMultiplier = toWei('1.001');
  // this.PAMTerms.lifeCap = toWei('0.1');
  // this.PAMTerms.lifeFloor = toWei('0.01');
  // this.PAMTerms.periodCap = toWei('0.02')
  // this.PAMTerms.periodFloor = toWei('-0.02');

  // // Construct expected state from default state
  // const expectedState = getDefaultState();
  // expectedState.accruedInterest = toWei('10100');
  // expectedState.statusDate = 6307200;

  // // rate: 0.05 * 1.001 + 0.001 = 0.06005
  // // deltaRate: rate - 0.05 = 0.01005


  // console.log(oldState)
  // const newState = await this.TestSTF.methods._STF_PAM_RR(
  //   this.PAMTerms,
  //   oldState,
  //   scheduleTime,
  //   externalData
  //   ).call();
  // console.log(newState)
  // assertEqualStates(newState, expectedState);

  // });
});
