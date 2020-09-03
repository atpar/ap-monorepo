const { toWei } = require('web3-utils');

const TestSTF = artifacts.require('TestANNSTF.sol');
const ANNEngine = artifacts.require('ANNEngine.sol');
const { getDefaultTestTerms, assertEqualStates } = require('../../helper/tests');


contract('TestANNSTF', () => {
  before(async () => {
    this.ANNEngineInstance = await ANNEngine.new();
    this.TestSTF = await TestSTF.new();
    
    this.ANNTerms = await getDefaultTestTerms('ANN');
    
    this.DefaultState = {
      contractPerformance: 0, // PF
      statusDate: 0,
      nonPerformingDate: 0,
      maturityDate: 31536000, // (1 year from 0)
      terminationDate: 31536000, 
      notionalPrincipal: web3.utils.toWei('1000000'),
      accruedInterest: web3.utils.toWei('100'),
      feeAccrued: web3.utils.toWei('10'),
      nominalInterestRate: web3.utils.toWei('0.05'),
      interestScalingMultiplier: web3.utils.toWei('1.1'),
      notionalScalingMultiplier: web3.utils.toWei('0.9'),
      nextPrincipalRedemptionPayment: web3.utils.toWei('2500'),
    };
  });

  /*
  * TEST STF_ANN_AD
  */
  it('ANN Analysis Event STF', async () => {
    const oldState = this.DefaultState;
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.ANNTerms.feeRate = toWei('0.01');
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = this.DefaultState;
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF._STF_ANN_AD(
      this.ANNTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_ANN_FP
  */
  it('ANN Fee Payment STF', async () => {
    const oldState = this.DefaultState;
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.ANNTerms.feeRate = toWei('0.01');
    this.ANNTerms.nominalInterestRate = toWei('0.05');
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = this.DefaultState;
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('0');
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF._STF_ANN_FP(
      this.ANNTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_ANN_PP
  */
  it('ANN Principal Payment STF', async () => {
    const oldState = this.DefaultState;
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.ANNTerms.feeRate = toWei('0.01');
    this.ANNTerms.nominalInterestRate = toWei('0.05');
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = this.DefaultState;
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.notionalPrincipal = toWei('1000000');
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF._STF_ANN_PP(
      this.ANNTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });


  /*
  * TEST STF_ANN_PY
  */
  it('ANN Princiapl Redemption STF', async () => {
    const oldState = this.DefaultState;
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.ANNTerms.feeRate = toWei('0.01');
    this.ANNTerms.nominalInterestRate = toWei('0.05');
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = this.DefaultState;
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF._STF_ANN_PY(
      this.ANNTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_ANN_RRF
  */
  it('ANN Fixed Rate Reset STF', async () => {
    const oldState = this.DefaultState;
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.ANNTerms.feeRate = toWei('0.01');
    this.ANNTerms.nominalInterestRate = toWei('0.05');
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.nextResetRate = toWei('0.06')

    // Construct expected state from default state
    const expectedState = this.DefaultState;
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei('2010');
    expectedState.nominalInterestRate = toWei('0.06')
    expectedState.statusDate = 6307200;


    const newState = await this.TestSTF._STF_ANN_RRF(
      this.ANNTerms,
      oldState,
      scheduleTime,
      externalData
    );

    assertEqualStates(newState, expectedState);
  });
});
