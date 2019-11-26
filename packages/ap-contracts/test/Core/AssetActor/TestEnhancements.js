const { expectEvent } = require('openzeppelin-test-helpers');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { convertDatesToOffsets, parseTermsToProductTerms, parseTermsToCustomTerms } = require('../../helper/setupTestEnvironment');

const { setupTestEnvironment, getDefaultTerms } = require('../../helper/setupTestEnvironment');

const ERC20SampleToken = artifacts.require('ERC20SampleToken');

const { 
  createSnapshot, 
  revertToSnapshot, 
  mineBlock
} = require('../../helper/blockchain');

const CECTerms = require('../../helper/cec-terms.json');


contract('AssetActor', (accounts) => {

  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;
  let snapshot_asset;


  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.underylingAssetId = 'C123';
    const terms = { 
      ...await getDefaultTerms(),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };
    // deploy test ERC20 token
    this.PaymentTokenInstance = await ERC20SampleToken.new({ from: creatorObligor });
    // set address of payment token as currency in terms
    terms.currency = this.PaymentTokenInstance.address;
    terms.statusDate = terms.contractDealDate;
    // derive LifecycleTerms, GeneratingTerms, ProductTerms and CustomTerms
    // const lifecycleTerms = parseTermsToLifecycleTerms(terms);
    const generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(terms));
    const productTerms = parseTermsToProductTerms(terms);
    const customTerms = parseTermsToCustomTerms(terms);
    // // compute the initial state
    // const state = await this.PAMEngineInstance.computeInitialState(lifecycleTerms);
    // compute schedules for asset
    const productSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
    };
    const productId = 'Test Product';
    // register new product
    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(productId), productTerms, productSchedules);
    // initialize underlying asset
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(this.underylingAssetId),
      { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary },
      web3.utils.toHex(productId),
      customTerms,
      this.PAMEngineInstance.address
    );

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should trigger ...', async () => {
    const terms = CECTerms;
    // derive LifecycleTerms, GeneratingTerms, ProductTerms and CustomTerms
    const lifecycleTerms = parseTermsToLifecycleTerms(terms);
    const generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(terms));
    const productTerms = parseTermsToProductTerms(terms);
    const customTerms = parseTermsToCustomTerms(terms);
    // // compute the initial state
    // const state = await this.PAMEngineInstance.computeInitialState(lifecycleTerms);
    // compute schedules for asset
    const productSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
    };
    const productId = 'Test Collateral Product';
    // register new product
    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(productId), productTerms, productSchedules);
    // issue collateral asset
    await this.AssetIssuer.issueFromDraft(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      productId,
      customTerms,
      ...,
      this.Custodian.address,
      this.CECEngineInstance.address,
      this.AssetActorInstance.address
    );

  });

});