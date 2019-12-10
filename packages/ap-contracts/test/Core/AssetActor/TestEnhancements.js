const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { setupTestEnvironment, getDefaultTerms, convertDatesToOffsets, parseTermsToProductTerms, parseTermsToCustomTerms } = require('../../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../../helper/blockchain')
const {
  getDefaultOrderDataWithEnhancement,
  getUnfilledOrderDataAsTypedData,
  getFilledOrderDataAsTypedData,
  sign,
  getAssetIdFromOrderData,
  deriveProductId
} = require('../../helper/orderUtils');

const CECCollateralTerms = require('../../helper/terms/cec-collateral-terms.json');

const ERC20SampleToken = artifacts.require('ERC20SampleToken');



contract('AssetActor', (accounts) => {

  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;
  let snapshot_asset;

  const getEventTime = async (_event, lifecycleTerms) => {
    return Number(await this.PAMEngineInstance.computeEventTimeForEvent(_event, lifecycleTerms));
  }

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.underylingAssetId = 'C123';
    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = { 
      ...await getDefaultTerms(),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };
    // deploy test ERC20 token
    this.PaymentTokenInstance = await ERC20SampleToken.new({ from: creatorObligor });
    this.PaymentTokenInstance.transfer(counterpartyBeneficiary, web3.utils.toWei('5000'), { from: creatorObligor });

    // set address of payment token as currency in terms
    this.terms.currency = this.PaymentTokenInstance.address;
    this.terms.statusDate = this.terms.contractDealDate;
    // derive LifecycleTerms, GeneratingTerms, ProductTerms and CustomTerms
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
    const generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(this.terms));
    const productTerms = parseTermsToProductTerms(this.terms);
    this.customTerms = parseTermsToCustomTerms(this.terms);
    // // compute the initial state
    // const state = await this.PAMEngineInstance.computeInitialState(lifecycleTerms);
    // compute schedules for asset
    const productSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
    };
    // register new product
    this.productId = deriveProductId(productTerms, productSchedules);
    await this.ProductRegistryInstance.registerProduct(productTerms, productSchedules);

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should trigger collateral', async () => {
    const ownershipCEC = {
      creatorObligor: '0x0000000000000000000000000000000000000000',
      creatorBeneficiary: '0x0000000000000000000000000000000000000000',
      counterpartyObligor: '0x0000000000000000000000000000000000000000',
      counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
    };
    const termsCEC = { ...CECCollateralTerms, maturityDate: this.terms.maturityDate };
    // encode collateral token address and collateral amount (notionalPrincipal of underlying + some over-collateralization)
    const overCollateral = web3.utils.toWei('100').toString();
    const collateralAmount = (new BigNumber(this.customTerms.notionalPrincipal)).plus(overCollateral);
    // encode collateralToken and collateralAmount in object of second contract reference
    termsCEC.contractReference_2.object = await this.AssetIssuerInstance.encodeCollateralAsObject(
      this.PaymentTokenInstance.address,
      collateralAmount
    );
    // derive terms
    const lifecycleTermsCEC = parseTermsToLifecycleTerms(termsCEC);
    const customTermsCEC = { ...parseTermsToCustomTerms(termsCEC), anchorDate: this.customTerms.anchorDate };
    const generatingTermsCEC = parseTermsToGeneratingTerms(termsCEC);
    const productTermsCEC = parseTermsToProductTerms(termsCEC);
    const productSchedulesCEC = {
      nonCyclicSchedule: await this.CECEngineInstance.computeNonCyclicScheduleSegment(generatingTermsCEC, generatingTermsCEC.contractDealDate, generatingTermsCEC.maturityDate),
      cyclicIPSchedule: await this.CECEngineInstance.computeCyclicScheduleSegment(generatingTermsCEC, generatingTermsCEC.contractDealDate, generatingTermsCEC.maturityDate, 8),
      cyclicPRSchedule: await this.CECEngineInstance.computeCyclicScheduleSegment(generatingTermsCEC, generatingTermsCEC.contractDealDate, generatingTermsCEC.maturityDate, 15),
      cyclicSCSchedule: await this.CECEngineInstance.computeCyclicScheduleSegment(generatingTermsCEC, generatingTermsCEC.contractDealDate, generatingTermsCEC.maturityDate, 19),
      cyclicRRSchedule: await this.CECEngineInstance.computeCyclicScheduleSegment(generatingTermsCEC, generatingTermsCEC.contractDealDate, generatingTermsCEC.maturityDate, 18),
      cyclicFPSchedule: await this.CECEngineInstance.computeCyclicScheduleSegment(generatingTermsCEC, generatingTermsCEC.contractDealDate, generatingTermsCEC.maturityDate, 4),
      cyclicPYSchedule: await this.CECEngineInstance.computeCyclicScheduleSegment(generatingTermsCEC, generatingTermsCEC.contractDealDate, generatingTermsCEC.maturityDate, 11),
    };
    // register product
    const productIdCEC = deriveProductId(productTermsCEC, productSchedulesCEC);
    await this.ProductRegistryInstance.registerProduct(productTermsCEC, productSchedulesCEC);

    // sign order
    const orderData = getDefaultOrderDataWithEnhancement(
      this.terms, this.productId, this.customTerms, this.ownership, this.PAMEngineInstance.address, this.AssetActorInstance.address,
      termsCEC, productIdCEC, customTermsCEC, ownershipCEC, this.CECEngineInstance.address
    );
    const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    orderData.creatorSignature = await sign(unfilledOrderAsTypedData, orderData.ownership.creatorObligor);
    orderData.counterpartySignature = await sign(filledOrderAsTypedData, orderData.ownership.counterpartyObligor);
    // collateral enhancement order does not have to be signed (ownership is enforced by AssetIssuer)
    orderData.enhancementOrder_1.creatorSignature = '0x0';
    orderData.enhancementOrder_1.counterpartySignature = '0x0';

    // counterparty has to set allowance == collateralAmount for custodian contract
    await this.PaymentTokenInstance.approve(this.CustodianInstance.address, collateralAmount, { from: counterpartyBeneficiary });

    // issue asset
    await this.AssetIssuerInstance.issueFromOrder(orderData, { from: counterpartyBeneficiary });
 
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

    // derive assetId of underlying and collateral enhancement
    const assetId = getAssetIdFromOrderData(orderData);
    const cecAssetId = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes', 'bytes', 'address'],
        [orderData.creatorSignature, orderData.counterpartySignature, this.CustodianInstance.address]
      )
    );

    // settle IED
    const iedEvent = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(assetId));
    const iedPayoff = await this.PAMEngineInstance.computePayoffForEvent(
      this.lifecycleTerms,
      await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId)),
      iedEvent,
      '0x0000000000000000000000000000000000000000000000000000000000000000'
    );

    // progress to schedule time of IED
    await mineBlock(Number(await getEventTime(iedEvent, this.lifecycleTerms)));
    await this.PaymentTokenInstance.approve(this.AssetActorInstance.address, iedPayoff, { from: creatorObligor });
    await this.AssetActorInstance.progress(web3.utils.toHex(assetId));

    // progress to schedule time of first IP (payoff == 0)
    const ipEvent_1 = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(assetId));
    await mineBlock(Number(await getEventTime(ipEvent_1, this.lifecycleTerms)));
    await this.AssetActorInstance.progress(web3.utils.toHex(assetId));

    // progress to post-grace period of IP
    const ipEvent_2 = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(assetId));
    await mineBlock(Number(await getEventTime(ipEvent_2, this.lifecycleTerms)) + 10000000);
    await this.AssetActorInstance.progress(web3.utils.toHex(assetId));

    // progress collateral enhancement
    const xdEvent = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(cecAssetId));
    await mineBlock(Number(await getEventTime(xdEvent, lifecycleTermsCEC)));
    await this.AssetActorInstance.progress(web3.utils.toHex(cecAssetId));

    // progress collateral enhancement
    const stdEvent = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(cecAssetId))
    await mineBlock(Number(await getEventTime(stdEvent, lifecycleTermsCEC)));
    await this.AssetActorInstance.progress(web3.utils.toHex(cecAssetId));

    // creator should have received seized collateral from custodian
    assert.equal(
      (await this.PaymentTokenInstance.balanceOf(creatorBeneficiary)).toString(),
      web3.utils.hexToNumberString(this.customTerms.notionalPrincipal)
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