/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const BigNumber = require('bignumber.js');

const { generateSchedule, expectEvent, ZERO_ADDRESS } = require('../helper/utils/utils');
const { decodeEvent } = require('../helper/utils/schedule');
const { mineBlock } = require('../helper/utils/blockchain');
const { deployICToken, deployPaymentToken, getSnapshotTaker } = require('../helper/setupTestEnvironment');
const { getEnumIndexForEventType: eventIndex } = require('../helper/utils/dictionary');


describe('ICT', function () {
  let deployer, owner, issuer, investor1;

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
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ deployer, /*actor*/, owner, issuer, investor1 ] = self.accounts;

    // deploy test ERC20 token
    self.PaymentTokenInstance = await deployPaymentToken(buidlerRuntime, issuer, [issuer]);

    self.terms = { ...require('./CERTF-Terms.json'), currency: self.PaymentTokenInstance.options.address };
    self.schedule = await generateSchedule(self.CERTFEngineInstance, self.terms, 1623456000);

    self.ict = await deployICToken(buidlerRuntime, {
      assetRegistry: self.CERTFRegistryInstance.options.address,
      dataRegistryProxy: self.DataRegistryProxyInstance.options.address,
      marketObjectCode: self.terms.contractReference_2.object,
      owner: owner,
      deployer: owner,
    });

    // mint 100% of all ICTs to investor1
    await self.ict.methods.mint(issuer, web3.utils.toWei('2500')).send({ from: owner });
    await self.ict.methods.mint(investor1, web3.utils.toWei('5000')).send({ from: owner });

    self.ownership = {
      creatorObligor: issuer,
      creatorBeneficiary: self.ict.options.address,
      counterpartyObligor: issuer,
      counterpartyBeneficiary: issuer
    };

    const { events } = await self.CERTFActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.CERTFEngineInstance.options.address,
      ZERO_ADDRESS,
      ZERO_ADDRESS
    ).send({ from: owner });
    expectEvent(events, 'InitializedAsset');

    self.assetId = events.InitializedAsset.returnValues.assetId;
    self.state = await self.CERTFRegistryInstance.methods.getState(
      web3.utils.toHex(self.assetId)
    ).call();

    await self.ict.methods.setAssetId(web3.utils.toHex(self.assetId)).send({ from: owner });

    await self.DataRegistryProxyInstance.methods.setDataProvider(
      self.terms.contractReference_2.object,
      self.ict.options.address
    ).send({ from: deployer });
    await self.DataRegistryProxyInstance.methods.setDataProvider(
      self.terms.contractReference_1.object,
      owner
    ).send({ from: deployer });

    await self.DataRegistryProxyInstance.methods.publishDataPoint(
      self.terms.contractReference_1.object,
      self.terms.issueDate,
      encodeNumberAsBytes32(self.terms.nominalPrice)
    ).send({ from: owner });
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should process the IssueDate event', async () => {
    const idEvent = await this.CERTFRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();
    const { eventType, scheduleTime } = decodeEvent(idEvent);
    assert.strictEqual(eventType, `${eventIndex('ISS')}`);

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));
    const { events } = await this.CERTFActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: owner });
    expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('ISS')}` });
  });

  it('should register investor1 for redemption for the first REF event [ @skip-on-coverage ]', async () => {
    const rfdEvent = this.schedule[1];
    const { eventType } = decodeEvent(rfdEvent);
    assert.strictEqual(eventType, `${eventIndex('REF')}`);

    const tokensToRedeem = web3.utils.toWei('1000');

    await this.ict.methods.createDepositForEvent(rfdEvent).send({ from: owner });
    await this.ict.methods.registerForRedemption(rfdEvent, tokensToRedeem).send({ from: investor1 });

    const { scheduleTime: scheduleTimeXD } = decodeEvent(this.schedule[2]);

    const exerciseQuantity = (await this.DataRegistryProxyInstance.methods.getDataPoint(
      this.terms.contractReference_2.object,
      await computeCalcTime(scheduleTimeXD)
    ).call())[0];

    const deposit = await this.ict.methods.getDeposit(rfdEvent).call();
    const totalSupply = await this.ict.methods.totalSupply().call();
    const ratioSignaled = (new BigNumber(deposit.totalAmountSignaled))
      .dividedBy(totalSupply).shiftedBy(18).decimalPlaces(0);
    const expectedExerciseQuantity = ratioSignaled.multipliedBy(this.terms.quantity).shiftedBy(-18).toFixed();

    assert.strictEqual(exerciseQuantity, expectedExerciseQuantity);

    this.exerciseQuantity = exerciseQuantity;
  });

  it('should process the first RedemptionFixingDay event', async () => {
    const rfdEvent = await this.CERTFRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();
    const { eventType, scheduleTime } = decodeEvent(rfdEvent);
    assert.strictEqual(eventType, `${eventIndex('REF')}`);

    await this.DataRegistryProxyInstance.methods.publishDataPoint(
      this.terms.contractReference_1.object,
      await computeCalcTime(scheduleTime),
      encodeNumberAsBytes32(this.terms.nominalPrice)
    ).send({ from: owner });

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));
    const { events } = await this.CERTFActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: owner });
    expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('REF')}` });
    await this.CERTFRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
  });

  it('should process the first ExecutionDate event', async () => {
    const xdEvent = await this.CERTFRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const { eventType, scheduleTime } = decodeEvent(xdEvent);
    assert.strictEqual(eventType, `${eventIndex('EXE')}`);

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));
    const { events } = await this.CERTFActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: owner });
    expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('EXE')}` });
  });

  it('should process the first REP event [ @skip-on-coverage ]', async () => {
    const rpdEvent = await this.CERTFRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();
    const { eventType, scheduleTime } = decodeEvent(rpdEvent);
    assert.strictEqual(eventType, `${eventIndex('REP')}`);

    // set allowance for CERTFActor
    await this.PaymentTokenInstance.methods.approve(
      this.CERTFActorInstance.options.address,
      (new BigNumber(this.terms.nominalPrice)).multipliedBy(this.terms.quantity).shiftedBy(-18).toFixed(),
    ).send({ from: issuer });

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));
    const { events } = await this.CERTFActorInstance.methods.progress(web3.utils.toHex(
      this.assetId)
    ).send({ from: owner });
    expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('REP')}` });
    await this.ict.methods.fetchDepositAmountForEvent(this.schedule[1]).send({ from: owner });

    const deposit = await this.ict.methods.getDeposit(this.schedule[1]).call();

    assert.strictEqual(
      deposit.amount,
      (new BigNumber(this.terms.nominalPrice)).multipliedBy(this.exerciseQuantity).shiftedBy(-18).toFixed()
    );
  });

  it('should withdraw the share for investor1 [ @skip-on-coverage ]', async () => {
    await this.ict.methods.claimDeposit(this.schedule[1]).send({ from: investor1 });

    const deposit = await this.ict.methods.getDeposit(this.schedule[1]).call();

    assert.strictEqual(
      deposit.claimedAmount,
      (new BigNumber(this.terms.nominalPrice)).multipliedBy(this.exerciseQuantity).shiftedBy(-18).toFixed()
    );
  });
});
