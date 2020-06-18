const TestPOF = artifacts.require('TestANNPOF.sol');
const ANNEngine = artifacts.require('ANNEngine.sol');
const { getDefaultTestTerms } = require('../../helper/tests');


contract('TestANNPOF', () => {
  before(async () => {
    this.ANNEngineInstance = await ANNEngine.new();
    this.ANNTerms = await getDefaultTestTerms('ANN');

    this.TestPOF = await TestPOF.new();
  });

  /*
  * TEST POF_ANN_PR
  */

  it('Should yield a termination principal prepayment of -100100', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';

    // used data
    state[11] = web3.utils.toWei('1.1'); // notionalScalingMultiplier
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    state[6] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M
    state[12] = web3.utils.toWei('1000'); // nextPrinipalRedemptionPayment
    state[7] = web3.utils.toWei('100'); // accruedInterest


    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    const scheduleTime = 6307200; // .2 years
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year
    state[1] = '0'; // statusDate = 0
    state[9] = web3.utils.toWei('0.05'); // nominalInterestRate

    const payoff = await this.TestPOF._POF_ANN_PR(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '-10010000000000000000000');
  });


  /*
* TEST POF_ANN_FP
*/

  // feeBasis.A
  it('ANN fee basis A: should yield a fee of 5', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 0;

    this.ANNTerms.feeBasis = 0; // FeeBasis.A
    this.ANNTerms.feeRate = web3.utils.toWei('5'); // set fixed fee
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1

    const payoff = await this.TestPOF._POF_ANN_FP(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '5000000000000000000');
  });

  // feeBasis.N
  it('ANN fee basis N: should yield a fee of 10100', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.ANNTerms.feeBasis = 1; // FeeBasis.N
    state[8] = web3.utils.toWei('100'); // feeAccrued = 100
    state[1] = '0'; // statusDate = 0
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year

    this.ANNTerms.feeRate = web3.utils.toWei('.05'); // set fee rate
    state[6] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_ANN_FP(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '10100000000000000000000');
  });



  /*
* TEST POF_ANN_IED
*/

  it('Should yield an initial exchange amount of -1000100', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    scheduleTime = 0;

    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.notionalPrincipal = web3.utils.toWei('1000000'); // notionalPrincipal = 1M
    this.ANNTerms.premiumDiscountAtIED = web3.utils.toWei('100'); // premiumDiscountAtIED = 100

    const payoff = await this.TestPOF._POF_ANN_IED(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '-1000100000000000000000000');
  });

  /*
  * TEST POF_ANN_IP
  */

  it('Should yield an interest payment of 20200', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    state[10] = web3.utils.toWei('2'); // interestScalingMultiplier
    state[7] = web3.utils.toWei('100'); // accruedInterest
    state[1] = '0'; // statusDate = 0
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year
    state[9] = web3.utils.toWei('0.05'); // nominalInterestRate
    state[6] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_ANN_IP(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '20200000000000000000000');
  });

  /*
  * TEST POF_ANN_PP
  */

  it('Should yield a principal prepayment of 1000000', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    state[6] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_ANN_PP(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '1000000000000000000000000');
  });


  it('Should yield a maturity payoff of 1100000', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state[11] = web3.utils.toWei('1.1'); // notionalScalingMultiplier
    state[6] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_ANN_MD(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '1100000000000000000000000');
  });

  /*
  * TEST POF_ANN_PY
  */
  // PenaltyType.A
  it('Should yield a penalty payment of 1000', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    this.ANNTerms.penaltyType = 1 // 1 = PenaltyType.A
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.penaltyRate = web3.utils.toWei('1000');

    const payoff = await this.TestPOF._POF_ANN_PY(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '1000000000000000000000');
  });

  // PenaltyType.N
  it('Should yield a penalty payment of 20000', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';

    // used data
    this.ANNTerms.penaltyType = 2 // 2 = PenaltyType.N
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.penaltyRate = web3.utils.toWei('0.1');
    const scheduleTime = 6307200; // .2 years
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year
    state[1] = '0'; // statusDate = 0
    state[6] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_ANN_PY(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '20000000000000000000000');
  });

  // Other PenaltyTypes
  it('Should yield a penalty payment of 200000', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';

    // used data
    this.ANNTerms.penaltyType = 0 // 0 = PenaltyType.O
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    const scheduleTime = 6307200; // .2 years
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year
    state[1] = '0'; // statusDate = 0
    state[6] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_ANN_PY(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '200000000000000000000000');
  });

  /*
  * TEST POF_ANN_TD
  */

  it('Should yield a termination payoff of 110100', async () => {
    const state = await this.ANNEngineInstance.computeInitialState(this.ANNTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';

    // used data
    state[7] = web3.utils.toWei('100'); // accruedInterest
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    const scheduleTime = 6307200; // .2 years
    this.ANNTerms.contractRole = 0; //RPA -> roleSign = 1
    this.ANNTerms.priceAtPurchaseDate = web3.utils.toWei('100000');
    this.ANNTerms.businessDayConvention = 0; // NULL
    this.ANNTerms.calendar = 0; // NoCalendar
    this.ANNTerms.dayCountConvention = 2; // A_365
    this.ANNTerms.maturityDate = 31536000; // 1 year
    state[1] = '0'; // statusDate = 0
    state[9] = web3.utils.toWei('0.05'); // nominalInterestRate
    state[6] = web3.utils.toWei('1000000'); // notionalPrincipal = 1M

    const payoff = await this.TestPOF._POF_ANN_TD(
      this.ANNTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '110100000000000000000000');
  });



});