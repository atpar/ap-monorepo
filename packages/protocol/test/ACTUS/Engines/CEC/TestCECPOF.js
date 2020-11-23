/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getDefaultTestTerms, web3ResponseToState } = require('../../../helper/ACTUS/tests');
const { deployContract, getSnapshotTaker } = require('../../../helper/setupTestEnvironment');


describe('TestCECPOF', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestPOF = await deployContract(buidlerRuntime, 'TestCECPOF');
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.CECTerms = await getDefaultTestTerms('CEC'); // TODO: create default test cases for CEC
  });

  /*
   * TEST POF_CEC_ST
   */
  it('Should yield a settlement payoff of 100005', async () => {
    const state = web3ResponseToState(await this.CECEngineInstance.methods.computeInitialState(this.CECTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state.exerciseAmount = web3.utils.toWei('100000');
    state.feeAccrued = web3.utils.toWei('5');

    const payoff = await this.TestPOF.methods._POF_CEC_ST(
      this.CECTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '100005000000000000000000');
  });
});
