const TestPOF = artifacts.require('TestCECPOF.sol');
const CECEngine = artifacts.require('CECEngine.sol');
const { getDefaultTestTerms } = require('../../helper/tests');


contract('TestCECPOF', () => {
  before(async () => {
    this.CECEngineInstance = await CECEngine.new();
    this.CECTerms = await getDefaultTestTerms('CEC'); // TODO: create default test cases for CEC

    this.TestPOF = await TestPOF.new();
  });

  /*
  * TEST POF_CEC_STD
  */

  it('Should yield a settlement payoff of 100005', async () => {
    const state = await this.CECEngineInstance.computeInitialState(this.CECTerms);
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state[13] = web3.utils.toWei('100000'); // exerciseAmount
    state[8] = web3.utils.toWei('5'); // feeAccrued


    const payoff = await this.TestPOF._POF_CEC_STD(
      this.CECTerms,
      state,
      scheduleTime,
      externalData
    );
    assert.equal(payoff.toString(), '100005000000000000000000');
  });

});