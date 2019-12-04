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

const {
  getAssetIdFromOrderData,
  getUnfilledOrderDataAsTypedData,
  getFilledOrderDataAsTypedData,
  getUnfilledEnhancementOrderDataAsTypedData,
  getFilledEnhancementOrderDataAsTypedData,
  getTermsHash,
  sign
} = require('../helper/orderUtils');

const CECCollateralTerms = require('../helper/cec-collateral-terms.json');


contract('AssetIssuer', (accounts) => {
  const creator = accounts[0];
  const counterparty = accounts[1];
  const guarantor = accounts[2];
  const guarantor_2 = accounts[3];

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    // deploy test ERC20 token and load accounts
    this.PaymentTokenInstance = await ERC20SampleToken.new({ from: creator });
    this.PaymentTokenInstance.transfer(counterparty, web3.utils.toWei('10000'));

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
    this.productId = 'Test Product';

    // register product
    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(this.productId), this.productTerms, this.productSchedules)
  });

  it('should issue an asset from an order (without enhancement orders)', async () => {
    const orderData = { 
      termsHash: getTermsHash(this.terms),
      productId: web3.utils.toHex(this.productId),
      expirationDate: '11100000000',
      customTerms: this.customTerms,
      ownership: {
        creatorObligor: creator,
        creatorBeneficiary: creator,
        counterpartyObligor: counterparty,
        counterpartyBeneficiary: counterparty
      },
      engine: this.PAMEngineInstance.address,
      actor: this.AssetActorInstance.address,
      enhancementOrder_1: {
        termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        productId: '0x0000000000000000000000000000000000000000000000000000000000000000',
        customTerms: this.customTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
        ownership: {
          creatorObligor: '0x0000000000000000000000000000000000000000',
          creatorBeneficiary: '0x0000000000000000000000000000000000000000',
          counterpartyObligor: '0x0000000000000000000000000000000000000000',
          counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
        },
        engine: '0x0000000000000000000000000000000000000000',
        creatorSignature: '0x0',
        counterpartySignature: '0x0',
        salt: 0
      },
      enhancementOrder_2: {
        termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        productId: '0x0000000000000000000000000000000000000000000000000000000000000000',
        customTerms: this.customTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
        ownership: {
          creatorObligor: '0x0000000000000000000000000000000000000000',
          creatorBeneficiary: '0x0000000000000000000000000000000000000000',
          counterpartyObligor: '0x0000000000000000000000000000000000000000',
          counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
        },
        engine: '0x0000000000000000000000000000000000000000',
        creatorSignature: '0x0',
        counterpartySignature: '0x0',
        salt: 0
      },
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000) 
    };
    
    // sign order
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
    const orderData = { 
      termsHash: getTermsHash(this.terms),
      productId: web3.utils.toHex(this.productId),
      customTerms: this.customTerms,
      expirationDate: '11100000000',
      ownership: {
        creatorObligor: creator,
        creatorBeneficiary: creator,
        counterpartyObligor: counterparty,
        counterpartyBeneficiary: counterparty
      },
      engine: this.PAMEngineInstance.address,
      actor: this.AssetActorInstance.address,
      enhancementOrder_1: {
        termsHash: getTermsHash(this.terms),
        productId: web3.utils.toHex(this.productId),
        customTerms: this.customTerms,
        ownership: {
          creatorObligor: counterparty,
          creatorBeneficiary: counterparty,
          counterpartyObligor: guarantor,
          counterpartyBeneficiary: guarantor
        },
        engine: this.CEGEngineInstance.address,
        creatorSignature: null,
        counterpartySignature: null,
        salt: Math.floor(Math.random() * 1000000)
      },
      enhancementOrder_2: {
        termsHash: getTermsHash(this.terms),
        productId: web3.utils.toHex(this.productId),
        customTerms: this.customTerms,
        ownership: {
          creatorObligor: counterparty,
          creatorBeneficiary: counterparty,
          counterpartyObligor: guarantor_2,
          counterpartyBeneficiary: guarantor_2
        },
        engine: this.CEGEngineInstance.address,
        creatorSignature: null,
        counterpartySignature: null,
        salt: Math.floor(Math.random() * 1000000)
      },
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000)
    };
    
    // sign order
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
  });

  it('should issue an asset from an order (with enhancement orders with collateral)', async () => {
    const termsCEC = { ...CECCollateralTerms, maturityDate: this.terms.maturityDate };

    // encode collateral token address and collateral amount (notionalPrincipal of underlying + some over-collateralization)
    const collateralAmount = (new BigNumber(this.customTerms.notionalPrincipal)).plus(web3.utils.toWei('100').toString());

    // encode collateralToken and collateralAmount in object of second contract reference
    termsCEC.contractReference_2.object = await this.AssetIssuerInstance.encodeCollateralAsObject(
      this.PaymentTokenInstance.address,
      collateralAmount
    );

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
    const productIdCEC = 'Test Product CEC';
    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(productIdCEC), productTermsCEC, productSchedulesCEC);

    const orderData = { 
      termsHash: getTermsHash(this.terms),
      productId: web3.utils.toHex(this.productId),
      customTerms: this.customTerms,
      expirationDate: '11100000000',
      ownership: {
        creatorObligor: creator,
        creatorBeneficiary: creator,
        counterpartyObligor: counterparty,
        counterpartyBeneficiary: counterparty
      },
      engine: this.PAMEngineInstance.address,
      actor: this.AssetActorInstance.address,
      enhancementOrder_1: {
        termsHash: getTermsHash(termsCEC),
        productId: web3.utils.toHex(productIdCEC),
        customTerms: customTermsCEC,
        ownership: {
          creatorObligor: '0x0000000000000000000000000000000000000000',
          creatorBeneficiary: '0x0000000000000000000000000000000000000000',
          counterpartyObligor: '0x0000000000000000000000000000000000000000',
          counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
        },
        engine: this.CECEngineInstance.address,
        creatorSignature: '0x0',
        counterpartySignature: '0x0',
        salt: Math.floor(Math.random() * 1000000)
      },
      enhancementOrder_2: {
        termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        productId: '0x0000000000000000000000000000000000000000000000000000000000000000',
        customTerms: this.customTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
        ownership: {
          creatorObligor: '0x0000000000000000000000000000000000000000',
          creatorBeneficiary: '0x0000000000000000000000000000000000000000',
          counterpartyObligor: '0x0000000000000000000000000000000000000000',
          counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
        },
        engine: '0x0000000000000000000000000000000000000000',
        creatorSignature: '0x0',
        counterpartySignature: '0x0',
        salt: 0
      },
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000)
    };
    
    // sign order
    const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    orderData.creatorSignature = await sign(unfilledOrderAsTypedData, orderData.ownership.creatorObligor);
    orderData.counterpartySignature = await sign(filledOrderAsTypedData, orderData.ownership.counterpartyObligor);
  
    // collateral enhancement order does not have to be signed (ownership is enforced by AssetIssuer)

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
  });
});
