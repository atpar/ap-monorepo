const { expectEvent } = require('openzeppelin-test-helpers');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const AssetIssuer = artifacts.require('AssetIssuer.sol');

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
  sign
} = require('../helper/orderUtils');


contract('AssetIssuer', (accounts) => {
  const creator = accounts[0];
  const counterparty = accounts[1];
  const guarantor = accounts[2];
  const guarantor_2 = accounts[3];

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.terms = await getDefaultTerms();
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
    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(this.productId), this.productTerms, this.productSchedules);
  });

  it('should issue an asset from an order (without enhancement orders)', async () => {
    const orderData = { 
      termsHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      productId: web3.utils.toHex(this.productId),
      expirationDate: '11100000000',
      customTerms: this.customTerms,
      maker: creator,
      taker: counterparty,
      engine: this.PAMEngineInstance.address,
      actor: this.AssetActorInstance.address,
      enhancementOrder_1: {
        termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        productId: '0x0000000000000000000000000000000000000000000000000000000000000000',
        customTerms: this.customTerms,
        maker: '0x0000000000000000000000000000000000000000',
        taker: '0x0000000000000000000000000000000000000000',
        engine: '0x0000000000000000000000000000000000000000',
        makerSignature: '0x0',
        takerSignature: '0x0',
        salt: 0
      },
      enhancementOrder_2: {
        termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
        productId: '0x0000000000000000000000000000000000000000000000000000000000000000',
        customTerms: this.customTerms,
        maker: '0x0000000000000000000000000000000000000000',
        taker: '0x0000000000000000000000000000000000000000',
        engine: '0x0000000000000000000000000000000000000000',
        makerSignature: '0x0',
        takerSignature: '0x0',
        salt: 0
      },
      makerSignature: null,
      takerSignature: null,
      salt: Math.floor(Math.random() * 1000000) 
    };
    
    // sign order
    const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    orderData.makerSignature = await sign(unfilledOrderAsTypedData, creator);
    orderData.takerSignature = await sign(filledOrderAsTypedData, counterparty);

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
      termsHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
      productId: web3.utils.toHex(this.productId),
      customTerms: this.customTerms,
      expirationDate: '11100000000',
      maker: creator,
      taker: counterparty,
      engine: this.PAMEngineInstance.address,
      actor: this.AssetActorInstance.address,
      enhancementOrder_1: {
        termsHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
        productId: web3.utils.toHex(this.productId),
        customTerms: this.customTerms,
        maker: counterparty,
        taker: guarantor,
        engine: this.PAMEngineInstance.address,
        makerSignature: null,
        takerSignature: null,
        salt: Math.floor(Math.random() * 1000000)
      },
      enhancementOrder_2: {
        termsHash: '0x0000000000000000000000000000000000000000000000000000000000000003',
        productId: web3.utils.toHex(this.productId),
        customTerms: this.customTerms,
        maker: counterparty,
        taker: guarantor_2,
        engine: this.PAMEngineInstance.address,
        makerSignature: null,
        takerSignature: null,
        salt: Math.floor(Math.random() * 1000000)
      },
      makerSignature: null,
      takerSignature: null,
      salt: Math.floor(Math.random() * 1000000)
    };
    
    // sign order
    const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
    orderData.makerSignature = await sign(unfilledOrderAsTypedData, creator);
    orderData.takerSignature = await sign(filledOrderAsTypedData, counterparty);
  
    // sign enhancement order 1
    const unfilledEnhancementOrderAsTypedData_1 = getUnfilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_1, this.AssetIssuerInstance.address);
    const filledEnhancementOrderAsTypedData_1 = getFilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_1, this.AssetIssuerInstance.address);
    orderData.enhancementOrder_1.makerSignature = await sign(unfilledEnhancementOrderAsTypedData_1, counterparty);
    orderData.enhancementOrder_1.takerSignature = await sign(filledEnhancementOrderAsTypedData_1, guarantor);
  
    // sign enhancement order 2
    const unfilledEnhancementOrderAsTypedData_2 = getUnfilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_2, this.AssetIssuerInstance.address);
    const filledEnhancementOrderAsTypedData_2 = getFilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_2, this.AssetIssuerInstance.address);
    orderData.enhancementOrder_2.makerSignature = await sign(unfilledEnhancementOrderAsTypedData_2, counterparty);
    orderData.enhancementOrder_2.takerSignature = await sign(filledEnhancementOrderAsTypedData_2, guarantor_2);
  
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
    assert.equal(storedEngineAddress_1, orderData.engine); // todo
    assert.equal(storedOwnership_1.creatorObligor, counterparty);
    assert.equal(storedOwnership_1.creatorBeneficiary, counterparty);
    assert.equal(storedOwnership_1.counterpartyObligor, guarantor);
    assert.equal(storedOwnership_1.counterpartyBeneficiary, guarantor);

    // await expectEvent.inTransaction(txHash, AssetIssuer, 'AssetIssued', {
    //   assetId: assetId_1,
    //   creator: counterparty,
    //   counterparty: guarantor
    // });

    // enhancementOrder_2
    const assetId_2 = getAssetIdFromOrderData(orderData.enhancementOrder_2);
    // const storedTerms_2 = await this.AssetRegistryInstance.getTerms(assetId_2);
    const storedOwnership_2 = await this.AssetRegistryInstance.getOwnership(assetId_2);
    const storedEngineAddress_2 = await this.AssetRegistryInstance.getEngineAddress(assetId_2);

    // assert.equal(storedTerms_2['initialExchangeDate'], this.terms['initialExchangeDate']);
    assert.equal(storedEngineAddress_2, orderData.engine); // todo
    assert.equal(storedOwnership_2.creatorObligor, counterparty);
    assert.equal(storedOwnership_2.creatorBeneficiary, counterparty);
    assert.equal(storedOwnership_2.counterpartyObligor, guarantor_2);
    assert.equal(storedOwnership_2.counterpartyBeneficiary, guarantor_2);

    // await expectEvent.inTransaction(txHash, AssetIssuer, 'AssetIssued', {
    //   assetId: assetId_2,
    //   creator: counterparty,
    //   counterparty: guarantor_2
    // });
  });

  // it('should issue an asset from an order (with enhancement orders with collateral)', async () => {
  //   const orderData = { 
  //     termsHash: '0x0000000000000000000000000000000000000000000000000000000000000001',
  //     productId: web3.utils.toHex(this.productId),
  //     customTerms: this.customTerms,
  //     expirationDate: '11100000000',
  //     maker: creator,
  //     taker: counterparty,
  //     engine: this.PAMEngineInstance.address,
  //     actor: this.AssetActorInstance.address,
  //     enhancementOrder_1: {
  //       termsHash: '0x0000000000000000000000000000000000000000000000000000000000000002',
  //       productId: web3.utils.toHex(this.productId),
  //       customTerms: this.customTerms,
  //       maker: counterparty,
  //       taker: guarantor,
  //       engine: this.PAMEngineInstance.address,
  //       makerSignature: null,
  //       takerSignature: null,
  //       salt: Math.floor(Math.random() * 1000000)
  //     },
  //     enhancementOrder_2: {
  //       termsHash: '0x0000000000000000000000000000000000000000000000000000000000000003',
  //       productId: web3.utils.toHex(this.productId),
  //       customTerms: this.customTerms,
  //       maker: counterparty,
  //       taker: guarantor_2,
  //       engine: this.PAMEngineInstance.address,
  //       makerSignature: null,
  //       takerSignature: null,
  //       salt: Math.floor(Math.random() * 1000000)
  //     },
  //     makerSignature: null,
  //     takerSignature: null,
  //     salt: Math.floor(Math.random() * 1000000)
  //   };
    
  //   // sign order
  //   const unfilledOrderAsTypedData = getUnfilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
  //   const filledOrderAsTypedData = getFilledOrderDataAsTypedData(orderData, this.AssetIssuerInstance.address);
  //   orderData.makerSignature = await sign(unfilledOrderAsTypedData, creator);
  //   orderData.takerSignature = await sign(filledOrderAsTypedData, counterparty);
  
  //   // sign enhancement order 1
  //   const unfilledEnhancementOrderAsTypedData_1 = getUnfilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_1, this.AssetIssuerInstance.address);
  //   const filledEnhancementOrderAsTypedData_1 = getFilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_1, this.AssetIssuerInstance.address);
  //   orderData.enhancementOrder_1.makerSignature = await sign(unfilledEnhancementOrderAsTypedData_1, counterparty);
  //   orderData.enhancementOrder_1.takerSignature = await sign(filledEnhancementOrderAsTypedData_1, guarantor);
  
  //   // sign enhancement order 2
  //   const unfilledEnhancementOrderAsTypedData_2 = getUnfilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_2, this.AssetIssuerInstance.address);
  //   const filledEnhancementOrderAsTypedData_2 = getFilledEnhancementOrderDataAsTypedData(orderData.enhancementOrder_2, this.AssetIssuerInstance.address);
  //   orderData.enhancementOrder_2.makerSignature = await sign(unfilledEnhancementOrderAsTypedData_2, counterparty);
  //   orderData.enhancementOrder_2.takerSignature = await sign(filledEnhancementOrderAsTypedData_2, guarantor_2);
  
  //   // issue asset
  //   const { tx: txHash } = await this.AssetIssuerInstance.issueFromOrder(orderData);
  
  //   const assetId = getAssetIdFromOrderData(orderData);
  
  //   // const storedTerms = await this.AssetRegistryInstance.getTerms(assetId);
  //   const storedOwnership = await this.AssetRegistryInstance.getOwnership(assetId);
  //   const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(assetId);
  
  //   // assert.equal(storedTerms['initialExchangeDate'], this.terms['initialExchangeDate']);
  //   assert.equal(storedEngineAddress, orderData.engine);
  //   assert.equal(storedOwnership.creatorObligor, creator);
  //   assert.equal(storedOwnership.creatorBeneficiary, creator);
  //   assert.equal(storedOwnership.counterpartyObligor, counterparty);
  //   assert.equal(storedOwnership.counterpartyBeneficiary, counterparty);
  
  //   await expectEvent.inTransaction(txHash, AssetIssuer, 'AssetIssued', {
  //     assetId: assetId,
  //     creator: creator,
  //     counterparty: counterparty
  //   });

  //   // enhancementOrder_1
  //   const assetId_1 = getAssetIdFromOrderData(orderData.enhancementOrder_1);
  //   // const storedTerms_1 = await this.AssetRegistryInstance.getTerms(assetId_1);
  //   const storedOwnership_1 = await this.AssetRegistryInstance.getOwnership(assetId_1);
  //   const storedEngineAddress_1 = await this.AssetRegistryInstance.getEngineAddress(assetId_1);

  //   // assert.equal(storedTerms_1['initialExchangeDate'], this.terms['initialExchangeDate']);
  //   assert.equal(storedEngineAddress_1, orderData.engine); // todo
  //   assert.equal(storedOwnership_1.creatorObligor, counterparty);
  //   assert.equal(storedOwnership_1.creatorBeneficiary, counterparty);
  //   assert.equal(storedOwnership_1.counterpartyObligor, guarantor);
  //   assert.equal(storedOwnership_1.counterpartyBeneficiary, guarantor);

  //   // await expectEvent.inTransaction(txHash, AssetIssuer, 'AssetIssued', {
  //   //   assetId: assetId_1,
  //   //   creator: counterparty,
  //   //   counterparty: guarantor
  //   // });

  //   // enhancementOrder_2
  //   const assetId_2 = getAssetIdFromOrderData(orderData.enhancementOrder_2);
  //   // const storedTerms_2 = await this.AssetRegistryInstance.getTerms(assetId_2);
  //   const storedOwnership_2 = await this.AssetRegistryInstance.getOwnership(assetId_2);
  //   const storedEngineAddress_2 = await this.AssetRegistryInstance.getEngineAddress(assetId_2);

  //   // assert.equal(storedTerms_2['initialExchangeDate'], this.terms['initialExchangeDate']);
  //   assert.equal(storedEngineAddress_2, orderData.engine); // todo
  //   assert.equal(storedOwnership_2.creatorObligor, counterparty);
  //   assert.equal(storedOwnership_2.creatorBeneficiary, counterparty);
  //   assert.equal(storedOwnership_2.counterpartyObligor, guarantor_2);
  //   assert.equal(storedOwnership_2.counterpartyBeneficiary, guarantor_2);

  //   // await expectEvent.inTransaction(txHash, AssetIssuer, 'AssetIssued', {
  //   //   assetId: assetId_2,
  //   //   creator: counterparty,
  //   //   counterparty: guarantor_2
  //   // });
  // });
});
