const { getTestCases } = require('actus-solidity/test/helper/tests');
const { parseTermsToGeneratingTerms, parseTermsToLifecycleTerms } = require('actus-solidity/test/helper/parser');

const { setupTestEnvironment } = require('../helper/setupTestEnvironment');
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
    const generatingTerms = parseTermsToGeneratingTerms(terms);
    const lifecycleTerms = parseTermsToLifecycleTerms(terms);
    const state = await this.PAMEngineInstance.computeInitialState(terms);
    const ownership = {
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    const protoEventSchedules = {
      nonCyclicProtoEventSchedule: await this.PAMEngineInstance.computeNonCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
      cyclicIPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
      cyclicPRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
      cyclicSCProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
      cyclicRRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
      cyclicFPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
      cyclicPYProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
    };
    const productId = 'Test Product 1';

    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(productId), lifecycleTerms, protoEventSchedules);
    
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      web3.utils.toHex(productId),
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
    const state = await this.ANNEngineInstance.computeInitialState(terms);
    const ownership = {
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    const protoEventSchedules = {
      nonCyclicProtoEventSchedule: await this.ANNEngineInstance.computeNonCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
      cyclicIPProtoEventSchedule: await this.ANNEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
      cyclicPRProtoEventSchedule: await this.ANNEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
      cyclicSCProtoEventSchedule: await this.ANNEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
      cyclicRRProtoEventSchedule: await this.ANNEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
      cyclicFPProtoEventSchedule: await this.ANNEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
      cyclicPYProtoEventSchedule: await this.ANNEngineInstance.computeCyclicProtoEventScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
    };
    const productId = 'Test Product 2';

    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(productId), lifecycleTerms, protoEventSchedules);

    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      web3.utils.toHex(productId),
      this.ANNEngineInstance.address
    );

    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));

    assert.deepEqual(storedState, state);
  });
});
