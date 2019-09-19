const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');

const AssetActor = artifacts.require('AssetActor');

const { setupTestEnvironment } = require('../helper/setupTestEnvironment');
const { getTestCases } = require('actus-solidity/test/helper/tests');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../helper/blockchain');


contract('AssetActor', (accounts) => {
  const issuer = accounts[0];
  const recordCreatorObligor = accounts[1];
  const recordCreatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    snapshot = await createSnapshot()
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should initialize Asset with ContractType PAM', async () => {
    const assetId = 'PAM123';
    const terms = (await getTestCases('PAM'))['10001']['terms'];
    const state = await this.PAMEngineInstance.computeInitialState(terms, {});
    const ownership = {
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    await this.DemoAssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      terms,
      this.PAMEngineInstance.address
    );

    const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(web3.utils.toHex(assetId));

    assert.deepEqual(storedTerms['contractDealDate'], terms['contractDealDate'].toString());
    assert.deepEqual(storedState, state);
    assert.deepEqual(storedEngineAddress, this.PAMEngineInstance.address);

    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor);
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should initialize Asset with ContractType ANN', async () => {
    const assetId = 'ANN123';
    const terms = (await getTestCases('ANN'))['20001']['terms'];
    const state = await this.ANNEngineInstance.computeInitialState(terms, {});
    const ownership = {
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    await this.DemoAssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      terms,
      this.ANNEngineInstance.address
    );

    const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(web3.utils.toHex(assetId));

    assert.deepEqual(storedTerms['contractDealDate'], terms['contractDealDate'].toString());
    assert.deepEqual(storedState, state);
    assert.deepEqual(storedEngineAddress, this.ANNEngineInstance.address);

    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor);
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);  
  });
});
