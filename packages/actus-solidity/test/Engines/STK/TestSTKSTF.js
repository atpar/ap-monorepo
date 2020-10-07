const { toWei } = require('web3-utils');

const TestSTF = artifacts.require('TestSTKSTF.sol');
const STKEngine = artifacts.require('STKEngine.sol');
const { getDefaultTestTerms, getDefaultState, assertEqualStates } = require('../../helper/tests');


contract('TestSTKSTF', () => {
  before(async () => {
    this.STKEngineInstance = await STKEngine.new();
    this.STKTerms = await getDefaultTestTerms('STK');

    this.TestSTF = await TestSTF.new();
  });


  /*
  * TEST STF_STK_AD
  */
  xit('STK Analysis Event STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF._STF_STK_AD(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_FP
  */
  xit('STK Fee Payment STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.nominalInterestRate = toWei('0.05');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('0');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF._STF_STK_FP(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_IED
  */
  xit('STK Initial Exchange STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.nominalInterestRate = toWei('0.05');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL
    this.STKTerms.notionalPrincipal = toWei('1000000'); // NULL
    this.STKTerms.accruedInterest = toWei('0')

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.notionalPrincipal = toWei('1000000')
    expectedState.nominalInterestRate = toWei('0.05')
    expectedState.statusDate = 6307200;
    expectedState.accruedInterest = toWei('0')

    const newState = await this.TestSTF._STF_STK_IED(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_IPCI
  */
  xit('STK Interest Capitalization STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.nominalInterestRate = toWei('0.05');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL
    this.STKTerms.notionalPrincipal = toWei('1000000')

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.notionalPrincipal = toWei('1010100');
    expectedState.accruedInterest = toWei('0');
    expectedState.feeAccrued = toWei('2030.2');
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF._STF_STK_IPCI(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_IP
  */
  xit('STK Interest Payment STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.nominalInterestRate = toWei('0.05');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('0');
    expectedState.feeAccrued = toWei('2010');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF._STF_STK_IP(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_PP
  */
  xit('STK Principal Payment STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.nominalInterestRate = toWei('0.05');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.notionalPrincipal = toWei('1000000');
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF._STF_STK_PP(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_PR
  */
  xit('STK Princiapl Redemption STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.nominalInterestRate = toWei('0.05');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.notionalPrincipal = toWei('0')
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF._STF_STK_PR(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_PY
  */
  xit('STK Princiapl Redemption STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.nominalInterestRate = toWei('0.05');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF._STF_STK_PY(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_STK_RRF
  */
  xit('STK Fixed Rate Reset STF', async () => {
    const oldState = getDefaultState();
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.STKTerms.feeRate = toWei('0.01');
    this.STKTerms.nominalInterestRate = toWei('0.05');
    this.STKTerms.dayCountConvention = 2; // A_365
    this.STKTerms.businessDayConvention = 0; // NULL
    this.STKTerms.nextResetRate = toWei('0.06')

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.nominalInterestRate = toWei('0.06')
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF._STF_STK_RRF(
      this.STKTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

});
