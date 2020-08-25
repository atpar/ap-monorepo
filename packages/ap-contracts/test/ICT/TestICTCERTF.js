/* jslint node */
/* global before, beforeEach, contract, describe, it, web3 */
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const { BN } = require('openzeppelin-test-helpers');
// FIXME: use BN above (unneeded dependency)
const BigNumber = require('bignumber.js');

const { ZERO_ADDRESS, generateSchedule } = require('../helper/utils');
const { decodeEvent } = require('../helper/scheduleUtils');
const { getSnapshotTaker, deployICToken, deployPaymentToken } = require('../helper/setupTestEnvironment');
const { mineBlock } = require('../helper/blockchain');


describe('ICT', function () {
  let owner, issuer, counterparty, investor1;

  const computeEventTime = async (scheduleTime) => {
    return (await this.CERTFEngineInstance.methods.shiftEventTime(
      scheduleTime,
      this.terms.businessDayConvention,
      this.terms.calendar,
      this.terms.maturityDate
    ).call());
  };

  const computeCalcTime = async (scheduleTime) => {
    return (await this.CERTFEngineInstance.methods.shiftCalcTime(
      scheduleTime,
      this.terms.businessDayConvention,
      this.terms.calendar,
      this.terms.maturityDate
    ).call());
  };

  const encodeNumberAsBytes32 = (number) => {
    return web3.utils.padLeft(
      web3.utils.numberToHex(
        web3.utils.toWei(String(number))
      ),
      64
    );
  };

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(bre, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    // TODO: shift by one (make owner to accounts[1])
    [ owner, issuer, counterparty, investor1 ] = self.accounts;
    self.txOpts.from = owner;

    // deploy test ERC20 token
    self.PaymentTokenInstance = await deployPaymentToken(bre, issuer, [issuer]);

    self.terms = { ...require('./CERTF-Terms.json'), currency: self.PaymentTokenInstance.options.address };
    self.schedule = await generateSchedule(self.CERTFEngineInstance, self.terms, 1623456000);

    self.ict = await   deployICToken(bre, {
      assetRegistry: self.CERTFRegistryInstance.options.address,
      dataRegistry: self.DataRegistryInstance.options.address,
      marketObjectCode: self.terms.contractReference_2.object,
      deployer: owner,
    });

    // mint 100% of all ICTs to investor1
    await self.ict.methods.mint(issuer, web3.utils.toWei('2500'))
        .send(self.txOpts);
    await self.ict.methods.mint(investor1, web3.utils.toWei('5000'))
        .send(self.txOpts);

    self.ownership = {
      creatorObligor: issuer,
      creatorBeneficiary: self.ict.options.address,
      counterpartyObligor: issuer,
      counterpartyBeneficiary: issuer
    };

    const tx = await self.CERTFActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.CERTFEngineInstance.options.address,
      ZERO_ADDRESS
    ).send(self.txOpts);

    self.assetId = tx.events.InitializedAsset.returnValues.assetId;
    self.state = await self.CERTFRegistryInstance.methods.getState(web3.utils.toHex(self.assetId)).call();

    await self.ict.methods.setAssetId(web3.utils.toHex(self.assetId))
        .send(self.txOpts);

    await self.DataRegistryInstance.methods
        .setDataProvider(self.terms.contractReference_2.object, self.ict.options.address)
        .send(self.txOpts);
    await self.DataRegistryInstance.methods
        .setDataProvider(self.terms.contractReference_1.object, owner)
        .send(self.txOpts);

    await self.DataRegistryInstance.methods.publishDataPoint(
      self.terms.contractReference_1.object,
      self.terms.issueDate,
      encodeNumberAsBytes32(self.terms.nominalPrice)
    ).send(self.txOpts);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  // beforeEach(async () => {
  //   // console.error(`0-timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - beforeEach, before mine(1592438300)`)
  //   // await mineBlock('1592438300');
  //   // console.error(`0+timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - beforeEach,  after mine(1592438300)`)
  // });

  it('should process the IssueDate event', async () => {
    const idEvent = await this.CERTFRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { eventType, scheduleTime } = decodeEvent(idEvent);
    assert.equal(eventType, '1');

    // settle and progress asset state
    let debugVal = await computeEventTime(scheduleTime);
    console.error(`1 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it() before mine(${debugVal})`)
    await mineBlock(await computeEventTime(scheduleTime));
    console.error(`2 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it()  after mine(${debugVal})`)
    await this.CERTFActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send(this.txOpts);
  });

  it('should register investor1 for redemption for the first RFD event', async () => {
    const rfdEvent = this.schedule[1];
    const { eventType } = decodeEvent(rfdEvent);
    assert.equal(eventType, '23');

    const tokensToRedeem = web3.utils.toWei('1000');

    await this.ict.methods.createDepositForEvent(rfdEvent)
        .send(this.txOpts);
    await this.ict.methods.registerForRedemption(rfdEvent, tokensToRedeem)
        .send({ from: investor1 });

    const { scheduleTime: scheduleTimeXD } = decodeEvent(this.schedule[2]);

    const exerciseQuantity = (await this.DataRegistryInstance.methods.getDataPoint(
      this.terms.contractReference_2.object,
      await computeCalcTime(scheduleTimeXD)
    ).call())[0];

    const deposit = await this.ict.methods.getDeposit(rfdEvent).call();
    const totalSupply = await this.ict.methods.totalSupply().call();
    const ratioSignaled = (new BigNumber(deposit.totalAmountSignaled))
        .dividedBy(totalSupply).shiftedBy(18).decimalPlaces(0);
    const expectedExerciseQuantity = ratioSignaled.multipliedBy(this.terms.quantity).shiftedBy(-18).toFixed();

    assert.equal(exerciseQuantity, expectedExerciseQuantity);

    this.exerciseQuantity = exerciseQuantity;
  });

  it('should process the first RedemptionFixingDay event', async () => {
    const rfdEvent = await this.CERTFRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { eventType, scheduleTime } = decodeEvent(rfdEvent);
    assert.equal(eventType, '23');

    // const exerciseAmount = await this.DataRegistryInstance.methods.

    await this.DataRegistryInstance.methods.publishDataPoint(
      this.terms.contractReference_1.object,
      await computeCalcTime(scheduleTime),
      encodeNumberAsBytes32(this.terms.nominalPrice)
    );

    // settle and progress asset state
    let debugVal = await computeEventTime(scheduleTime);
    console.error(`3 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it() before mine(${debugVal})`)
    await mineBlock(await computeEventTime(scheduleTime));
    console.error(`4 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it() after  mine(${debugVal})`)
    let tx = await this.CERTFActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send(this.txOpts);
    let state = await this.CERTFRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    // exerciseAmount should equal to
  });

  it('should process the first ExecutionDate event', async () => {
    const xdEvent = await this.CERTFRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { eventType, scheduleTime } = decodeEvent(xdEvent);
    assert.equal(eventType, '26');

    // settle and progress asset state
    let debugVal = await computeEventTime(scheduleTime);
    console.error(`scheduleTime: ${scheduleTime}`);
    console.error(`5 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it() before mine(${debugVal})`)
    await mineBlock(await computeEventTime(scheduleTime));
    console.error(`6 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it() after  mine(${debugVal})'`)
    await this.CERTFActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send(this.txOpts);
  });

  it('should process the first RPD event', async () => {
    const rpdEvent = await this.CERTFRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { eventType, scheduleTime } = decodeEvent(rpdEvent);
    assert.equal(eventType, '24');

    // set allowance for CERTFActor
    await this.PaymentTokenInstance.methods.approve(
      this.CERTFActorInstance.options.address,
      (new BigNumber(this.terms.nominalPrice)).multipliedBy(this.terms.quantity).shiftedBy(-18).toFixed(),
    ).send({ from: issuer });

    // settle and progress asset state
    let debugVal = await computeEventTime(scheduleTime);
    console.error(`rpdEvent: ${JSON.stringify(decodeEvent(rpdEvent))}`);
    console.error(`7 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it() before mine(${debugVal})`)
    await mineBlock(await computeEventTime(scheduleTime));
    console.error(`8 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it()  after mine(${debugVal})`)
    let tx = await this.CERTFActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send(this.txOpts);
    await this.ict.methods.fetchDepositAmountForEvent(this.schedule[1])
        .send(this.txOpts);

    const deposit = await this.ict.methods.getDeposit(this.schedule[1])
        .call();

    // *** DEBUG: failing (AssertionError [ERR_ASSERTION]: '0' == '133333333333333333000000')
    assert.equal(
      deposit.amount,
      (new BigNumber(this.terms.nominalPrice)).multipliedBy(this.exerciseQuantity).shiftedBy(-18).toFixed()
    );
  });

  it('should withdraw the share for investor1', async () => {
    console.error(`9 timestamp: ${(await bre.web3.eth.getBlock('latest')).timestamp} - it() before claimDeposit(${this.schedule[1]})`)
    await this.ict.methods.claimDeposit(this.schedule[1])
        .send({ from: investor1 });

    const deposit = await this.ict.methods.getDeposit(this.schedule[1]).call();

    // *** DEBUG: failing (AssertionError [ERR_ASSERTION]: '0' == '133333333333333333000000')
    assert.equal(
      deposit.claimedAmount,
      (new BigNumber(this.terms.nominalPrice)).multipliedBy(this.exerciseQuantity).shiftedBy(-18).toFixed()
    );
  });
});
