const BigNumber = require('bignumber.js');

const { setupTestEnvironment, getDefaultTerms, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../../../helper/blockchain')
const { decodeEvent } = require('../../../helper/scheduleUtils');
const { generateSchedule, ZERO_ADDRESS, ZERO_BYTES32, ZERO_BYTES } = require('../../../helper/utils');


contract('CECActor', (accounts) => {

  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;

  const getEventTime = async (_event, terms) => {
    return Number(await this.PAMEngineInstance.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ));
  }

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = { 
      ...await getDefaultTerms("CEC"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(creatorObligor, [counterpartyBeneficiary]);
    // set address of payment token as currency in terms
    this.terms.currency = this.PaymentTokenInstance.address;
    this.terms.settlementCurrency = this.PaymentTokenInstance.address;
    this.terms.statusDate = this.terms.contractDealDate;

    this.schedule = await generateSchedule(this.PAMEngineInstance, this.terms);

    // issue underlying
    const tx = await this.PAMActorInstance.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.PAMEngineInstance.address,
      ZERO_ADDRESS
    );  
    
    this.assetId = tx.logs[0].args.assetId;

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should trigger collateral', async () => {
    const ownershipCEC = {
      creatorObligor: ZERO_ADDRESS,
      creatorBeneficiary: ZERO_ADDRESS,
      counterpartyObligor: ZERO_ADDRESS,
      counterpartyBeneficiary: ZERO_ADDRESS
    };
    const termsCEC = require('../../../helper/terms/CECTerms-collateral.json');
    termsCEC.maturityDate = this.terms.maturityDate;
    termsCEC.statusDate = this.terms.statusDate;
    // encode address of underlying in object of first contract reference
    termsCEC.contractReference_1.object = this.assetId;
    // encode collateral token address and collateral amount (notionalPrincipal of underlying + some over-collateralization)
    const overCollateral = web3.utils.toWei('100').toString();
    const collateralAmount = (new BigNumber(this.terms.notionalPrincipal)).plus(overCollateral);
    // encode collateralToken and collateralAmount in object of second contract reference
    termsCEC.contractReference_2.object = await this.CECActorInstance.encodeCollateralAsObject(
      this.PaymentTokenInstance.address,
      collateralAmount
    );
  
    const scheduleCEC = await generateSchedule(this.CECEngineInstance, termsCEC);

    // counterparty has to set allowance == collateralAmount for custodian contract
    await this.PaymentTokenInstance.approve(this.CustodianInstance.address, collateralAmount, { from: counterpartyBeneficiary });

    // issue collateral enhancement
    const txCEC = await this.CECActorInstance.initialize(
      termsCEC,
      scheduleCEC,
      this.CECEngineInstance.address,
      ZERO_ADDRESS,
      this.CustodianInstance.address,
      this.PAMRegistryInstance.address
    );

    const cecAssetId = txCEC.logs[0].args.assetId;

    // counterparty should have paid collateral
    assert.equal(
      (await this.PaymentTokenInstance.balanceOf(counterpartyBeneficiary)).toString(),
      (new BigNumber(web3.utils.toWei('5000')).minus(collateralAmount)).toFixed()
    );
    // custodian should have received collateral
    assert.equal(
      (await this.PaymentTokenInstance.balanceOf(this.CustodianInstance.address)).toString(),
      collateralAmount.toFixed()
    );

    // settle IED
    const iedEvent = await this.PAMRegistryInstance.getNextScheduledEvent(this.assetId);
    const iedPayoff = await this.PAMEngineInstance.computePayoffForEvent(
      this.terms,
      await this.PAMRegistryInstance.getState(this.assetId),
      iedEvent,
      ZERO_BYTES32
    );

    // progress to schedule time of IED
    await mineBlock(Number(await getEventTime(iedEvent, this.terms)));
    await this.PaymentTokenInstance.approve(this.PAMActorInstance.address, iedPayoff, { from: creatorObligor });
    await this.PAMActorInstance.progress(this.assetId);
    assert.equal(Number(decodeEvent(iedEvent).eventType), 1);

    // progress to schedule time of first IP (payoff == 0)
    const ipEvent_1 = await this.PAMRegistryInstance.getNextScheduledEvent(this.assetId);
    await mineBlock(Number(await getEventTime(ipEvent_1, this.terms)));
    await this.PAMActorInstance.progress(this.assetId);
    assert.equal(Number(decodeEvent(ipEvent_1).eventType), 8);

    // progress to post-grace period of IP
    const ipEvent_2 = await this.PAMRegistryInstance.getNextScheduledEvent(this.assetId);
    await mineBlock(Number(await getEventTime(ipEvent_2, this.terms)) + 10000000);
    await this.PAMActorInstance.progress(this.assetId);
    assert.equal(Number(decodeEvent(ipEvent_2).eventType), 8);

    // progress collateral enhancement
    const xdEvent = await this.PAMRegistryInstance.getNextUnderlyingEvent(web3.utils.toHex(cecAssetId));
    await mineBlock(Number(await getEventTime(xdEvent, termsCEC)));
    await this.CECActorInstance.progress(web3.utils.toHex(cecAssetId));
    assert.equal(Number(decodeEvent(xdEvent).eventType), 20);

    // progress collateral enhancement
    const stdEvent = await this.PAMRegistryInstance.getNextUnderlyingEvent(web3.utils.toHex(cecAssetId));
    await mineBlock(Number(await getEventTime(stdEvent, termsCEC)));
    await this.CECActorInstance.progress(web3.utils.toHex(cecAssetId));
    assert.equal(Number(decodeEvent(stdEvent).eventType), 21);

    // creator should have received seized collateral from custodian
    assert.equal(
      (await this.PaymentTokenInstance.balanceOf(creatorBeneficiary)).toString(),
      String(this.terms.notionalPrincipal)
    );
    // custodian should have not executed amount (overcollateral) left
    assert.equal(
      (await this.PaymentTokenInstance.balanceOf(this.CustodianInstance.address)).toString(),
      overCollateral.toString()
    );

    // should return not executed amount to the counterparty (collateralizer)
    await this.CustodianInstance.returnCollateral(cecAssetId);

    // custodian should have nothing left
    assert.equal(
      (await this.PaymentTokenInstance.balanceOf(this.CustodianInstance.address)).toString(),
      '0'
    );
    // counterparty (collateralizer) should have received not executed amount (overcollateral)
    assert.equal(
      (await this.PaymentTokenInstance.balanceOf(counterpartyBeneficiary)).toString(),
      web3.utils.toWei('5000')
    );
  });
});
