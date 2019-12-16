const { getTestCases } = require('actus-solidity/test/helper/tests');

const { setupTestEnvironment } = require('../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../helper/blockchain');
const { deriveTerms, registerProduct } = require('../helper/utils');


contract('AssetActor', (accounts) => {
  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    snapshot = await createSnapshot()
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should initialize Asset with ContractType PAM', async () => {
    const assetId = 'PAM123';
    const terms = (await getTestCases('PAM'))['10001']['terms'];
    const { customTerms, lifecycleTerms } = deriveTerms(terms);
    const state = await this.ANNEngineInstance.computeInitialState(lifecycleTerms);
    const ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
  
    // register product
    const productId = await registerProduct(this.instances, terms);

    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      web3.utils.toHex(productId),
      customTerms,
      this.ANNEngineInstance.address
    );

    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));

    assert.deepEqual(storedState, state);
  });

  it('should initialize Asset with ContractType ANN', async () => {
    const assetId = 'ANN123';
    const terms = (await getTestCases('ANN'))['20001']['terms'];
    const { customTerms, lifecycleTerms } = deriveTerms(terms);
    const state = await this.ANNEngineInstance.computeInitialState(lifecycleTerms);
    const ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
  
    // register product
    const productId = await registerProduct(this.instances, terms);

    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      web3.utils.toHex(productId),
      customTerms,
      this.ANNEngineInstance.address
    );

    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));

    assert.deepEqual(storedState, state);
  });
});
