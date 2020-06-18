const { shouldFail } = require('openzeppelin-test-helpers');

const { setupTestEnvironment } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, parseTerms, ZERO_BYTES32, ZERO_ADDRESS } = require('../../../helper/utils');

const ASSET_ALREADY_EXISTS = 'ASSET_ALREADY_EXISTS';
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER';


contract('CEGRegistry', (accounts) => {
  const actor = accounts[1];

  const creatorObligor = accounts[2];
  const creatorBeneficiary = accounts[3];
  const counterpartyObligor = accounts[4];
  const counterpartyBeneficiary = accounts[5];
  
  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.assetId = 'CEG_01';
    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = require('../../../helper/terms/CEGTerms-complex.json');
    this.schedule = await generateSchedule(this.CEGEngineInstance, this.terms);
    this.state = await this.CEGEngineInstance.computeInitialState(this.terms);
  });

  it('should register an asset', async () => {
    await this.CEGRegistryInstance.registerAsset(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.state,
      this.schedule,
      this.ownership,
      this.CEGEngineInstance.address,
      actor,
      ZERO_ADDRESS
    );
    
    const storedTerms = await this.CEGRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.CEGRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.CEGRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));
    const storedEngineAddress = await this.CEGRegistryInstance.getEngine(web3.utils.toHex(this.assetId));

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values({ ...this.terms })));
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.CEGEngineInstance.address);
    assert.equal(storedOwnership.creatorObligor, creatorObligor);
    assert.equal(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should not overwrite an existing asset', async () => {
    await shouldFail.reverting.withMessage(
      this.CEGRegistryInstance.registerAsset(
        web3.utils.toHex(this.assetId),
        this.terms,
        this.state,
        this.schedule,
        this.ownership,
        this.CEGEngineInstance.address,
        actor,
        ZERO_ADDRESS
      ),
      'BaseRegistry.setAsset: ' + ASSET_ALREADY_EXISTS
    );
  });

  it('should let the actor overwrite and update the terms, state of an asset', async () => {
    await this.CEGRegistryInstance.setState(
      web3.utils.toHex(this.assetId), 
      this.state,
      { from: actor }
    );
  });

  it('should not let an unauthorized account overwrite and update the terms, state of an asset', async () => {
    await shouldFail.reverting.withMessage(
      this.CEGRegistryInstance.setState(
        web3.utils.toHex(this.assetId), 
        this.state,
      ),
      'AccessControl.isAuthorized: ' + UNAUTHORIZED_SENDER
    );
  });
});
