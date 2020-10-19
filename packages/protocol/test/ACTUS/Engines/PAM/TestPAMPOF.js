/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');

const { getDefaultTestTerms, web3ResponseToState } = require('../../../helper/ACTUS/tests');
const { getSnapshotTaker, deployTestPAMPOF } = require('../../../helper/setupTestEnvironment');


describe('TestPAMPOF', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestPOF = await deployTestPAMPOF(buidlerRuntime);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.PAMTerms = await getDefaultTestTerms('PAM');
  });

  /*
   * TEST POF_PAM_FP
   */
  // feeBasis.A
  it('PAM fee basis A: should yield a fee of 5', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 0;

    this.PAMTerms.feeBasis = 0; // FeeBasis.A
    this.PAMTerms.feeRate = web3.utils.toWei('5'); // set fixed fee
    this.PAMTerms.contractRole = 0; //RPA -> roleSign = 1
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_PAM_FP(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '5000000000000000000');
  });

  // feeBasis.N
  it('PAM fee basis N: should yield a fee of 10100', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.feeBasis = 1; // FeeBasis.N
    this.PAMTerms.businessDayConvention = 0; // NULL
    this.PAMTerms.calendar = 0; // NoCalendar
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.maturityDate = 31536000; // 1 year
    this.PAMTerms.feeRate = web3.utils.toWei('.05'); // set fee rate

    state.statusDate = '0';
    state.feeAccrued = web3.utils.toWei('100');
    state.notionalPrincipal = web3.utils.toWei('1000000');

    const payoff = await this.TestPOF.methods._POF_PAM_FP(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '10100000000000000000000');
  });

  /*
  * TEST POF_PAM_IED
  */

  it('Should yield an initial exchange amount of -1000100', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 0;

    this.PAMTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMTerms.notionalPrincipal = web3.utils.toWei('1000000'); // notionalPrincipal = 1M
    this.PAMTerms.premiumDiscountAtIED = web3.utils.toWei('100'); // premiumDiscountAtIED = 100
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_PAM_IED(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '-1000100000000000000000000');
  });

  /*
   * TEST POF_PAM_IP
   */
  it('Should yield an interest payment of 20200', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.PAMTerms.businessDayConvention = 0; // NULL
    this.PAMTerms.calendar = 0; // NoCalendar
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.maturityDate = 31536000; // 1 year
    
    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');
    state.accruedInterest = web3.utils.toWei('100');
    state.nominalInterestRate = web3.utils.toWei('0.05');
    state.interestScalingMultiplier = web3.utils.toWei('2');

    const payoff = await this.TestPOF.methods._POF_PAM_IP(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '20200000000000000000000');
  });

  /*
   * TEST POF_PAM_PP
   */
  it('Should yield a principal prepayment of 1000000', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.PAMTerms.contractRole = 0; //RPA -> roleSign = 1
    
    state.notionalPrincipal = web3.utils.toWei('1000000'); // notionalPrincipal = 1M
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_PAM_PP(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '1000000000000000000000000');
  });

  /*
  * TEST POF_PAM_PRD
  */

  // it('Should yield a purchase price of −89900', async () => {
  //   const state = await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call();
  //   const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';

  //   // used data
  //   const scheduleTime = 6307200; // .2 years
  //   this.PAMTerms.contractRole = 0; //RPA -> roleSign = 1
  //   this.PAMTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
  //   this.PAMTerms.businessDayConvention = 0; // NULL
  //   this.PAMTerms.calendar = 0; // NoCalendar
  //   this.PAMTerms.dayCountConvention = 2; // A_365
  //   this.PAMTerms.maturityDate = 31536000; // 1 year
  //   state[1] = '0'; // statusDate = 0
  //   state[6] = web3.utils.toWei('100'); // accruedInterest
  //   state[8] = web3.utils.toWei('0.05'); // nominalInterestRate
  //   state[5] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M

  //   const payoff = await this.TestPOF.methods._POF_PAM_PRD(
  //     this.PAMTerms, 
  //     state, 
  //     scheduleTime, 
  //     externalData 
  //     ).call();
  //   assert.strictEqual(payoff.toString(), '-89900000000000000000000');
  // });

  /*
   * TEST POF_PAM_MD
   */
  it('Should yield a maturity payoff of 1100000', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state.notionalPrincipal = web3.utils.toWei('1000000');
    state.notionalScalingMultiplier = web3.utils.toWei('1.1');
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_PAM_MD(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '1100000000000000000000000');
  });

  /*
   * TEST POF_PAM_PY
   */
  // PenaltyType.A
  it('Should yield a penalty payment of 1000', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.PAMTerms.penaltyType = 1 // 1 = PenaltyType.A
    this.PAMTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMTerms.penaltyRate = web3.utils.toWei('1000');
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_PAM_PY(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '1000000000000000000000');
  });

  // PenaltyType.N
  it('Should yield a penalty payment of 20000', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.PAMTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMTerms.penaltyType = 2 // 2 = PenaltyType.N
    this.PAMTerms.penaltyRate = web3.utils.toWei('0.1');
    this.PAMTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.PAMTerms.businessDayConvention = 0; // NULL
    this.PAMTerms.calendar = 0; // NoCalendar
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.maturityDate = 31536000; // 1 year
    
    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');

    const payoff = await this.TestPOF.methods._POF_PAM_PY(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '20000000000000000000000');
  });

  // Other PenaltyTypes
  it('Should yield a penalty payment of 200000', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.PAMTerms.penaltyType = 0 // 0 = PenaltyType.O
    this.PAMTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.PAMTerms.businessDayConvention = 0; // NULL
    this.PAMTerms.calendar = 0; // NoCalendar
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.maturityDate = 31536000; // 1 year
    
    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');

    const payoff = await this.TestPOF.methods._POF_PAM_PY(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '200000000000000000000000');
  });

  /*
   * TEST POF_PAM_TD
   */
  it('Should yield a termination payoff of 110100', async () => {
    const state = web3ResponseToState(await this.PAMEngineInstance.methods.computeInitialState(this.PAMTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.PAMTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.PAMTerms.contractRole = 0; //RPA -> roleSign = 1
    this.PAMTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.PAMTerms.businessDayConvention = 0; // NULL
    this.PAMTerms.calendar = 0; // NoCalendar
    this.PAMTerms.dayCountConvention = 2; // A_365
    this.PAMTerms.maturityDate = 31536000; // 1 year
    
    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');
    state.accruedInterest = web3.utils.toWei('100');
    state.nominalInterestRate = web3.utils.toWei('0.05');

    const payoff = await this.TestPOF.methods._POF_PAM_TD(
      this.PAMTerms,
      state,
      scheduleTime,
      externalData
    ).call();
  
    assert.strictEqual(payoff.toString(), '110100000000000000000000');
  });
});
