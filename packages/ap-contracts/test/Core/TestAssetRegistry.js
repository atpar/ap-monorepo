const { shouldFail } = require('openzeppelin-test-helpers');

const { setupTestEnvironment, getComplexTerms, deployPaymentToken } = require('../helper/setupTestEnvironment');
const { deriveTerms, registerTemplateFromTerms, encodeCustomTerms, ZERO_BYTES32, ZERO_ADDRESS } = require('../helper/utils');

const ENTRY_ALREADY_EXISTS = 'ENTRY_ALREADY_EXISTS';
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER';
const INVALID_CASHFLOWID = 'INVALID_CASHFLOWID';


contract('AssetRegistry', (accounts) => {
  const actor = accounts[1];

  const creatorObligor = accounts[2];
  const creatorBeneficiary = accounts[3];
  const counterpartyObligor = accounts[4];
  const counterpartyBeneficiary = accounts[5];
  
  const cashflowIdBeneficiary = accounts[6];
  const newCashflowBeneficiary = accounts[7];

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.assetId = 'C123';
    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = {
      ...getComplexTerms(),
      contractReference_1: {
        object: ZERO_BYTES32,
        contractReferenceType: 0,
        contractReferenceRole: 0
      },
      contractReference_2: {
        object: ZERO_BYTES32,
        contractReferenceType: 0,
        contractReferenceRole: 0
      },
    };

    this.overwrittenAttributeValues = {
      calendar: '0',
      contractRole: '2',
      dayCountConvention: '4',
      businessDayConvention: '6',
      endOfMonthConvention: '0',
      scalingEffect: '5',
      penaltyType: '3',
      feeBasis: '0',
      creditEventTypeCovered: '3',
      notionalPrincipal: web3.utils.toWei('22'),
      nominalInterestRate: web3.utils.toWei('3.5'),
      periodFloor: '10'
    };

    this.customTerms = encodeCustomTerms(
      this.terms.contractDealDate,
      this.overwrittenAttributeValues
    );

    // register template
    ({ lifecycleTerms: this.lifecycleTerms, templateTerms: this.templateTerms } = deriveTerms(this.terms));
    this.templateId = await registerTemplateFromTerms(this.instances, this.terms);
    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
  });

  it('should register an asset', async () => {
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(this.assetId),
      this.ownership,
      web3.utils.toHex(this.templateId),
      this.customTerms,
      this.state,
      this.PAMEngineInstance.address,
      actor,
      ZERO_ADDRESS
    );
    
    const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngine(web3.utils.toHex(this.assetId));
    
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
            return (web3.utils.isHexStrict(value) && value.length < 42)
              ? web3.utils.hexToNumberString(value)
              : (value !== '0x0000000000000000000000000000000000000000000000000000000000000000')
                ? value
                : "0";
          default:
            return value;
        }
      });
    }

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values({ ...this.lifecycleTerms, ...this.overwrittenAttributeValues })));
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.PAMEngineInstance.address);
    assert.equal(storedOwnership.creatorObligor, creatorObligor);
    assert.equal(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should not overwrite an existing asset', async () => {
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.registerAsset(
        web3.utils.toHex(this.assetId),
        this.ownership,
        web3.utils.toHex(this.templateId),
        this.customTerms,
        this.state,
        this.PAMEngineInstance.address,
        actor,
        ZERO_ADDRESS
      ),
      'AssetRegistry.registerAsset: ' + ENTRY_ALREADY_EXISTS
    );
  });

  it('should let the actor overwrite and update the terms, state of an asset', async () => {
    await this.AssetRegistryInstance.setState(
      web3.utils.toHex(this.assetId), 
      this.state,
      { from: actor }
    );
  });

  it('should not let an unauthorized account overwrite and update the terms, state of an asset', async () => {
    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setState(
        web3.utils.toHex(this.assetId), 
        this.state,
      ),
      'AssetRegistry.isAuthorized: ' + UNAUTHORIZED_SENDER
    );
  });

  it('should register beneficiary (of payments corresponding to a CashflowId)', async () => {
    const cashflowIdA = 5;
    
    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(this.assetId), 
      cashflowIdA, 
      cashflowIdBeneficiary,
      { from: creatorBeneficiary }
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
        { from: creatorObligor }
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
        { from: creatorObligor }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + UNAUTHORIZED_SENDER
    );

    await shouldFail.reverting.withMessage(
      this.AssetRegistryInstance.setBeneficiaryForCashflowId(
        web3.utils.toHex(this.assetId), 
        cashflowIdB, 
        cashflowIdBeneficiary,
        { from: creatorBeneficiary }
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
        { from: creatorBeneficiary }
      ),
      'AssetRegistry.setBeneficiaryForCashflowId: ' + INVALID_CASHFLOWID
    );
  });
});
