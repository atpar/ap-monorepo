const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');
// const { decodeProtoEvent, removeNullProtoEvents, sortProtoEvents } = require('actus-solidity/test/helper/schedule');

const AssetActor = artifacts.require('AssetActor');
const ERC20SampleToken = artifacts.require('ERC20SampleToken');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');
const { 
  createSnapshot, 
  revertToSnapshot, 
  mineBlock
} = require('../helper/blockchain');


contract('AssetActor', (accounts) => {

  const recordCreatorObligor = accounts[1];
  const recordCreatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;
  let snapshot_asset;
  
  const getEventTime = async (protoEvent, terms) => {
    return await this.PAMEngineInstance.computeEventTimeForProtoEvent(protoEvent, terms);
  }

  // const computeEventId = async (protoEvent, terms) => {
  //   const  { eventType, scheduleTime } = decodeProtoEvent(protoEvent);
  //   const epochOffset = await this.PAMEngineInstance.getEpochOffset(eventType);

  //   return web3.utils.soliditySha3(eventType, Number(scheduleTime) + Number(epochOffset));
  // }

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.assetId = 'C123';
    this.terms = { 
      ...await getDefaultTerms(),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };
    this.state = await this.PAMEngineInstance.computeInitialState(this.terms);
    this.ownership = {
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };

    this.protoEventSchedules = {
      nonCyclicProtoEventSchedule: await this.PAMEngineInstance.computeNonCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate),
      cyclicIPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 8),
      cyclicPRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 15),
      cyclicSCProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 19),
      cyclicRRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 18),
      cyclicFPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 4),
      cyclicPYProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 11),
    };

    // deploy test ERC20 token
    this.PaymentTokenInstance = await ERC20SampleToken.new({ from: recordCreatorObligor });

    this.terms.currency = this.PaymentTokenInstance.address;

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should initialize an asset', async () => {
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(this.assetId),
      this.ownership,
      this.terms,
      this.protoEventSchedules,
      this.PAMEngineInstance.address
    );

    const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngineAddress(web3.utils.toHex(this.assetId));
    
    const storedNonCyclicProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getNonCyclicProtoEventAtIndex(
        web3.utils.toHex(this.assetId),
        i
      );

      storedNonCyclicProtoEventSchedule.push(protoEvent);
    }

    const storedCyclicIPProtoEventSchedule = [];
    for (let i = 0; i < 64; i++) {
      const protoEvent = await this.AssetRegistryInstance.getCyclicProtoEventAtIndex(
        web3.utils.toHex(this.assetId),
        8,
        i
      );
      
      storedCyclicIPProtoEventSchedule.push(protoEvent);
    }

    assert.deepEqual(storedTerms['contractDealDate'], this.terms['contractDealDate'].toString());
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.PAMEngineInstance.address);

    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor);
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);

    assert.deepEqual(storedNonCyclicProtoEventSchedule, this.protoEventSchedules.nonCyclicProtoEventSchedule);
    assert.deepEqual(storedCyclicIPProtoEventSchedule, this.protoEventSchedules.cyclicIPProtoEventSchedule);

    snapshot_asset = await createSnapshot();
  });

  it('should process next state with contract status equal to PF', async () => {
    const protoEvent = await this.AssetActorInstance.getNextProtoEvent(web3.utils.toHex(this.assetId), this.terms);
    const eventTime = await getEventTime(protoEvent, this.terms);

    const payoff = new BigNumber(await this.PAMEngineInstance.computePayoffForProtoEvent(
      this.terms, 
      this.state, 
      protoEvent,
      eventTime
    ));

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.approve(
      this.AssetActorInstance.address, 
      value,
      { from: recordCreatorObligor }
    );

    // settle and progress asset state
    await mineBlock(eventTime);
    const { tx: txHash } = await this.AssetActorInstance.progress(
      web3.utils.toHex(this.assetId), 
      { from: recordCreatorObligor }
    );
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );

    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const projectedNextState = await this.PAMEngineInstance.computeStateForProtoEvent(
      this.terms,
      this.state,
      protoEvent,
      eventTime
    );

    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.lastEventTime, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
    snapshot_asset = await createSnapshot();
  });

  it('should process next state with contract status equal to DL', async () => {
    const protoEvent = await this.AssetActorInstance.getNextProtoEvent(web3.utils.toHex(this.assetId), this.terms);
    const eventTime = await getEventTime(protoEvent, this.terms);

    // progress asset state
    await mineBlock(eventTime);

    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.computeStateForProtoEvent(
      this.terms,
      this.state,
      protoEvent,
      eventTime
    );
    
    // nonPerformingDate = eventTime of first event
    projectedNextState.nonPerformingDate = eventTime;
    projectedNextState[1] = eventTime;
    // contractPerformance = DL
    projectedNextState.contractPerformance = '1';
    projectedNextState[2] = '1';

    // compare results
    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.lastEventTime, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
    snapshot_asset = await createSnapshot();
  });

  it('should process next state with contract status equal to DQ', async () => {
    const protoEvent = await this.AssetActorInstance.getNextProtoEvent(web3.utils.toHex(this.assetId), this.terms);
    const eventTime = await getEventTime(protoEvent, this.terms);

    // progress asset state to after deliquency period
    await mineBlock(Number(eventTime) + 3000000);

    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.computeStateForProtoEvent(
      this.terms,
      this.state,
      protoEvent,
      eventTime
    );

    // nonPerformingDate = eventTime of first event
    projectedNextState.nonPerformingDate = eventTime;
    projectedNextState[1] = eventTime;
    // contractPerformance = DQ
    projectedNextState.contractPerformance = '2';
    projectedNextState[2] = '2';

    // compare results
    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.lastEventTime, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });
});
