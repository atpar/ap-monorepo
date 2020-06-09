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


});