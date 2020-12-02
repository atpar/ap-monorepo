/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');

const { getDefaultTestTerms, web3ResponseToState } = require('../../../helper/ACTUS/tests');
const { deployContract, getSnapshotTaker } = require('../../../helper/setupTestEnvironment');


describe('TestCEGPOF', () => {
  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    self.TestPOF = await deployContract(buidlerRuntime, 'TestCEGPOF');
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
    this.CEGTerms = await getDefaultTestTerms('CEG'); // TODO: create default test cases for CEG
  });

  /*
   * TEST POF_CEG_ST
   */
  it('Should yield a settlement payoff of 100005', async () => {
    const state = web3ResponseToState(await this.CEGEngineInstance.methods.computeInitialState(this.CEGTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    // used data
    state.exerciseAmount = web3.utils.toWei('100000');
    state.feeAccrued = web3.utils.toWei('5');

    const payoff = await this.TestPOF.methods._POF_CEG_ST(
      this.CEGTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '100005000000000000000000');
  });

  /*
  * TEST POF_CEG_PRD
  */
  // it('Should yield a purchase payoff of -100000', async () => {
  //   const state = await this.CEGEngineInstance.computeInitialState(this.CEGTerms);
  //   const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
  //   const scheduleTime = 6307200; // .2 years

  //   // used data
  //   this.CEGTerms.contractRole = 0; //RPA -> roleSign = 1
  //   this.CEGTerms.priceAtPurchaseDate = web3.utils.toWei('100000');

  //   const payoff = await this.TestPOF._POF_CEG_PRD(
  //     this.CEGTerms,
  //     state,
  //     scheduleTime,
  //     externalData
  //     );
  //   assert.strictEqual(payoff.toString(), '-100000000000000000000000');
  // });

  /*
    * TEST POF_CEG_FP
    */

  // feeBasis.A
  it('CEG fee basis A: should yield a fee of 5', async () => {
    const state = web3ResponseToState(await this.CEGEngineInstance.methods.computeInitialState(this.CEGTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 0;

    this.CEGTerms.feeBasis = 0; // FeeBasis.A
    this.CEGTerms.feeRate = web3.utils.toWei('5'); // set fixed fee
    this.CEGTerms.contractRole = 0; //RPA -> roleSign = 1

    const payoff = await this.TestPOF.methods._POF_CEG_FP(
      this.CEGTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '5000000000000000000');
  });

  // feeBasis.N
  it('CEG fee basis N: should yield a fee of 10100', async () => {
    const state = web3ResponseToState(await this.CEGEngineInstance.methods.computeInitialState(this.CEGTerms).call());
    const externalData = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const scheduleTime = 6307200; // .2 years

    this.CEGTerms.feeBasis = 1; // FeeBasis.N
    this.CEGTerms.businessDayConvention = 0; // NULL
    this.CEGTerms.calendar = 0; // NoCalendar
    this.CEGTerms.dayCountConvention = 2; // A_365
    this.CEGTerms.maturityDate = 31536000; // 1 year
    this.CEGTerms.feeRate = web3.utils.toWei('.05'); // set fee rate

    state.feeAccrued = web3.utils.toWei('100');
    state.statusDate = '0';
    state.notionalPrincipal = web3.utils.toWei('1000000');

    const payoff = await this.TestPOF.methods._POF_CEG_FP(
      this.CEGTerms,
      state,
      scheduleTime,
      externalData
    ).call();

    assert.strictEqual(payoff.toString(), '10100000000000000000000');
  });
});
