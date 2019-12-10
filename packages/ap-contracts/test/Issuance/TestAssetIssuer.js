const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const AssetIssuer = artifacts.require('AssetIssuer.sol');
const ERC20SampleToken = artifacts.require('ERC20SampleToken.sol');

const {
  setupTestEnvironment,
  getDefaultTerms,
  convertDatesToOffsets,
  parseTermsToProductTerms,
  parseTermsToCustomTerms
} = require('../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot } = require('../helper/blockchain');

const {
  getDefaultOrderData,
  getDefaultOrderDataWithEnhancement,
  getDefaultOrderDataWithEnhancements,
  getAssetIdFromOrderData,
  getUnfilledOrderDataAsTypedData,
  getFilledOrderDataAsTypedData,
  getUnfilledEnhancementOrderDataAsTypedData,
  getFilledEnhancementOrderDataAsTypedData,
  sign
} = require('../helper/orderUtils');

const { deriveProductId } = require('../helper/orderUtils');

const CECCollateralTerms = require('../helper/terms/cec-collateral-terms.json');


contract('AssetIssuer', (accounts) => {
  const creator = accounts[0];
  const counterparty = accounts[1];
  const guarantor = accounts[2];
  const guarantor_2 = accounts[3];

  let snapshot;

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    // deploy test ERC20 token and load accounts
    this.PaymentTokenInstance = await ERC20SampleToken.new({ from: creator });
    this.PaymentTokenInstance.transfer(counterparty, web3.utils.toWei('10000'));

    this.ownership = {
      creatorObligor: creator,
      creatorBeneficiary: creator,
      counterpartyObligor: counterparty,
      counterpartyBeneficiary: counterparty
    };
    this.terms = await getDefaultTerms();
    this.terms.currency = this.PaymentTokenInstance.address;
    // derive LifecycleTerms, GeneratingTerms, ProductTerms and CustomTerms
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
    this.generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(this.terms));
    this.productTerms = parseTermsToProductTerms(this.terms);
    this.customTerms = parseTermsToCustomTerms(this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.terms);
    this.productSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 11),
    };
    this.productId = deriveProductId(this.productTerms, this.productSchedules);

    // register product
    await this.ProductRegistryInstance.registerProduct(this.productTerms, this.productSchedules)

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should issue an asset from an order (without enhancement orders)', async () => {
    // sign order
    const orderData = getDefaultOrderData(
      this.terms, this.productId, this.customTerms, this.ownership, this.PAMEngineInstance.address, this.AssetActorInstance.address
    );
    const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    orderData.creatorSignature = await sign(unfilledOrderAsTypedData, orderData.ownership.creatorObligor);
    orderData.counterpartySignature = await sign(filledOrderAsTypedData, orderData.ownership.counterpartyObligor);

    // issue asset
    const { tx: txHash } = await this.AssetIssuerInstance.issueFromOrder(orderData);

    const assetId = getAssetIdFromOrderData(orderData);

    const storedTerms = await this.AssetRegistryInstance.getTerms(assetId);
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(assetId);
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(assetId);
    
    assert.equal(storedEngineAddress, orderData.engine);
    assert.equal(storedOwnership.creatorObligor, creator);
    assert.equal(storedOwnership.creatorBeneficiary, creator);
    assert.equal(storedOwnership.counterpartyObligor, counterparty);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterparty);

    await expectEvent.inTransaction(txHash, AssetIssuer, 'AssetIssued', {
      assetId: assetId,
      creator: creator,
      counterparty: counterparty
    });
  });

  it('should issue an asset from an order (with enhancement orders without collateral)', async () => {
    const enhancementOwnership_1 = {
      creatorObligor: counterparty, creatorBeneficiary: counterparty, counterpartyObligor: guarantor, counterpartyBeneficiary: guarantor
    };
    const enhancementOwnership_2 = {
      creatorObligor: counterparty, creatorBeneficiary: counterparty, counterpartyObligor: guarantor_2, counterpartyBeneficiary: guarantor_2
    };
    
    // sign order
    const orderData = getDefaultOrderDataWithEnhancements(
      this.terms, this.productId, this.customTerms, this.ownership, this.PAMEngineInstance.address, this.AssetActorInstance.address,
      this.terms, this.productId, this.customTerms, enhancementOwnership_1, this.CEGEngineInstance.address,
      this.terms, this.productId, this.customTerms, enhancementOwnership_2, this.CEGEngineInstance.address
    );
    const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    orderData.creatorSignature = await sign(unfilledOrderAsTypedData, creator);
    orderData.counterpartySignature = await sign(filledOrderAsTypedData, counterparty);
  
    // sign enhancement order 1
    const unfilledEnhancementOrderAsTypedData_1 = getUnfilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_1, this.AssetIssuerInstance.address);
    const filledEnhancementOrderAsTypedData_1 = getFilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_1, this.AssetIssuerInstance.address);
    orderData.enhancementOrder_1.creatorSignature = await sign(unfilledEnhancementOrderAsTypedData_1, counterparty);
    orderData.enhancementOrder_1.counterpartySignature = await sign(filledEnhancementOrderAsTypedData_1, guarantor);
  
    // sign enhancement order 2
    const unfilledEnhancementOrderAsTypedData_2 = getUnfilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_2, this.AssetIssuerInstance.address);
    const filledEnhancementOrderAsTypedData_2 = getFilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_2, this.AssetIssuerInstance.address);
    orderData.enhancementOrder_2.creatorSignature = await sign(unfilledEnhancementOrderAsTypedData_2, counterparty);
    orderData.enhancementOrder_2.counterpartySignature = await sign(filledEnhancementOrderAsTypedData_2, guarantor_2);
  
    // issue asset
    const { tx: txHash } = await this.AssetIssuerInstance.issueFromOrder(orderData);
  
    const assetId = getAssetIdFromOrderData(orderData);
  
    // const storedTerms = await this.AssetRegistryInstance.getTerms(assetId);
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(assetId);
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(assetId);
  
    // assert.equal(storedTerms['initialExchangeDate'], this.terms['initialExchangeDate']);
    assert.equal(storedEngineAddress, orderData.engine);
    assert.equal(storedOwnership.creatorObligor, creator);
    assert.equal(storedOwnership.creatorBeneficiary, creator);
    assert.equal(storedOwnership.counterpartyObligor, counterparty);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterparty);
  
    await expectEvent.inTransaction(txHash, AssetIssuer, 'AssetIssued', {
      assetId: assetId,
      creator: creator,
      counterparty: counterparty
    });

    // enhancementOrder_1
    const assetId_1 = getAssetIdFromOrderData(orderData.enhancementOrder_1);
    // const storedTerms_1 = await this.AssetRegistryInstance.getTerms(assetId_1);
    const storedOwnership_1 = await this.AssetRegistryInstance.getOwnership(assetId_1);
    const storedEngineAddress_1 = await this.AssetRegistryInstance.getEngineAddress(assetId_1);

    // assert.equal(storedTerms_1['initialExchangeDate'], this.terms['initialExchangeDate']);
    assert.equal(storedEngineAddress_1, orderData.enhancementOrder_1.engine);
    assert.equal(storedOwnership_1.creatorObligor, counterparty);
    assert.equal(storedOwnership_1.creatorBeneficiary, counterparty);
    assert.equal(storedOwnership_1.counterpartyObligor, guarantor);
    assert.equal(storedOwnership_1.counterpartyBeneficiary, guarantor);

    // enhancementOrder_2
    const assetId_2 = getAssetIdFromOrderData(orderData.enhancementOrder_2);
    // const storedTerms_2 = await this.AssetRegistryInstance.getTerms(assetId_2);
    const storedOwnership_2 = await this.AssetRegistryInstance.getOwnership(assetId_2);
    const storedEngineAddress_2 = await this.AssetRegistryInstance.getEngineAddress(assetId_2);

    // assert.equal(storedTerms_2['initialExchangeDate'], this.terms['initialExchangeDate']);
    assert.equal(storedEngineAddress_2, orderData.enhancementOrder_2.engine);
    assert.equal(storedOwnership_2.creatorObligor, counterparty);
    assert.equal(storedOwnership_2.creatorBeneficiary, counterparty);
    assert.equal(storedOwnership_2.counterpartyObligor, guarantor_2);
    assert.equal(storedOwnership_2.counterpartyBeneficiary, guarantor_2);

    await revertToSnapshot(snapshot);
    snapshot = await createSnapshot();
  });

  it('should issue an asset from an order (with enhancement orders with collateral)', async () => {
    const ownershipCEC = {
      creatorObligor: '0x0000000000000000000000000000000000000000',
      creatorBeneficiary: '0x0000000000000000000000000000000000000000',
      counterpartyObligor: '0x0000000000000000000000000000000000000000',
      counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
    };
    const termsCEC = { ...CECCollateralTerms, maturityDate: this.terms.maturityDate };
    // encode collateral token address and collateral amount (notionalPrincipal of underlying + some over-collateralization)
    const collateralAmount = (new BigNumber(this.customTerms.notionalPrincipal)).plus(web3.utils.toWei('100').toString());
    // encode collateralToken and collateralAmount in object of second contract reference
    termsCEC.contractReference_2.object = await this.AssetIssuerInstance.encodeCollateralAsObject(
      this.PaymentTokenInstance.address,
      collateralAmount
    );
    // derive terms
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
    await this.PaymentTokenInstance.approve(this.CustodianInstance.address, collateralAmount, { from: counterparty });

    // // issue asset
    const tx = await this.AssetIssuerInstance.issueFromOrder(orderData, { from: counterparty });
  
    const assetId = getAssetIdFromOrderData(orderData);
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(assetId);
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(assetId);
    assert.equal(storedEngineAddress, orderData.engine);
    assert.equal(storedOwnership.creatorObligor, creator);
    assert.equal(storedOwnership.creatorBeneficiary, creator);
    assert.equal(storedOwnership.counterpartyObligor, counterparty);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterparty);
  
    await expectEvent.inTransaction(tx.tx, AssetIssuer, 'AssetIssued', {
      assetId: assetId,
      creator: creator,
      counterparty: counterparty
    });

    // enhancementOrder_1
    const assetId_1 = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes', 'bytes', 'address'],
        [orderData.creatorSignature, orderData.counterpartySignature, this.CustodianInstance.address]
      )
    );
    const storedOwnership_1 = await this.AssetRegistryInstance.getOwnership(assetId_1);
    const storedEngineAddress_1 = await this.AssetRegistryInstance.getEngineAddress(assetId_1);
    assert.equal(storedEngineAddress_1, orderData.enhancementOrder_1.engine);
    assert.equal(storedOwnership_1.creatorObligor, creator);
    assert.equal(storedOwnership_1.creatorBeneficiary, creator);
    assert.equal(storedOwnership_1.counterpartyObligor, this.CustodianInstance.address);
    assert.equal(storedOwnership_1.counterpartyBeneficiary, counterparty);

    await revertToSnapshot(snapshot);
    snapshot = await createSnapshot();
  });

  it('should issue an asset from an order (as an enhancement to an existing asset)', async () => {
    // sign order
    const orderData = getDefaultOrderData(
      this.terms, this.productId, this.customTerms, this.ownership, this.PAMEngineInstance.address, this.AssetActorInstance.address
    );
    const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    orderData.creatorSignature = await sign(unfilledOrderAsTypedData, orderData.ownership.creatorObligor);
    orderData.counterpartySignature = await sign(filledOrderAsTypedData, orderData.ownership.counterpartyObligor);

    // issue underlying asset
    await this.AssetIssuerInstance.issueFromOrder(orderData);
    const underlyingAssetId = getAssetIdFromOrderData(orderData);

    // collateral enhancement order
    const ownershipCEC = {
      creatorObligor: '0x0000000000000000000000000000000000000000',
      creatorBeneficiary: '0x0000000000000000000000000000000000000000',
      counterpartyObligor: '0x0000000000000000000000000000000000000000',
      counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
    };
    const termsCEC = { ...CECCollateralTerms, maturityDate: this.terms.maturityDate };
    // encode underlying assetId in object of first contract reference
    termsCEC.contractReference_1.object = web3.utils.toHex(underlyingAssetId);
    // encode collateral token address and collateral amount (notionalPrincipal of underlying + some over-collateralization)
    const collateralAmount = (new BigNumber(this.customTerms.notionalPrincipal)).plus(web3.utils.toWei('100').toString());
    // encode collateralToken and collateralAmount in object of second contract reference
    termsCEC.contractReference_2.object = await this.AssetIssuerInstance.encodeCollateralAsObject(
      this.PaymentTokenInstance.address,
      collateralAmount
    );
    // derive terms
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

    const orderDataCEC = getDefaultOrderData(
      termsCEC, productIdCEC, customTermsCEC, ownershipCEC, this.CECEngineInstance.address, this.AssetActorInstance.address
    );
    orderDataCEC.creatorSignature = '0x0';
    orderDataCEC.counterpartySignature = '0x0';

    // counterparty has to set allowance == collateralAmount for custodian contract
    await this.PaymentTokenInstance.approve(this.CustodianInstance.address, collateralAmount, { from: counterparty });
    
    // issue asset
    await this.AssetIssuerInstance.issueFromOrder(orderDataCEC);
    const assetIdCEC = web3.utils.keccak256(
      web3.eth.abi.encodeParameters(
        ['bytes32', 'address', 'uint256'],
        [orderDataCEC.termsHash, this.CustodianInstance.address, orderDataCEC.salt]
      )
    );

    const storedEngineAddressCEC = await this.AssetRegistryInstance.getEngineAddress(assetIdCEC);

    assert.equal(storedEngineAddressCEC, orderDataCEC.engine);

    await revertToSnapshot(snapshot);
    snapshot = await createSnapshot();
  });
});
