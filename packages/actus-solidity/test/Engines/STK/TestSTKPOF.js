/* global artifacts, before, beforeEach, contract, describe, it, web3 */
const TestPOF = artifacts.require('TestSTKPOF.sol');
const STKEngine = artifacts.require('STKEngine.sol');
const { getDefaultTestTerms, web3ResponseToState } = require('../../helper/tests');

const e18 = '000000000000000000'

contract('TestSTKPOF', () => {
  before(async () => {
    this.STKEngineInstance = await STKEngine.new();
    this.STKTerms = await getDefaultTestTerms('STK');
    this.TestPOF = await TestPOF.new();
    
    this.STKTerms.redeemableByIssuer = '0';
  });

  /*
   * TEST POF_STK_DIP
   */
  it('Should yield a dividend payment amount', async () => {
    const state = web3ResponseToState(await this.STKEngineInstance.computeInitialState(this.STKTerms));
    const scheduleTime = 0;
    state.statusDate = '0';

    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    state.dividendPaymentAmount = '50000'+e18;

    const payoff = await this.TestPOF._POF_STK_DIP(
      this.STKTerms,
      state,
      scheduleTime,
      externalData
    );

    assert.equal(payoff.toString(), '50000'+e18);
  });

  /*
  * TEST POF_STK_REP
  */
  describe('Yielding a redemption payment amount', () => {
    it('Should use the redemption price from terms, if set', async () => {
      const state = web3ResponseToState(await this.STKEngineInstance.computeInitialState(this.STKTerms));
      const scheduleTime = 0;
      state.statusDate = '0';

      const terms = Object.assign({}, this.STKTerms, { redemptionPrice: '300'+e18 });
      const externalData = '0x000000000000000000000000000000000000000000000015af1d78b58c400000'; // 400e+18
      state.exerciseQuantity = '1000'+e18;

      const payoff = await this.TestPOF._POF_STK_REP(
        terms,
        state,
        scheduleTime,
        externalData
      );

      assert.equal(payoff.toString(), '300000'+e18);
    });

    it('Should use the redemption price from externalData, otherwise', async () => {
      const state = web3ResponseToState(await this.STKEngineInstance.computeInitialState(this.STKTerms));
      const scheduleTime = 0;
      state.statusDate = '0';

      const externalData = '0x000000000000000000000000000000000000000000000015af1d78b58c400000'; // 400e+18
      state.exerciseQuantity = '1000'+e18;

      const payoff = await this.TestPOF._POF_STK_REP(
        this.STKTerms,
        state,
        scheduleTime,
        externalData
      );

      assert.equal(payoff.toString(), '400000'+e18);
    });
  });

  /*
   * TEST POF_STK_TD
   */
  xit('Should yield a termination payment amount', async () => {
    // TODO: review as soon as terms.priceAtTerminationDate gets supported
  });
});
