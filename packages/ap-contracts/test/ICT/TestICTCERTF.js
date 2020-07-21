/* global before, beforeEach, contract, describe, it, web3 */
const { BN, ether, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const ICToken = artifacts.require('ICT');

const { ZERO_ADDRESS, generateSchedule } = require('../helper/utils');
const { decodeEvent } = require('../helper/scheduleUtils');
const { setupTestEnvironment, deployPaymentToken } = require('../helper/setupTestEnvironment');
const { mineBlock } = require('../helper/blockchain');


contract('ICT', function (accounts) {
  const [owner, issuer, counterparty, investor1] = accounts;

  const computeEventTime = async (event) => {
    return (await this.CERTFEngineInstance.computeEventTimeForEvent(
      event,
      this.terms.businessDayConvention,
      this.terms.calendar,
      this.terms.maturityDate
    )).toString();
  };

  before(async () => {
    this.instances =  await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.quantityMOC = web3.utils.toHex('QUANTITY');

    this.ict = await ICToken.new(
      this.CERTFRegistryInstance.address,
      this.DataRegistryInstance.address,
      this.quantityMOC
    );

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(issuer, [issuer]);

    // mint 50% of all ICTs to investor1
    await this.ict.mint(issuer, web3.utils.toWei('1000')); 
    await this.ict.mint(investor1, web3.utils.toWei('1000'));

    this.terms = { ...require('./CERTF-TERMS.json'), currency: this.PaymentTokenInstance.address };
    this.schedule = await generateSchedule(this.CERTFEngineInstance, this.terms, 1623456000);
    this.ownership = {
      creatorObligor: issuer, 
      creatorBeneficiary: ict.address, 
      counterpartyObligor: issuer, 
      counterpartyBeneficiary: issuer
    };

    const tx = await this.CERTFActorInstance.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.CERTFEngineInstance.address,
      ZERO_ADDRESS
    );

    this.assetId = tx.logs[0].args.assetId;
    this.state = await this.CERTFRegistryInstance.getState(web3.utils.toHex(this.assetId));

    await this.ict.setAssetId(web3.utils.toHex(this.assetId));

    await this.DataRegistryInstance.setDataProvider(this.quantityMOC, this.ict.address);
    await this.DataRegistryInstance.setDataProvider(this.terms.contractReference_1.object, owner);

    await DataRegistryInstance.publishDataPoint(
      this.terms.contractReference_1.object,
      this.terms.nominalPrice,
      this.terms.issueDate
    );
  });
  
  it('should process the IssueDate event', async () => {
    const idEvent = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { eventType, scheduleTime } = decodeEvent(idEvent);
    assert.equal(eventType, '1');

    // // set allowance for Payment Router
    // await this.PaymentTokenInstance.approve(
    //   this.CERTFActorInstance.address,
    //   this.terms.,
    //   { from: issuer }
    // );

    // settle and progress asset state
    await mineBlock(await computeEventTime(idEvent));

    await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
  });

  it('should register investor1 for redemption for the first RPD event', async () => {
    const rpdEvent = this.schedule[3];
    const { eventType, scheduleTime } = decodeEvent(rpdEvent);
    assert.equal(eventType, '24');
   
    const tokensToRedeem = web3.utils.toWei('1000');

    await this.ict.createDepositForEvent(rpdEvent); 
    await this.ict.registerForRedemption(rpdEvent, tokensToRedeem);

    const quantity = (await this.DataRegistryInstance.getDataPoint(
      this.quantityMOC,
      await computeEventTime(rpdEvent)
    ))[0].toString();
    
    assert.equal(quantity, tokensToRedeem);
  });

  it('should process the first RedemptionFixingDay event', async () => {
    const rfdEvent = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { eventType, scheduleTime } = decodeEvent(rfdEvent);
    assert.equal(eventType, '23');

    await DataRegistryInstance.publishDataPoint(
      this.terms.contractReference_1.object,
      this.terms.nominalPrice,
      await computeEventTime(rfdEvent)
    );

    // settle and progress asset state
    await mineBlock(await computeEventTime(rfdEvent));
    await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
  });

  it('should process the first ExecutionDate event', async () => {
    const xdEvent = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { eventType} = decodeEvent(xdEvent);
    assert.equal(eventType, '26');

    // settle and progress asset state
    await mineBlock(await computeEventTime(xdEvent));
    await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
  });

    it('should process the first RPD event', async () => {
    const rpdEvent = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { eventType} = decodeEvent(rpdEvent);
    assert.equal(eventType, '24');

    // settle and progress asset state
    await mineBlock(await computeEventTime(rpdEvent));
    const tx = await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
    await this.ict.fetchDepositAmountForEvent(rpdEvent);

    console.log(tx.logs[0]);
    // console.log(await this.ict.getDeposit(rpdEvent));
  });
});
