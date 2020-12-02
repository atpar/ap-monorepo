/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const BigNumber = require('bignumber.js');

const { generateSchedule, expectEvent, ZERO_ADDRESS } = require('../helper/utils/utils');
const { decodeEvent } = require('../helper/utils/schedule');
const { mineBlock } = require('../helper/utils/blockchain');
const { deployPaymentToken, getSnapshotTaker, deployContract } = require('../helper/setupTestEnvironment');
const { getEnumIndexForEventType: eventIndex } = require('../helper/utils/dictionary');


describe('Collateral', function () {
  let deployer, owner, lender, debtor;

  const computeEventTime = async (scheduleTime) => {
    return (await this.COLLAEngineInstance.methods.shiftEventTime(
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

    [ deployer, /*actor*/, owner, lender, debtor, dataProvider ] = self.accounts;

    self.marketObjectCodeOfCollateral = web3.utils.toHex('ETHUSD');

    // deploy test ERC20 token
    self.PaymentTokenInstance = await deployPaymentToken(buidlerRuntime, lender, [lender, debtor]);
    self.CollateralTokenInstance = await deployPaymentToken(buidlerRuntime, lender, [lender, debtor]);

    self.OpenOracleInstance = await deployContract(buidlerRuntime, 'OpenOracleMock');
    self.OpenOracleProxyInstance = await deployContract(
      buidlerRuntime,
      'OpenOracleProxy',
      [self.OpenOracleInstance.options.address, dataProvider]
    );
    self.CollateralInstance = await deployContract(buidlerRuntime, 'Collateral', [
      self.COLLARegistryInstance.options.address,
      self.OpenOracleProxyInstance.options.address
    ]);

    self.terms = {
      ...require('./COLLA-Terms.json'),
      marketObjectCodeOfCollateral: self.marketObjectCodeOfCollateral,
      currency: self.PaymentTokenInstance.options.address,
      // collateralCurrency: self.PaymentTokenInstance.options.address
      collateralCurrency: self.CollateralTokenInstance.options.address
    };

    self.ownership = {
      creatorObligor: lender,
      creatorBeneficiary: lender,
      counterpartyObligor: debtor,
      counterpartyBeneficiary: debtor
    };

    const { events } = await self.COLLAActorInstance.methods.initialize(
      self.terms,
      [],
      self.ownership,
      self.COLLAEngineInstance.options.address,
      ZERO_ADDRESS,
      self.CollateralInstance.options.address
    ).send({ from: owner });
    expectEvent(events, 'InitializedAsset');

    self.assetId = events.InitializedAsset.returnValues.assetId;
    self.state = await self.COLLARegistryInstance.methods.getState(
      web3.utils.toHex(self.assetId)
    ).call();

    // assuming initially 1 CollateralToken equals 1 PaymentToken
    self.collateralAmount = new BigNumber(this.terms.notionalPrincipal).multipliedBy(1.6).toFixed();
    
    await self.OpenOracleInstance.methods.set(
      dataProvider,
      web3.utils.toAscii(self.terms.marketObjectCodeOfCollateral),
      new BigNumber(1).shiftedBy(18).toFixed(),
      (await web3.eth.getBlock('latest')).timestamp
    ).send({ from: dataProvider });
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should lock the debtors collateral', async () => {
    await this.CollateralTokenInstance.methods.approve(this.CollateralInstance.options.address, this.collateralAmount).send({ from: debtor });
    await this.CollateralInstance.methods.addCollateral(this.assetId, new BigNumber(this.collateralAmount).dividedBy(2).toFixed()).send({ from: debtor });
    await this.CollateralInstance.methods.addCollateral(this.assetId, new BigNumber(this.collateralAmount).dividedBy(2).toFixed()).send({ from: debtor });
    const minCollateralAmount = await this.CollateralInstance.methods.computeMinCollateralAmount(this.assetId).call();
    assert.strictEqual(new BigNumber(this.collateralAmount).isGreaterThan(minCollateralAmount), true);
  });

  it('should process the Initial Exchange Date event', async () => {
    const iedEvent = await this.COLLARegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();
    const { eventType, scheduleTime } = decodeEvent(iedEvent);
    assert.strictEqual(eventType, `${eventIndex('IED')}`);

    await this.PaymentTokenInstance.methods.approve(this.COLLAActorInstance.options.address, this.terms.notionalPrincipal).send({ from: lender });

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));

    const { events } = await this.COLLAActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: owner });
    expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('IED')}` });
  });

  it('should process the first Interest Payment event', async () => {
    const iedEvent = await this.COLLARegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();
    const { eventType, scheduleTime } = decodeEvent(iedEvent);
    assert.strictEqual(eventType, `${eventIndex('IP')}`);

    await this.PaymentTokenInstance.methods.approve(this.COLLAActorInstance.options.address, this.terms.notionalPrincipal).send({ from: debtor });

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));

    const { events } = await this.COLLAActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: owner });
    expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('IP')}` });
  });

  it('should set lower exchange rate and fall below the collateralization ratio', async () => {
    await this.OpenOracleInstance.methods.set(
      dataProvider,
      web3.utils.toAscii(this.terms.marketObjectCodeOfCollateral),
      new BigNumber(1.1).shiftedBy(18).toFixed(),
      (await web3.eth.getBlock('latest')).timestamp
    ).send({ from: owner });

    const minCollateralAmount = await this.CollateralInstance.methods.computeMinCollateralAmount(this.assetId).call();
    assert.strictEqual(new BigNumber(this.collateralAmount).isLessThan(minCollateralAmount), true);
    const isUndercollateralized = await this.CollateralInstance.methods.isUndercollateralized(this.assetId).call();
    assert.strictEqual(isUndercollateralized, true);
  });

  it('should process the EXE event generated by the Collateral Extension', async () => {
    // settle and progress asset state
    const { events } = await this.COLLAActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: owner });
    expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('EXE')}` });
  });

  it('should claim the collateral for the lender', async () => {
    await this.CollateralInstance.methods.claimCollateral(this.assetId).send({ from: lender });
  });
});
