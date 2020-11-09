/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getDefaultTestTerms, web3ResponseToState } = require('../../../helper/ACTUS/tests');
const { getSnapshotTaker, deployTestANNPOF } = require('../../../helper/setupTestEnvironment');


describe('TestANNPOF', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestPOF = await deployTestANNPOF(buidlerRuntime);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.ANNTerms = await getDefaultTestTerms('ANN');
  });

  /*
   * TEST POF_ANN_PR
   */
  it('Should yield a termination principal prepayment of -100100', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state.notionalScalingMultiplier = web3.utils.toWei('1.1');
    state.notionalPrincipal = web3.utils.toWei('1000000');
    state.nextPrincipalRedemptionPayment = web3.utils.toWei('1000');
    state.accruedInterest = web3.utils.toWei('100');
    state.statusDate = '0'; // statusDate = 0
    state.nominalInterestRate = web3.utils.toWei('0.05'); // nominalInterestRate

    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year

    const payoff = await this.TestPOF.methods._POF_ANN_PR(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '-10010000000000000000000');
  });

  /*
   * TEST POF_ANN_FP
   */
  // feeBasis.A
  it('ANN fee basis A: should yield a fee of 5', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 0;

    this.ANNTerms.feeBasis = 0; // FeeBasis.A
    this.ANNTerms.feeRate = web3.utils.toWei('5'); // set fixed fee
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_ANN_FP(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '5000000000000000000');
  });

  // feeBasis.N
  it('ANN fee basis N: should yield a fee of 10100', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.ANNTerms.feeBasis = 1; // FeeBasis.N
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year
    this.ANNTerms.feeRate = web3.utils.toWei('.05'); // set fee rate

    state.feeAccrued = web3.utils.toWei('100');
    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');

    const payoff = await this.TestPOF.methods._POF_ANN_FP(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '10100000000000000000000');
  });

  /*
   * TEST POF_ANN_IED
   */
  it('Should yield an initial exchange amount of -1000100', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 0;

    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.notionalPrincipal = web3.utils.toWei('1000000'); // notionalPrincipal = 1M
    this.ANNTerms.premiumDiscountAtIED = web3.utils.toWei('100'); // premiumDiscountAtIED = 100
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_ANN_IED(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '-1000100000000000000000000');
  });

  /*
   * TEST POF_ANN_IP
   */
  it('Should yield an interest payment of 20200', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year

    state.interestScalingMultiplier = web3.utils.toWei('2');
    state.accruedInterest = web3.utils.toWei('100');
    state.statusDate = '0';
    state.nominalInterestRate = web3.utils.toWei('0.05');
    state.notionalPrincipal = web3.utils.toWei('1000000');

    const payoff = await this.TestPOF.methods._POF_ANN_IP(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '20200000000000000000000');
  });

  /*
   * TEST POF_ANN_PP
   */
  it('Should yield a principal prepayment of 1000000', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    state.notionalPrincipal = web3.utils.toWei('1000000');
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_ANN_PP(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '1000000000000000000000000');
  });

  it('Should yield a maturity payoff of 1100000', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state.notionalScalingMultiplier = web3.utils.toWei('1.1');
    state.notionalPrincipal = web3.utils.toWei('1000000');
    state.statusDate = '0';

    const payoff = await this.TestPOF.methods._POF_ANN_MD(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '1100000000000000000000000');
  });

  /*
   * TEST POF_ANN_PY
   */
  // PenaltyType.A
  it('Should yield a penalty payment of 1000', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state.statusDate = '0';
    this.ANNTerms.penaltyType = 1 // 1 = PenaltyType.A
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.penaltyRate = web3.utils.toWei('1000');

    const payoff = await this.TestPOF.methods._POF_ANN_PY(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '1000000000000000000000');
  });

  // PenaltyType.N
  it('Should yield a penalty payment of 20000', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.ANNTerms.penaltyType = 2 // 2 = PenaltyType.N
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.penaltyRate = web3.utils.toWei('0.1');
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year

    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');

    const payoff = await this.TestPOF.methods._POF_ANN_PY(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '20000000000000000000000');
  });

  // Other PenaltyTypes
  it('Should yield a penalty payment of 200000', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.ANNTerms.penaltyType = 0 // 0 = PenaltyType.O
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year

    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');

    const payoff = await this.TestPOF.methods._POF_ANN_PY(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '200000000000000000000000');
  });

  /*
   * TEST POF_ANN_TD
   */
  it('Should yield a termination payoff of 110100', async () => {
    const state = web3ResponseToState(await this.ANNEngineInstance.methods.computeInitialState(this.ANNTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year

    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');
    state.accruedInterest = web3.utils.toWei('100');
    state.nominalInterestRate = web3.utils.toWei('0.05');

    const payoff = await this.TestPOF.methods._POF_ANN_TD(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    ).call();
    assert.strictEqual(payoff.toString(), '110100000000000000000000');
  });
});
