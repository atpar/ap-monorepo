const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');
const { parseTermsToLifecycleTerms, parseTermsToGeneratingTerms } = require('actus-solidity/test/helper/parser');

const { convertDatesToOffsets, parseTermsToProductTerms, parseTermsToCustomTerms } = require('../helper/setupTestEnvironment');

const AssetActor = artifacts.require('AssetActor');
const ERC20SampleToken = artifacts.require('ERC20SampleToken');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');
const { 
  createSnapshot, 
  revertToSnapshot, 
  mineBlock
} = require('../helper/blockchain');

const ExternalDataTerms = require('../helper/external-data-terms.json');


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

    this.assetId = 'C123';
    this.terms = { 
      ...await getDefaultTerms(),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };
    this.ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };

    // deploy test ERC20 token
    this.PaymentTokenInstance = await ERC20SampleToken.new({ from: creatorObligor });
    
    // set address of payment token as currency in terms
    this.terms.currency = this.PaymentTokenInstance.address;

    this.terms.statusDate = this.terms.contractDealDate;
    
    // derive LifecycleTerms, GeneratingTerms, ProductTerms and CustomTerms
    this.lifecycleTerms = parseTermsToLifecycleTerms(this.terms);
    this.generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(this.terms));
    this.productTerms = parseTermsToProductTerms(this.terms);
    this.customTerms = parseTermsToCustomTerms(this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);
    
    this.productSchedules = {
      nonCyclicSchedule: await this.PAMEngineInstance.computeNonCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate),
      cyclicIPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 8),
      cyclicPRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 15),
      cyclicSCSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 19),
      cyclicRRSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 18),
      cyclicFPSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 4),
      cyclicPYSchedule: await this.PAMEngineInstance.computeCyclicScheduleSegment(this.generatingTerms, this.generatingTerms.contractDealDate, this.generatingTerms.maturityDate, 11),
    };

    this.productId = 'Test Product';

    await this.ProductRegistryInstance.registerProduct(web3.utils.toHex(this.productId), this.productTerms, this.productSchedules);

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should initialize an asset', async () => {
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(this.assetId),
      this.ownership,
      web3.utils.toHex(this.productId),
      this.customTerms,
      this.PAMEngineInstance.address
    );

    // const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(web3.utils.toHex(this.assetId));

    // assert.deepEqual(storedTerms['initialExchangeDate'], this.terms['initialExchangeDate'].toString());
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.PAMEngineInstance.address);

    assert.equal(storedOwnership.creatorObligor, creatorObligor);
    assert.equal(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);

    snapshot_asset = await createSnapshot();
  });

  it('should process next state with contract status equal to PF', async () => {
    const _event = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(this.assetId));
    const eventTime = await getEventTime(_event, this.lifecycleTerms)

    const payoff = new BigNumber(await this.PAMEngineInstance.computePayoffForEvent(
      this.lifecycleTerms, 
      this.state, 
      _event,
      web3.utils.toHex(eventTime)
    ));

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.approve(
      this.AssetActorInstance.address,
      value,
      { from: creatorObligor }
    );

    // settle and progress asset state
    await mineBlock(eventTime);
    const { tx: txHash } = await this.AssetActorInstance.progress(
      web3.utils.toHex(this.assetId), 
      { from: creatorObligor }
    );
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );

    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const projectedNextState = await this.PAMEngineInstance.computeStateForEvent(
      this.lifecycleTerms,
      this.state,
      _event,
      web3.utils.toHex(eventTime)
    );

    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.statusDate, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
    snapshot_asset = await createSnapshot();
  });

  it('should process next state with contract status equal to DL', async () => {
    const _event = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(this.assetId));
    const eventTime = await getEventTime(_event, this.lifecycleTerms);

    // progress asset state
    await mineBlock(eventTime);

    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.computeStateForEvent(
      this.lifecycleTerms,
      this.state,
      _event,
      web3.utils.toHex(eventTime)
    );
    
    // nonPerformingDate = eventTime of first event
    projectedNextState.nonPerformingDate = String(eventTime);
    projectedNextState[2] = String(eventTime);
    // contractPerformance = DL
    projectedNextState.contractPerformance = '1';
    projectedNextState[0] = '1';

    // compare results
    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.statusDate, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
    snapshot_asset = await createSnapshot();
  });

  it('should process next state with contract status equal to DQ', async () => {
    const _event = await this.AssetRegistryInstance.getNextEvent(web3.utils.toHex(this.assetId));
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state to after deliquency period
    await mineBlock(Number(eventTime) + 3000000);

    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.computeStateForEvent(
      this.lifecycleTerms,
      this.state,
      _event,
      web3.utils.toHex(eventTime)
    );

    // nonPerformingDate = eventTime of first event
    projectedNextState.nonPerformingDate = String(eventTime);
    projectedNextState[2] = String(eventTime);
    // contractPerformance = DQ
    projectedNextState.contractPerformance = '2';
    projectedNextState[0] = '2';

    // compare results
    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.statusDate, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });

  it('should process next state with external rate', async () => {
    // schedule with RR
    const terms = ExternalDataTerms;
    const lifecycleTerms = parseTermsToLifecycleTerms(terms);
    const productTerms = parseTermsToProductTerms(terms);
    const generatingTerms = convertDatesToOffsets(parseTermsToGeneratingTerms(terms));
    const customTerms = parseTermsToCustomTerms(terms);

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
      this.ownership,
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
