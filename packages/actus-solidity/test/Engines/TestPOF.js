const TestPOF = artifacts.require('TestPOF.sol');
const PAMEngine = artifacts.require('PAMEngine.sol');
const ANNEngine = artifacts.require('ANNEngine.sol');
const CEGEngine = artifacts.require('CEGEngine.sol');
const { getDefaultTestTerms } = require('../helper/tests');
const { parseTermsToLifecycleTerms } = require('../helper/parser');

contract('TestPOF', () => {
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

    this.TestPOF = await TestPOF.new();
  });

  /*
  * TEST POF_PAM_FP
  */

  // feeBasis.A
  it('PAM fee basis A: should yield a fee of 5', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 0;

    this.PAMLifecycleTerms.feeBasis = 0; // FeeBasis.A
    this.PAMLifecycleTerms.feeRate = web3.utils.toWei("5"); // set fixed fee
    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    
    const payoff = await this.TestPOF._POF_PAM_FP(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "5000000000000000000");
  });

  // feeBasis.N
  it('PAM fee basis N: should yield a fee of 10100', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 6307200; // .2 years

    this.PAMLifecycleTerms.feeBasis = 1; // FeeBasis.N
    state[7] = web3.utils.toWei("100"); // feeAccrued = 100
    state[1] = '0'; // statusDate = 0
    this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
    this.PAMLifecycleTerms.calendar = 0; // NoCalendar
    this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
    this.PAMLifecycleTerms.maturityDate = 31536000; // 1 year

    this.PAMLifecycleTerms.feeRate = web3.utils.toWei(".05"); // set fee rate
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M
    
    const payoff = await this.TestPOF._POF_PAM_FP(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "10100000000000000000000");
  });

  /*
  * TEST POF_PAM_IED
  */

  it('Should yield an initial exchange amount of -1000100', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    scheduleTime = 0;

    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMLifecycleTerms.notionalPrincipal = web3.utils.toWei("1000000"); // notionalPrincipal = 1M
    this.PAMLifecycleTerms.premiumDiscountAtIED = web3.utils.toWei("100"); // premiumDiscountAtIED = 100

    const payoff = await this.TestPOF._POF_PAM_IED(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "-1000100000000000000000000");
  });

  /*
  * TEST POF_PAM_IP
  */

  it('Should yield an interest payment of 20200', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 6307200; // .2 years

    state[9] = web3.utils.toWei("2"); // interestScalingMultiplier
    state[6] = web3.utils.toWei("100"); // accruedInterest
    state[1] = '0'; // statusDate = 0
    this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
    this.PAMLifecycleTerms.calendar = 0; // NoCalendar
    this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
    this.PAMLifecycleTerms.maturityDate = 31536000; // 1 year
    state[8] = web3.utils.toWei("0.05"); // nominalInterestRate
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_PAM_IP(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "20200000000000000000000");
  });

  /*
  * TEST POF_PAM_PP
  */

  it('Should yield a principal prepayment of 1000000', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 6307200; // .2 years

    // used data
    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_PAM_PP(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "1000000000000000000000000");
  });

  /*
  * TEST POF_PAM_PRD
  */

  // it('Should yield a purchase price of −89900', async () => {
  //   const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
  //   const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";

  //   // used data
  //   const scheduleTime = 6307200; // .2 years
  //   this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
  //   this.PAMLifecycleTerms.priceAtPurchaseDate = web3.utils.toWei("100000");
  //   this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
  //   this.PAMLifecycleTerms.calendar = 0; // NoCalendar
  //   this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
  //   this.PAMLifecycleTerms.maturityDate = 31536000; // 1 year
  //   state[1] = '0'; // statusDate = 0
  //   state[6] = web3.utils.toWei("100"); // accruedInterest
  //   state[8] = web3.utils.toWei("0.05"); // nominalInterestRate
  //   state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M

  //   const payoff = await this.TestPOF._POF_PAM_PRD(
  //     this.PAMLifecycleTerms, 
  //     state, 
  //     scheduleTime, 
  //     externalData 
  //     );
  //   assert.equal(payoff.toString(), "-89900000000000000000000");
  // });

  /*
  * TEST POF_PAM_MD
  */

  it('Should yield a maturity payoff of 1100000', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 6307200; // .2 years

    // used data
    state[10] = web3.utils.toWei("1.1"); // notionalScalingMultiplier
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_PAM_MD(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "1100000000000000000000000");
  });

  /*
  * TEST POF_PAM_PY
  */
  // PenaltyType.A
  it('Should yield a penalty payment of 1000', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 6307200; // .2 years

    // used data
    this.PAMLifecycleTerms.penaltyType = 1 // 1 = PenaltyType.A
    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMLifecycleTerms.penaltyRate = web3.utils.toWei("1000");

    const payoff = await this.TestPOF._POF_PAM_PY(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "1000000000000000000000");
  });

  // PenaltyType.N
  it('Should yield a penalty payment of 20000', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";

    // used data
    this.PAMLifecycleTerms.penaltyType = 2 // 2 = PenaltyType.N
    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMLifecycleTerms.penaltyRate = web3.utils.toWei("0.1");
    const scheduleTime = 6307200; // .2 years
    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMLifecycleTerms.priceAtPurchaseDate = web3.utils.toWei("100000");
    this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
    this.PAMLifecycleTerms.calendar = 0; // NoCalendar
    this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
    this.PAMLifecycleTerms.maturityDate = 31536000; // 1 year
    state[1] = '0'; // statusDate = 0
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_PAM_PY(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "20000000000000000000000");
  });

  // Other PenaltyTypes
  it('Should yield a penalty payment of 200000', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";

    // used data
    this.PAMLifecycleTerms.penaltyType = 0 // 0 = PenaltyType.O
    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    const scheduleTime = 6307200; // .2 years
    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMLifecycleTerms.priceAtPurchaseDate = web3.utils.toWei("100000");
    this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
    this.PAMLifecycleTerms.calendar = 0; // NoCalendar
    this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
    this.PAMLifecycleTerms.maturityDate = 31536000; // 1 year
    state[1] = '0'; // statusDate = 0
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_PAM_PY(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "200000000000000000000000");
  });

  /*
  * TEST POF_PAM_TD
  */

  it('Should yield a termination payoff of 110100', async () => {
    const state = await this.PAMEngineInstance.computeInitialState(this.PAMLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";

    // used data
    state[6] = web3.utils.toWei("100"); // accruedInterest
    this.PAMLifecycleTerms.priceAtPurchaseDate = web3.utils.toWei("100000");
    const scheduleTime = 6307200; // .2 years
    this.PAMLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMLifecycleTerms.priceAtPurchaseDate = web3.utils.toWei("100000");
    this.PAMLifecycleTerms.businessDayConvention = 0; // NULL
    this.PAMLifecycleTerms.calendar = 0; // NoCalendar
    this.PAMLifecycleTerms.dayCountConvention = 2; // A_365
    this.PAMLifecycleTerms.maturityDate = 31536000; // 1 year
    state[1] = '0'; // statusDate = 0
    state[8] = web3.utils.toWei("0.05"); // nominalInterestRate
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_PAM_TD(
      this.PAMLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "110100000000000000000000");
  });    
  
  /*
  * TEST POF_ANN_PR
  */

  it('Should yield a termination principal prepayment of -100100', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";

    // used data
    state[10] = web3.utils.toWei("1.1"); // notionalScalingMultiplier
    this.ANNLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M
    state[11] = web3.utils.toWei("1000"); // nextPrinipalRedemptionPayment
    state[6] = web3.utils.toWei("100"); // accruedInterest


    this.ANNLifecycleTerms.priceAtPurchaseDate = web3.utils.toWei("100000");
    const scheduleTime = 6307200; // .2 years
    this.ANNLifecycleTerms.priceAtPurchaseDate = web3.utils.toWei("100000");
    this.ANNLifecycleTerms.businessDayConvention = 0; // NULL
    this.ANNLifecycleTerms.calendar = 0; // NoCalendar
    this.ANNLifecycleTerms.dayCountConvention = 2; // A_365
    this.ANNLifecycleTerms.maturityDate = 31536000; // 1 year
    state[1] = '0'; // statusDate = 0
    state[8] = web3.utils.toWei("0.05"); // nominalInterestRate

    const payoff = await this.TestPOF._POF_ANN_PR(
      this.ANNLifecycleTerms, 
      state, 
      scheduleTime,
      externalData 
      );
    assert.equal(payoff.toString(), "-10010000000000000000000");
  });

  /*
  * TEST POF_CEG_STD
  */

  it('Should yield a settlement payoff of 100005', async () => {
    const state = await this.CEGEngineInstance.computeInitialState(this.CEGLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 6307200; // .2 years

    // used data
    state[7] = web3.utils.toWei("100000"); // executionAmount
    state[12] = web3.utils.toWei("5"); // feeAccrued


    const payoff = await this.TestPOF._POF_CEG_STD(
      this.CEGLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "100005000000000000000000");
  });

  /*
  * TEST POF_CEG_PRD
  */
  // it('Should yield a purchase payoff of -100000', async () => {
  //   const state = await this.CEGEngineInstance.computeInitialState(this.CEGLifecycleTerms);
  //   const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
  //   const scheduleTime = 6307200; // .2 years

  //   // used data
  //   this.CEGLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
  //   this.CEGLifecycleTerms.priceAtPurchaseDate = web3.utils.toWei("100000");

  //   const payoff = await this.TestPOF._POF_CEG_PRD(
  //     this.CEGLifecycleTerms, 
  //     state, 
  //     scheduleTime, 
  //     externalData 
  //     );
  //   assert.equal(payoff.toString(), "-100000000000000000000000");
  // });

/*
  * TEST POF_CEG_FP
  */

  // feeBasis.A
  it('CEG fee basis A: should yield a fee of 5', async () => {
    const state = await this.CEGEngineInstance.computeInitialState(this.CEGLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 0;

    this.CEGLifecycleTerms.feeBasis = 0; // FeeBasis.A
    this.CEGLifecycleTerms.feeRate = web3.utils.toWei("5"); // set fixed fee
    this.CEGLifecycleTerms.contractRole = 0; //RPA -> roleSign = 1
    
    const payoff = await this.TestPOF._POF_CEG_FP(
      this.CEGLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "5000000000000000000");
  });

  // feeBasis.N
  it('CEG fee basis N: should yield a fee of 10100', async () => {
    const state = await this.CEGEngineInstance.computeInitialState(this.CEGLifecycleTerms);
    const externalData = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const scheduleTime = 6307200; // .2 years

    this.CEGLifecycleTerms.feeBasis = 1; // FeeBasis.N
    state[7] = web3.utils.toWei("100"); // feeAccrued = 100
    state[1] = '0'; // statusDate = 0
    this.CEGLifecycleTerms.businessDayConvention = 0; // NULL
    this.CEGLifecycleTerms.calendar = 0; // NoCalendar
    this.CEGLifecycleTerms.dayCountConvention = 2; // A_365
    this.CEGLifecycleTerms.maturityDate = 31536000; // 1 year

    this.CEGLifecycleTerms.feeRate = web3.utils.toWei(".05"); // set fee rate
    state[5] = web3.utils.toWei("1000000"); // notionalPrincipal = 1M
    
    const payoff = await this.TestPOF._POF_CEG_FP(
      this.CEGLifecycleTerms, 
      state, 
      scheduleTime, 
      externalData 
      );
    assert.equal(payoff.toString(), "10100000000000000000000");
  });
  

});
