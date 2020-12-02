/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getDefaultTestTerms, web3ResponseToState } = require('../../../helper/ACTUS/tests');
const { deployContract, getSnapshotTaker } = require('../../../helper/setupTestEnvironment');

const e18 = '000000000000000000'


describe('TestSTKPOF', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestPOF = await deployContract(buidlerRuntime, 'TestSTKPOF');
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.STKTerms = await getDefaultTestTerms('STK');
    this.STKTerms.redeemableByIssuer = '0';
  });

  /*
   * TEST POF_STK_DIP
   */
  it('Should yield a dividend payment amount', async () => {
    const state = web3ResponseToState(await this.STKEngineInstance.methods.computeInitialState(this.STKTerms).call());
    const scheduleTime = 0;
    state.statusDate = '0';

    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    state.dividendPaymentAmount = '50000'+e18;

    const payoff = await this.TestPOF.methods._POF_STK_DIP(
      this.STKTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '50000'+e18);
  });

  /*
  * TEST POF_STK_REP
  */
  describe('Yielding a redemption payment amount', () => {
    it('Should use the redemption price from terms, if set', async () => {
      const state = web3ResponseToState(await this.STKEngineInstance.methods.computeInitialState(this.STKTerms).call());
      const scheduleTime = 0;
      state.statusDate = '0';

      const terms = Object.assign({}, this.STKTerms, { redemptionPrice: '300'+e18 });
      const externalData = '0x000000000000000000000000000000000000000000000015af1d78b58c400000'; // 400e+18
      state.exerciseQuantity = '1000'+e18;

      const payoff = await this.TestPOF.methods._POF_STK_REP(
        terms,
        state,
        scheduleTime,
        externalData
      ).call();

      assert.strictEqual(payoff.toString(), '300000'+e18);
    });

    it('Should use the redemption price from externalData, otherwise', async () => {
      const state = web3ResponseToState(await this.STKEngineInstance.methods.computeInitialState(this.STKTerms).call());
      const scheduleTime = 0;
      state.statusDate = '0';

      const externalData = '0x000000000000000000000000000000000000000000000015af1d78b58c400000'; // 400e+18
      state.exerciseQuantity = '1000'+e18;

      const payoff = await this.TestPOF.methods._POF_STK_REP(
        this.STKTerms,
        state,
        scheduleTime,
        externalData
      ).call();

      assert.strictEqual(payoff.toString(), '400000'+e18);
    });
  });

  /*
   * TEST POF_STK_TD
   */
  xit('Should yield a termination payment amount', async () => {
    // TODO: review as soon as terms.priceAtTerminationDate gets supported
  });
});
