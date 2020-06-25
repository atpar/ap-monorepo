const { shouldFail } = require('openzeppelin-test-helpers');

const { setupTestEnvironment } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, parseTerms, ZERO_BYTES32, ZERO_ADDRESS } = require('../../../helper/utils');

const ASSET_ALREADY_EXISTS = 'ASSET_ALREADY_EXISTS';
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER';


contract('CERTFRegistry', (accounts) => {
  const actor = accounts[1];

  const creatorObligor = accounts[2];
  const creatorBeneficiary = accounts[3];
  const counterpartyObligor = accounts[4];
  const counterpartyBeneficiary = accounts[5];
  
  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.assetId = 'CERTF_01';
    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = require('../../../helper/terms/CERTFTerms-complex.json');
    this.schedule = await generateSchedule(this.CERTFEngineInstance, this.terms);
    this.state = await this.CERTFEngineInstance.computeInitialState(this.terms);
  });

  it('should register an asset', async () => {
    await this.CERTFRegistryInstance.registerAsset(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.state,
      this.schedule,
      this.ownership,
      this.CERTFEngineInstance.address,
      actor,
      ZERO_ADDRESS
    );
    
    const storedTerms = await this.CERTFRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.CERTFRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.CERTFRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));
    const storedEngineAddress = await this.CERTFRegistryInstance.getEngine(web3.utils.toHex(this.assetId));

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values({ ...this.terms })));
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.CERTFEngineInstance.address);
    assert.equal(storedOwnership.creatorObligor, creatorObligor);
    assert.equal(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should not overwrite an existing asset', async () => {
    await shouldFail.reverting.withMessage(
      this.CERTFRegistryInstance.registerAsset(
        web3.utils.toHex(this.assetId),
        this.terms,
        this.state,
        this.schedule,
        this.ownership,
        this.CERTFEngineInstance.address,
        actor,
        ZERO_ADDRESS
      ),
      'BaseRegistry.setAsset: ' + ASSET_ALREADY_EXISTS
    );
  });

  it('should let the actor overwrite and update the terms, state of an asset', async () => {
    await this.CERTFRegistryInstance.setState(
      web3.utils.toHex(this.assetId), 
      this.state,
      { from: actor }
    );
  });

  it('should not let an unauthorized account overwrite and update the terms, state of an asset', async () => {
    await shouldFail.reverting.withMessage(
      this.CERTFRegistryInstance.setState(
        web3.utils.toHex(this.assetId), 
        this.state,
      ),
      'AccessControl.isAuthorized: ' + UNAUTHORIZED_SENDER
    );
  });
});
