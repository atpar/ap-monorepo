/* global before, beforeEach, contract, describe, it, web3 */
const { BN, ether, expectEvent, shouldFail } = require('openzeppelin-test-helpers');

const ICToken = artifacts.require('ICT');

const { ZERO_ADDRESS, generateSchedule } = require('../helper/utils');
const { decodeEvent } = require('../helper/scheduleUtils');
const { setupTestEnvironment, deployPaymentToken } = require('../helper/setupTestEnvironment');
const { mineBlock } = require('../helper/blockchain');


contract('ICT', function (accounts) {
  const [owner, issuer, counterparty, investor1] = accounts;

  const computeEventTime = async (scheduleTime) => {
    return (await this.CERTFEngineInstance.shiftEventTime(
      scheduleTime,
      this.terms.businessDayConvention,
      this.terms.calendar,
      this.terms.maturityDate
    )).toString();
  };

  const computeCalcTime = async (scheduleTime) => {
    return (await this.CERTFEngineInstance.shiftCalcTime(
      scheduleTime,
      this.terms.businessDayConvention,
      this.terms.calendar,
      this.terms.maturityDate
    )).toString();
  };

  const encodeNumberAsBytes32 = (number) => {
    return web3.utils.padLeft(
      web3.utils.numberToHex(
        web3.utils.toWei(String(number))
      ),
      64
    );
  };

  before(async () => {
    this.instances =  await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(issuer, [issuer]);

    this.terms = { ...require('./CERTF-TERMS.json'), currency: this.PaymentTokenInstance.address };
    this.schedule = await generateSchedule(this.CERTFEngineInstance, this.terms, 1623456000);

    this.ict = await ICToken.new(
      this.CERTFRegistryInstance.address,
      this.DataRegistryInstance.address,
      this.terms.contractReference_2.object
    );

    // mint 50% of all ICTs to investor1
    await this.ict.mint(issuer, web3.utils.toWei('1000')); 
    await this.ict.mint(investor1, web3.utils.toWei('1000'));

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

    await this.DataRegistryInstance.setDataProvider(this.terms.contractReference_2.object, this.ict.address);
    await this.DataRegistryInstance.setDataProvider(this.terms.contractReference_1.object, owner);

    await DataRegistryInstance.publishDataPoint(
      this.terms.contractReference_1.object,
      this.terms.issueDate,
      encodeNumberAsBytes32(this.terms.nominalPrice)
    );
  });
  
  it('should process the IssueDate event', async () => {
    const idEvent = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { eventType, scheduleTime } = decodeEvent(idEvent);
    assert.equal(eventType, '1');

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));
    await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
  });

  it('should register investor1 for redemption for the first XD event', async () => {
    const xdEvent = this.schedule[2];
    const { eventType, scheduleTime } = decodeEvent(xdEvent);
    assert.equal(eventType, '26');
   
    const tokensToRedeem = web3.utils.toWei('1000');

    await this.ict.createDepositForEvent(xdEvent); 
    await this.ict.registerForRedemption(xdEvent, tokensToRedeem);

    const quantity = (await this.DataRegistryInstance.getDataPoint(
      this.terms.contractReference_2.object,
      await computeCalcTime(scheduleTime)
    ))[0].toString();

    assert.equal(quantity, tokensToRedeem);
  });

  it('should process the first RedemptionFixingDay event', async () => {
    const rfdEvent = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { eventType, scheduleTime } = decodeEvent(rfdEvent);
    assert.equal(eventType, '23');

    await DataRegistryInstance.publishDataPoint(
      this.terms.contractReference_1.object,
      await computeCalcTime(scheduleTime),
      encodeNumberAsBytes32(this.terms.nominalPrice)
    );

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));
    await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
  });

  it('should process the first ExecutionDate event', async () => {
    const xdEvent = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { eventType, scheduleTime } = decodeEvent(xdEvent);
    assert.equal(eventType, '26');

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));
    await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
  });

    it('should process the first RPD event', async () => {
    const rpdEvent = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { eventType, scheduleTime } = decodeEvent(rpdEvent);
    assert.equal(eventType, '24');

    // set allowance for CERTFActor
    await this.PaymentTokenInstance.approve(
      this.CERTFActorInstance.address,
      web3.utils.toWei('1000000'),
      { from: issuer }
    );

    // settle and progress asset state
    await mineBlock(await computeEventTime(scheduleTime));
    await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
    await this.ict.fetchDepositAmountForEvent(this.schedule[2]);

    // console.log(await this.ict.getDeposit(this.schedule[2]));
  });
});
