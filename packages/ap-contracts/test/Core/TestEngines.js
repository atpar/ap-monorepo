const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');
const { getTestCases } = require('actus-solidity/test/helper/tests');
const { parseTermsToGeneratingTerms, parseTermsToLifecycleTerms } = require('actus-solidity/test/helper/parser');

const AssetActor = artifacts.require('AssetActor');

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

    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      lifecycleTerms,
      protoEventSchedules,
      this.PAMEngineInstance.address
    );

    const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(web3.utils.toHex(assetId));

    const storedNonCyclicProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getNonCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        i
      );

      storedNonCyclicProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicIPProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        8,
        i
      );
      
      storedCyclicIPProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicPRProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        15,
        i
      );
      
      storedCyclicPRProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicSCProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        19,
        i
      );
      
      storedCyclicSCProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicRRProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        18,
        i
      );
      
      storedCyclicRRProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicFPProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        4,
        i
      );
      
      storedCyclicFPProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicPYProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        11,
        i
      );
      
      storedCyclicPYProtoEventSchedule.push(protoEvent);
    }
    
    assert.deepEqual(storedTerms['initialExchangeDate'], lifecycleTerms['initialExchangeDate'].toString());
    assert.deepEqual(storedState, state);
    assert.deepEqual(storedEngineAddress, this.PAMEngineInstance.address);

    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor);
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);

    assert.deepEqual(storedNonCyclicProtoEventSchedule, protoEventSchedules.nonCyclicProtoEventSchedule);
    assert.deepEqual(storedCyclicIPProtoEventSchedule, protoEventSchedules.cyclicIPProtoEventSchedule);
    assert.deepEqual(storedCyclicPRProtoEventSchedule, protoEventSchedules.cyclicPRProtoEventSchedule);
    assert.deepEqual(storedCyclicSCProtoEventSchedule, protoEventSchedules.cyclicSCProtoEventSchedule);
    assert.deepEqual(storedCyclicRRProtoEventSchedule, protoEventSchedules.cyclicRRProtoEventSchedule);
    assert.deepEqual(storedCyclicFPProtoEventSchedule, protoEventSchedules.cyclicFPProtoEventSchedule);
    assert.deepEqual(storedCyclicPYProtoEventSchedule, protoEventSchedules.cyclicPYProtoEventSchedule);
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

    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      lifecycleTerms,
      protoEventSchedules,
      this.ANNEngineInstance.address
    );

    const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(web3.utils.toHex(assetId));

    const storedNonCyclicProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getNonCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        i
      );

      storedNonCyclicProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicIPProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        8,
        i
      );
      
      storedCyclicIPProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicPRProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        15,
        i
      );
      
      storedCyclicPRProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicSCProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        19,
        i
      );
      
      storedCyclicSCProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicRRProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        18,
        i
      );
      
      storedCyclicRRProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicFPProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        4,
        i
      );
      
      storedCyclicFPProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicPYProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(assetId),
        11,
        i
      );
      
      storedCyclicPYProtoEventSchedule.push(protoEvent);
    }

    assert.deepEqual(storedTerms['initialExchangeDate'], lifecycleTerms['initialExchangeDate'].toString());
    assert.deepEqual(storedState, state);
    assert.deepEqual(storedEngineAddress, this.ANNEngineInstance.address);

    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor);
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);  

    assert.deepEqual(storedNonCyclicProtoEventSchedule, protoEventSchedules.nonCyclicProtoEventSchedule);
    assert.deepEqual(storedCyclicIPProtoEventSchedule, protoEventSchedules.cyclicIPProtoEventSchedule);
    assert.deepEqual(storedCyclicPRProtoEventSchedule, protoEventSchedules.cyclicPRProtoEventSchedule);
    assert.deepEqual(storedCyclicSCProtoEventSchedule, protoEventSchedules.cyclicSCProtoEventSchedule);
    assert.deepEqual(storedCyclicRRProtoEventSchedule, protoEventSchedules.cyclicRRProtoEventSchedule);
    assert.deepEqual(storedCyclicFPProtoEventSchedule, protoEventSchedules.cyclicFPProtoEventSchedule);
    assert.deepEqual(storedCyclicPYProtoEventSchedule, protoEventSchedules.cyclicPYProtoEventSchedule);
  });
});
