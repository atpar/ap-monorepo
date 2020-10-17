const TestPOF = artifacts.require('TestCECPOF.sol');
const CECEngine = artifacts.require('CECEngine.sol');
const { getDefaultTestTerms, web3ResponseToState } = require('../../helper/tests');


contract('TestCECPOF', () => {
  before(async () => {
    this.CECEngineInstance = await CECEngine.new();
    this.CECTerms = await getDefaultTestTerms('CEC'); // TODO: create default test cases for CEC
    this.TestPOF = await TestPOF.new();
  });

  /*
   * TEST POF_CEC_ST
   */
  it('Should yield a settlement payoff of 100005', async () => {
    const state = web3ResponseToState(await this.CECEngineInstance.computeInitialState(this.CECTerms));
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state.exerciseAmount = web3.utils.toWei('100000');
    state.feeAccrued = web3.utils.toWei('5');

    const payoff = await this.TestPOF._POF_CEC_ST(
      this.CECTerms,
      state,
      scheduleTime,
      externalData
    );

    assert.equal(payoff.toString(), '100005000000000000000000');
  });
});
