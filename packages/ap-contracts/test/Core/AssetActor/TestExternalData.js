const { expectEvent } = require('openzeppelin-test-helpers');
const AssetActor = artifacts.require('AssetActor');

const { setupTestEnvironment } = require('../../helper/setupTestEnvironment');
const { 
  createSnapshot, 
  revertToSnapshot, 
  mineBlock
} = require('../../helper/blockchain');

const { deriveProductId } = require('../../helper/orderUtils');
const { deriveTerms, generateProductSchedules, getEngineContractInstanceForContractType } = require('../../helper/utils');

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
    this.instances = await setupTestEnvironment();
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should process next state with external rate', async () => {
    const ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    // schedule with RR
    const terms = ExternalDataTerms;

    // register product
    const { lifecycleTerms, customTerms, generatingTerms, productTerms } = deriveTerms(terms);
    const productSchedules = await generateProductSchedules(
      getEngineContractInstanceForContractType(this.instances, terms.contractType),
      generatingTerms
    ); 
    // only want RR events in the schedules
    productSchedules.nonCyclicSchedule = productSchedules.cyclicPYSchedule;
    productSchedules.nonCyclicSchedule = productSchedules.cyclicPYSchedule;
    await this.instances.ProductRegistryInstance.registerProduct(productTerms, productSchedules);
    const productId = deriveProductId(productTerms, productSchedules);
    
    // store product
    const assetId = 'External Data Asset';
    const resetRate = 500000

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
      txHash, AssetActor, 'ProgressedAsset'
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
