/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const BigNumber = require('bignumber.js');

const { getSnapshotTaker, getDefaultTerms, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain')
const { decodeEvent } = require('../../../helper/utils/schedule');
const { generateSchedule, ZERO_ADDRESS, ZERO_BYTES32 } = require('../../../helper/utils/utils');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');


describe('CECActor', () => {

  let actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  const getEventTime = async (_event, terms) => {
    return Number(await this.PAMEngineInstance.methods.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ).call());
  }

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [
      /*deployer*/, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary
    ] = self.accounts;

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    self.terms = {
      ...await getDefaultTerms('PAM'),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };

    // deploy test ERC20 token
    self.PaymentTokenInstance = await deployPaymentToken(
      buidlerRuntime,
      creatorObligor,
      [counterpartyBeneficiary]
    );
    // set address of payment token as currency in terms
    self.terms.currency = self.PaymentTokenInstance.options.address;
    self.terms.settlementCurrency = self.PaymentTokenInstance.options.address;

    self.schedule = await generateSchedule(self.PAMEngineInstance, self.terms);

    // issue underlying
    const tx = await self.PAMActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.PAMEngineInstance.options.address,
      ZERO_ADDRESS,
      ZERO_ADDRESS
    ).send({ from: actor });

    self.assetId = tx.events.InitializedAsset.returnValues.assetId;
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    await this.setupTestEnvironment();
  });

  it('should trigger collateral', async () => {
    const termsCEC = require('../../../helper/terms/CECTerms-collateral.json');
    termsCEC.maturityDate = this.terms.maturityDate;
    termsCEC.statusDate = this.terms.statusDate;
    // encode address of underlying in object of first contract reference
    termsCEC.contractReference_1.object = this.assetId;
    // workaround for solc bug (replace with bytes)
    termsCEC.contractReference_1.object2 = web3.utils.padLeft(this.PAMRegistryInstance.options.address, '64');
    // encode collateral token address and collateral amount (notionalPrincipal of underlying + some over-collateralization)
    const overCollateral = web3.utils.toWei('100');
    const collateralAmount = (new BigNumber(this.terms.notionalPrincipal)).plus(overCollateral).toFixed();
    // encode collateralToken and collateralAmount in object of second contract reference
    termsCEC.contractReference_2.object = await this.CECActorInstance.methods.encodeCollateralAsObject(
      this.PaymentTokenInstance.options.address,
      collateralAmount
    ).call();

    const scheduleCEC = await generateSchedule(this.CECEngineInstance, termsCEC);

    // counterparty has to set allowance == collateralAmount for custodian contract
    await this.PaymentTokenInstance.methods.approve(this.CustodianInstance.options.address, collateralAmount)
      .send({ from: counterpartyBeneficiary });

    // issue collateral enhancement
    const { events } = await this.CECActorInstance.methods.initialize(
      termsCEC,
      scheduleCEC,
      this.CECEngineInstance.options.address,
      ZERO_ADDRESS,
      ZERO_ADDRESS,
      this.CustodianInstance.options.address,
      this.PAMRegistryInstance.options.address
    ).send({ from: actor });

    const cecAssetId = events.InitializedAsset.returnValues.assetId;

    // counterparty should have paid collateral
    assert.strictEqual(
      (await this.PaymentTokenInstance.methods.balanceOf(counterpartyBeneficiary).call()),
      (new BigNumber(web3.utils.toWei('10000')).minus(new BigNumber(collateralAmount))).toFixed()
    );
    // custodian should have received collateral
    assert.strictEqual(
      (await this.PaymentTokenInstance.methods.balanceOf(this.CustodianInstance.options.address).call()),
      collateralAmount
    );

    // settle IED
    const iedEvent = await this.PAMRegistryInstance.methods.getNextScheduledEvent(this.assetId).call();
    const iedPayoff = await this.PAMEngineInstance.methods.computePayoffForEvent(
      this.terms,
      await this.PAMRegistryInstance.methods.getState(this.assetId).call(),
      iedEvent,
      ZERO_BYTES32
    ).call();

    // progress to schedule time of IED
    await mineBlock(Number(await getEventTime(iedEvent, this.terms)));
    await this.PaymentTokenInstance.methods.approve(this.PAMActorInstance.options.address, iedPayoff)
      .send({ from: creatorObligor });
    await this.PAMActorInstance.methods.progress(this.assetId)
      .send(this.txOpts);
    assert.strictEqual(Number(decodeEvent(iedEvent).eventType), eventIndex('IED'));

    // progress to schedule time of first IP (payoff == 0)
    const ipEvent_1 = await this.PAMRegistryInstance.methods.getNextScheduledEvent(this.assetId).call();
    await mineBlock(Number(await getEventTime(ipEvent_1, this.terms)));
    await this.PAMActorInstance.methods.progress(this.assetId)
      .send(this.txOpts);
    assert.strictEqual(Number(decodeEvent(ipEvent_1).eventType), eventIndex('IP'));

    // progress to post-grace period of IP
    const ipEvent_2 = await this.PAMRegistryInstance.methods.getNextScheduledEvent(this.assetId).call();
    await mineBlock(Number(await getEventTime(ipEvent_2, this.terms)) + 10000000);
    await this.PAMActorInstance.methods.progress(this.assetId)
      .send(this.txOpts);
    assert.strictEqual(Number(decodeEvent(ipEvent_2).eventType), eventIndex('IP'));

    // progress collateral enhancement
    const xdEvent = await this.CECRegistryInstance.methods
      .getNextUnderlyingEvent(web3.utils.toHex(cecAssetId)).call();
    await mineBlock(Number(await getEventTime(xdEvent, termsCEC)));
    await this.CECActorInstance.methods.progress(web3.utils.toHex(cecAssetId))
      .send(this.txOpts);
    assert.strictEqual(Number(decodeEvent(xdEvent).eventType), eventIndex('EXE'));

    // progress collateral enhancement
    const stdEvent = await this.CECRegistryInstance.methods
      .getNextUnderlyingEvent(web3.utils.toHex(cecAssetId)).call();
    await mineBlock(Number(await getEventTime(stdEvent, termsCEC)));
    await this.CECActorInstance.methods.progress(web3.utils.toHex(cecAssetId))
      .send(this.txOpts);
    assert.strictEqual(Number(decodeEvent(stdEvent).eventType), eventIndex('ST'));
    
    // creator should have received seized collateral from custodian
    assert.strictEqual(
      (await this.PaymentTokenInstance.methods.balanceOf(creatorBeneficiary).call()),
      String(this.terms.notionalPrincipal)
    );
    // custodian should have not executed amount (overcollateral) left
    assert.strictEqual(
      (await this.PaymentTokenInstance.methods.balanceOf(this.CustodianInstance.options.address).call()),
      overCollateral
    );

    // should return not executed amount to the counterparty (collateralizer)
    await this.CustodianInstance.methods.returnCollateral(cecAssetId)
      .send(this.txOpts);

    // custodian should have nothing left
    assert.strictEqual(
      (await this.PaymentTokenInstance.methods.balanceOf(this.CustodianInstance.options.address).call()),
      '0'
    );
    // counterparty (collateralizer) should have received not executed amount (overcollateral)
    assert.strictEqual(
      (await this.PaymentTokenInstance.methods.balanceOf(counterpartyBeneficiary).call()),
      web3.utils.toWei('10000')
    );
  });
});
