const { shouldFail } = require('openzeppelin-test-helpers');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');

const ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS';
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER';
const INVALID_CASHFLOWID = 'INVALID_CASHFLOWID';


contract('AssetRegistry', (accounts) => {
  const actor = accounts[1];

  const recordCreatorObligor = accounts[2];
  const recordCreatorBeneficiary = accounts[3];
  const counterpartyObligor = accounts[4];
  const counterpartyBeneficiary = accounts[5];
  
  const cashflowIdBeneficiary = accounts[6];
  const newCashflowBeneficiary = accounts[7];

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.assetId = 'C123';
    this.terms = await getDefaultTerms();
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
    this.generatingTerms = parseTermsToGeneratingTerms(this.terms);
    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    this.ownership = { 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    this.protoEventSchedules = {
      nonCyclicProtoEventSchedule: await this.PAMEngineInstance.computeNonCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate),
      cyclicIPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 8),
      cyclicPRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 15),
      cyclicSCProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 19),
      cyclicRRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 18),
      cyclicFPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 4),
      cyclicPYProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 11),
    };
    this.productId = 'Test Product';

    // register product
    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(this.productId), this.terms, this.protoEventSchedules);
  });

  it('should register an asset', async () => {
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(this.assetId),
      this.ownership,
      web3.utils.toHex(this.productId),
      this.state,
      this.PAMEngineInstance.address,
      actor
    );

    const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(web3.utils.toHex(this.assetId));

    function parseTerms (array) {
      return array.map((value) => {
        switch (typeof value) {
          case 'object':
            return (Array.isArray(value)) ? parseTerms(value) : parseTerms(Object.values(value));
          case 'number':
            return value.toString();
          case 'boolean':
            return value;
          case 'string':
            return (web3.utils.isHexStrict(value) && value.length < 42) ? web3.utils.hexToNumberString(value) : value;
          default:
            return value;
        }
      });
    }

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values(this.lifecycleTerms)));
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.PAMEngineInstance.address);
    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor);
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should not overwrite an existing asset', async () => {
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.registerAsset(
        web3.utils.toHex(this.assetId),
        this.ownership,
        web3.utils.toHex(this.productId),
        this.state,
        this.PAMEngineInstance.address,
        actor
      ),
      'AssetRegistry.registerAsset: ' + ENTRY_ALREADY_EXISTS
    );
  });

  it('should let the actor overwrite and update the terms, state of an asset', async () => {
    // await this.AssetRegistryInstance.setTerms(
    //   web3.utils.toHex(this.assetId), 
    //   this.lifecycleTerms,
    //   { from: actor }
    // );

    await this.AssetRegistryInstance.setState(
      web3.utils.toHex(this.assetId), 
      this.state,
      { from: actor }
    );
  });

  it('should not let an unauthorized account overwrite and update the terms, state of an asset', async () => {
    // await shouldFail.reverting.withMessage(
    //   this.AssetRegistryInstance.setTerms(
    //     web3.utils.toHex(this.assetId), 
    //     this.lifecycleTerms,
    //   ),
    //   'AssetRegistry.onlyDesignatedActor: ' + UNAUTHORIZED_SENDER
    // );

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setState(
        web3.utils.toHex(this.assetId), 
        this.state,
      ),
      'AssetRegistry.onlyDesignatedActor: ' + UNAUTHORIZED_SENDER
    );
  });

  it('should register beneficiary (of payments corresponding to a CashflowId)', async () => {
    const cashflowIdA = 5;
    
    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdA, 
      cashflowIdBeneficiary,
      { from: recordCreatorBeneficiary }
    );
    
    const resultA = await this.AssetRegistryInstance.getCashflowBeneficiary(
      web3.utils.toHex(this.assetId), 
      cashflowIdA
    );
    assert.equal(resultA, cashflowIdBeneficiary);

    const cashflowIdB = -5;
    
    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdB, 
      cashflowIdBeneficiary,
      { from: counterpartyBeneficiary }
    );
    
    const resultB = await this.AssetRegistryInstance.getCashflowBeneficiary(web3
      .utils.toHex(this.assetId), 
      cashflowIdB
    );
    assert.equal(resultB, cashflowIdBeneficiary);


    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdA, 
      newCashflowBeneficiary,
      { from: cashflowIdBeneficiary }
    );
    
    const resultC = await this.AssetRegistryInstance.getCashflowBeneficiary(
      web3.utils.toHex(this.assetId), 
      cashflowIdA
    );
    assert.equal(resultC, newCashflowBeneficiary);
  });

  it('should not register beneficiary (of payments corresponding to a CashflowId) for an authorized sender', async () => {
    const cashflowIdA = 5;
    
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: recordCreatorObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    );

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: counterpartyObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    );

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdA, 
        cashflowIdBeneficiary,
        { from: counterpartyBeneficiary }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    );

    const cashflowIdB = -5;

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: counterpartyObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    );
    
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: recordCreatorObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    );

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: recordCreatorBeneficiary }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    );
  });

  it('should not register beneficiary with an invalid CashflowId', async () => {
    const cashflowId = 0;
    
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowId, 
        cashflowIdBeneficiary,
        { from: recordCreatorBeneficiary }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + INVALID_CASHFLOWID
    );
  });
});
