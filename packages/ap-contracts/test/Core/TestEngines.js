const { getTestCases } = require('actus-solidity/test/helper/tests');
const { parseTermsToGeneratingTerms, parseTermsToLifecycleTerms } = require('actus-solidity/test/helper/parser');

const { 
  setupTestEnvironment,
  parseTermsToProductTerms,
  parseTermsToCustomTerms 
} = require('../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../helper/blockchain');


contract('AssetActor', (accounts) => {
  // const issuer = accounts[0];
  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
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
    const generatingTerms = parseTermsToGeneratingTerms(terms);
    const lifecycleTerms = parseTermsToLifecycleTerms(terms);
    const productTerms = parseTermsToProductTerms(terms);
    const customTerms = parseTermsToCustomTerms(terms);
    const state = await this.PAMEngineInstance.computeInitialState(lifecycleTerms);
    const ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    const protoSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
    };
    const productId = 'Test Product 1';

    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(productId), productTerms, protoSchedules);
    
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      web3.utils.toHex(productId),
      customTerms,
      this.PAMEngineInstance.address
    );

    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));
    
    assert.deepEqual(storedState, state);
  });

  it('should initialize Asset with ContractType ANN', async () => {
    const assetId = 'ANN123';
    const terms = (await getTestCases('ANN'))['20001']['terms'];
    const generatingTerms = parseTermsToGeneratingTerms(terms);
    const lifecycleTerms = parseTermsToLifecycleTerms(terms);
    const productTerms = parseTermsToProductTerms(terms);
    const customTerms = parseTermsToCustomTerms(terms);
    const state = await this.ANNEngineInstance.computeInitialState(lifecycleTerms);
    const ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    const protoSchedules = {
      nonCyclicSchedule: await this.ANNEngineInstance.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
      cyclicIPSchedule: await this.ANNEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.ANNEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.ANNEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.ANNEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.ANNEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.ANNEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
    };
    const productId = 'Test Product 2';

    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(productId), productTerms, protoSchedules);

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
