const { expectEvent } = require('openzeppelin-test-helpers');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { convertDatesToOffsets, parseTermsToProductTerms, parseTermsToCustomTerms } = require('../../helper/setupTestEnvironment');

const AssetActor = artifacts.require('AssetActor');

const { setupTestEnvironment } = require('../../helper/setupTestEnvironment');
const { 
  createSnapshot, 
  revertToSnapshot, 
  mineBlock
} = require('../../helper/blockchain');

const ExternalDataTerms = require('../../helper/terms/external-data-terms.json');


contract('AssetActor', (accounts) => {

  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;
  let snapshot_asset;
  
  const getEventTime = async (_event, lifecycleTerms) => {
    return Number(await this.PAMEngineInstance.computeEventTimeForEvent(_event, lifecycleTerms));
  }

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should process next state with external rate', async () => {
    // schedule with RR
    const terms = ExternalDataTerms;
    const lifecycleTerms = parseTermsToLifecycleTerms(terms);
    const productTerms = parseTermsToProductTerms(terms);
    const generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(terms));
    const customTerms = parseTermsToCustomTerms(terms);

    const ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };

    const productSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11),
    };

    // only want RR events in the schedules
    productSchedules.nonCyclicSchedule = productSchedules.cyclicPYSchedule;
    productSchedules.nonCyclicSchedule = productSchedules.cyclicPYSchedule;
    
    // store product
    const assetId = 'External Data Asset';
    const productId = 'External Data Product';
    const resetRate = 500000;

    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(productId), productTerms, productSchedules);

    await this.AssetActorInstance.initialize(
      web3.utils.toHex(assetId),
      ownership,
      web3.utils.toHex(productId),
      customTerms,
      this.PAMEngineInstance.address
    );

    const initialState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));
    const _event = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(assetId));
    const eventTime = await getEventTime(_event, terms);
    
    await mineBlock(Number(eventTime));
    
    await this.MarketObjectRegistryInstance.setMarketObjectProvider(
      terms.marketObjectCodeRateReset,
      accounts[0]
      );
      
    await this.MarketObjectRegistryInstance.publishDataPointOfMarketObject(
      terms.marketObjectCodeRateReset,
      eventTime,
      resetRate
    );
        
    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(assetId));

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.computeStateForEvent(
      lifecycleTerms,
      initialState,
      _event,
      web3.utils.toHex(resetRate)
    );

    // compare results
    assert.equal(web3.utils.hexToUtf8(emittedAssetId), assetId);
    assert.equal(storedNextState.statusDate, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });
});
