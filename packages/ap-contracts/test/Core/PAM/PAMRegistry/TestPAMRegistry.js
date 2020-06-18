const { shouldFail } = require('openzeppelin-test-helpers');

const { setupTestEnvironment } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, parseTerms, ZERO_BYTES32, ZERO_ADDRESS } = require('../../../helper/utils');

const ASSET_ALREADY_EXISTS = 'ASSET_ALREADY_EXISTS';
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER';


contract('PAMRegistry', (accounts) => {
  const actor = accounts[1];

  const creatorObligor = accounts[2];
  const creatorBeneficiary = accounts[3];
  const counterpartyObligor = accounts[4];
  const counterpartyBeneficiary = accounts[5];
  
  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.assetId = 'PAM_01';
    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = require('../../../helper/terms/PAMTerms-complex.json');
    this.schedule = await generateSchedule(this.PAMEngineInstance, this.terms);
    this.state = await this.PAMEngineInstance.computeInitialState(this.terms);
  });

  it('should register an asset', async () => {
    await this.PAMRegistryInstance.registerAsset(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.state,
      this.schedule,
      this.ownership,
      this.PAMEngineInstance.address,
      actor,
      ZERO_ADDRESS
    );
    
    const storedTerms = await this.PAMRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.PAMRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.PAMRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));
    const storedEngineAddress = await this.PAMRegistryInstance.getEngine(web3.utils.toHex(this.assetId));

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values({ ...this.terms })));
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.PAMEngineInstance.address);
    assert.equal(storedOwnership.creatorObligor, creatorObligor);
    assert.equal(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should not overwrite an existing asset', async () => {
    await shouldFail.reverting.withMessage(
      this.PAMRegistryInstance.registerAsset(
        web3.utils.toHex(this.assetId),
        this.terms,
        this.state,
        this.schedule,
        this.ownership,
        this.PAMEngineInstance.address,
        actor,
        ZERO_ADDRESS
      ),
      'BaseRegistry.setAsset: ' + ASSET_ALREADY_EXISTS
    );
  });

  it('should let the actor overwrite and update the terms, state of an asset', async () => {
    await this.PAMRegistryInstance.setState(
      web3.utils.toHex(this.assetId), 
      this.state,
      { from: actor }
    );
  });

  it('should not let an unauthorized account overwrite and update the terms, state of an asset', async () => {
    await shouldFail.reverting.withMessage(
      this.PAMRegistryInstance.setState(
        web3.utils.toHex(this.assetId), 
        this.state,
      ),
      'AccessControl.isAuthorized: ' + UNAUTHORIZED_SENDER
    );
  });
});
