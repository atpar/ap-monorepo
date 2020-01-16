const { toWei } = require("web3-utils");

const TestSTF = artifacts.require('TestSTF.sol');
const PAMEngine = artifacts.require('PAMEngine.sol');
const ANNEngine = artifacts.require('ANNEngine.sol');
const CEGEngine = artifacts.require('CEGEngine.sol');
const { getDefaultTestTerms, getDefaultState, assertEqualStates} = require('../helper/tests');
const { parseTermsToLifecycleTerms } = require('../helper/parser');

contract('TestSTF', () => {
  before(async () => {       
    this.PAMEngineInstance = await PAMEngine.new(); 
    this.PAMTerms = await getDefaultTestTerms('PAM');
    this.PAMLifecycleTerms = parseTermsToLifecycleTerms(this.PAMTerms);

    this.ANNEngineInstance = await ANNEngine.new(); 
    this.ANNTerms = await getDefaultTestTerms('ANN');
    this.ANNLifecycleTerms = parseTermsToLifecycleTerms(this.ANNTerms);

    this.CEGEngineInstance = await CEGEngine.new(); 
    this.CEGTerms = await getDefaultTestTerms('ANN'); // TODO: create default test cases for CEG
    this.CEGLifecycleTerms = parseTermsToLifecycleTerms(this.CEGTerms);

    this.TestSTF = await TestSTF.new();
  });

  
  /*
  * TEST STF_PAM_AD
  */
  it('PAM Analysis Event STF', async () => {
    const oldState = getDefaultState();
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 6307200; // .2 years

    this.PAMLifecycleTerms.feeRate = toWei("0.01");
    this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
    this.PAMLifecycleTerms.businessDayConvention = 0; // NULL

    // Construct expected state from default state
    const expectedState = getDefaultState();
    expectedState.accruedInterest = toWei('10100');
    expectedState.feeAccrued = toWei("2010");
    expectedState.statusDate = 6307200;

    const newState = await this.TestSTF._STF_PAM_AD(
      this.PAMLifecycleTerms, 
      oldState, 
      scheduleTime, 
      externalData 
      );

    assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_FP
  */
   it('PAM Fee Payment STF', async () => {
  const oldState = getDefaultState();
  const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const scheduleTime = 6307200; // .2 years

  this.PAMLifecycleTerms.feeRate = toWei("0.01");
  this.PAMLifecycleTerms.nominalInterestRate = toWei("0.05");
  this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  this.PAMLifecycleTerms.businessDayConvention = 0; // NULL

  // Construct expected state from default state
  const expectedState = getDefaultState();
  expectedState.accruedInterest = toWei('10100');
  expectedState.feeAccrued = toWei("0");
  expectedState.statusDate = 6307200;

  const newState = await this.TestSTF._STF_PAM_FP(
    this.PAMLifecycleTerms, 
    oldState, 
    scheduleTime, 
    externalData 
    );

  assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_IED
  */
   it('PAM Initial Exchange STF', async () => {
  const oldState = getDefaultState();
  const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const scheduleTime = 6307200; // .2 years

  this.PAMLifecycleTerms.feeRate = toWei("0.01");
  this.PAMLifecycleTerms.nominalInterestRate = toWei('0.05');
  this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
  this.PAMLifecycleTerms.notionalPrincipal = toWei('1000000'); // NULL
  this.PAMLifecycleTerms.accruedInterest = toWei('0')

  // Construct expected state from default state
  const expectedState = getDefaultState();
  expectedState.notionalPrincipal = toWei('1000000')
  expectedState.nominalInterestRate = toWei('0.05')
  expectedState.statusDate = 6307200;
  expectedState.accruedInterest = toWei('0')

  const newState = await this.TestSTF._STF_PAM_IED(
    this.PAMLifecycleTerms, 
    oldState, 
    scheduleTime, 
    externalData 
    );

  assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_IPCI
  */
   it('PAM Interest Capitalization STF', async () => {
  const oldState = getDefaultState();
  const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const scheduleTime = 6307200; // .2 years

  this.PAMLifecycleTerms.feeRate = toWei("0.01");
  this.PAMLifecycleTerms.nominalInterestRate = toWei("0.05");
  this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
  this.PAMLifecycleTerms.notionalPrincipal = toWei('1000000')

  // Construct expected state from default state
  const expectedState = getDefaultState();
  expectedState.notionalPrincipal = toWei('1010100');
  expectedState.accruedInterest = toWei('0');
  expectedState.feeAccrued = toWei('2030.2');
  expectedState.statusDate = 6307200;


  const newState = await this.TestSTF._STF_PAM_IPCI(
    this.PAMLifecycleTerms, 
    oldState, 
    scheduleTime, 
    externalData 
    );

  assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_IP
  */
   it('PAM Interest Payment STF', async () => {
  const oldState = getDefaultState();
  const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const scheduleTime = 6307200; // .2 years

  this.PAMLifecycleTerms.feeRate = toWei("0.01");
  this.PAMLifecycleTerms.nominalInterestRate = toWei("0.05");
  this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  this.PAMLifecycleTerms.businessDayConvention = 0; // NULL

  // Construct expected state from default state
  const expectedState = getDefaultState();
  expectedState.accruedInterest = toWei('0');
  expectedState.feeAccrued = toWei('2010');
  expectedState.statusDate = 6307200;

  const newState = await this.TestSTF._STF_PAM_IP(
    this.PAMLifecycleTerms, 
    oldState, 
    scheduleTime, 
    externalData 
    );

  assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_PP
  */
   it('PAM Principal Payment STF', async () => {
  const oldState = getDefaultState();
  const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const scheduleTime = 6307200; // .2 years

  this.PAMLifecycleTerms.feeRate = toWei("0.01");
  this.PAMLifecycleTerms.nominalInterestRate = toWei("0.05");
  this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  this.PAMLifecycleTerms.businessDayConvention = 0; // NULL

  // Construct expected state from default state
  const expectedState = getDefaultState();
  expectedState.accruedInterest = toWei('10100');
  expectedState.feeAccrued = toWei('2010');
  expectedState.notionalPrincipal = toWei('1000000');
  expectedState.statusDate = 6307200;


  const newState = await this.TestSTF._STF_PAM_PP(
    this.PAMLifecycleTerms, 
    oldState, 
    scheduleTime, 
    externalData 
    );

  assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_PR
  */
   it('PAM Princiapl Redemption STF', async () => {
  const oldState = getDefaultState();
  const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const scheduleTime = 6307200; // .2 years

  this.PAMLifecycleTerms.feeRate = toWei("0.01");
  this.PAMLifecycleTerms.nominalInterestRate = toWei("0.05");
  this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  this.PAMLifecycleTerms.businessDayConvention = 0; // NULL

  // Construct expected state from default state
  const expectedState = getDefaultState();
  expectedState.accruedInterest = toWei('10100');
  expectedState.feeAccrued = toWei('2010');
  expectedState.notionalPrincipal = toWei('0')
  expectedState.statusDate = 6307200;


  const newState = await this.TestSTF._STF_PAM_PR(
    this.PAMLifecycleTerms, 
    oldState, 
    scheduleTime, 
    externalData 
    );

  assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_PY
  */
   it('PAM Princiapl Redemption STF', async () => {
  const oldState = getDefaultState();
  const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const scheduleTime = 6307200; // .2 years

  this.PAMLifecycleTerms.feeRate = toWei("0.01");
  this.PAMLifecycleTerms.nominalInterestRate = toWei("0.05");
  this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  this.PAMLifecycleTerms.businessDayConvention = 0; // NULL

  // Construct expected state from default state
  const expectedState = getDefaultState();
  expectedState.accruedInterest = toWei('10100');
  expectedState.feeAccrued = toWei('2010');
  expectedState.statusDate = 6307200;


  const newState = await this.TestSTF._STF_PAM_PY(
    this.PAMLifecycleTerms, 
    oldState, 
    scheduleTime, 
    externalData 
    );

  assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_RRF
  */
   it('PAM Fixed Rate Reset STF', async () => {
  const oldState = getDefaultState();
  const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const scheduleTime = 6307200; // .2 years

  this.PAMLifecycleTerms.feeRate = toWei("0.01");
  this.PAMLifecycleTerms.nominalInterestRate = toWei("0.05");
  this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
  this.PAMLifecycleTerms.nextResetRate = toWei('0.06')

  // Construct expected state from default state
  const expectedState = getDefaultState();
  expectedState.accruedInterest = toWei('10100');
  expectedState.feeAccrued = toWei('2010');
  expectedState.nominalInterestRate = toWei('0.06')
  expectedState.statusDate = 6307200;


  const newState = await this.TestSTF._STF_PAM_RRF(
    this.PAMLifecycleTerms, 
    oldState, 
    scheduleTime, 
    externalData 
    );

  assertEqualStates(newState, expectedState);
  });

  /*
  * TEST STF_PAM_RR
  */

  //  it('PAM Fixed Rate Reset STF', async () => {
  // const oldState = getDefaultState();
  // const externalData = web3.utils.hexToBytes('0x00000000000000000000000000000000000000000000000000d529ae9e860000'); //0.6
  // const scheduleTime = 6307200; // .2 years

  // this.PAMLifecycleTerms.feeRate = toWei("0.01");
  // this.PAMLifecycleTerms.nominalInterestRate = toWei("0.05");
  // this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  // this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
  // this.PAMLifecycleTerms.rateSpread = toWei('0.001');
  // this.PAMLifecycleTerms.rateMultiplier = toWei('1.001');
  // this.PAMLifecycleTerms.lifeCap = toWei('0.1');
  // this.PAMLifecycleTerms.lifeFloor = toWei('0.01');
  // this.PAMLifecycleTerms.periodCap = toWei('0.02')
  // this.PAMLifecycleTerms.periodFloor = toWei('-0.02');
  
  // // Construct expected state from default state
  // const expectedState = getDefaultState();
  // expectedState.accruedInterest = toWei('10100');
  // expectedState.statusDate = 6307200;

  // // rate: 0.05 * 1.001 + 0.001 = 0.06005
  // // deltaRate: rate - 0.05 = 0.01005


  // console.log(oldState)
  // const newState = await this.TestSTF._STF_PAM_RR(
  //   this.PAMLifecycleTerms, 
  //   oldState, 
  //   scheduleTime, 
  //   externalData 
  //   );
  // console.log(newState)
  // assertEqualStates(newState, expectedState);

  // });

});
