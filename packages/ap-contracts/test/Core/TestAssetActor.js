const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');

const AssetActor = artifacts.require('AssetActor');
const ERC20SampleToken = artifacts.require('ERC20SampleToken');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');
const { 
  createSnapshot, 
  revertToSnapshot, 
  mineBlock,
  getLatestBlockTimestamp
} = require('../helper/blockchain');


contract('AssetActor', (accounts) => {
  const issuer = accounts[0];
  const recordCreatorObligor = accounts[1];
  const recordCreatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;
  let snapshot_asset;

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

    assert.deepEqual(storedTerms['contractDealDate'], this.terms['contractDealDate'].toString());
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.PAMEngineInstance.address);

    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor);
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);

    snapshot_asset = await createSnapshot();
  });

  // it('should process next state with contract status equal to PF', async () => {
  //   const protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
  //     this.terms,
  //     this.terms['contractDealDate'],
  //     this.terms['maturityDate']
  //   );
  //   const { 1: event } = await this.PAMEngineInstance.computeNextStateForProtoEvent(
  //     this.terms, 
  //     this.state, 
  //     protoEventSchedule[0],
  //     protoEventSchedule[0].eventTime
  //   );

  //   const eventTime = event.eventTime;
  //   const payoff = new BigNumber(event.payoff);
  //   const cashflowId = (payoff.isGreaterThan(0)) ? Number(event.eventType) + 1 : (Number(event.eventType) + 1) * -1;
  //   const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());
  //   const eventId = web3.utils.soliditySha3(event.eventType, protoEventSchedule[0].eventTimeWithEpochOffset);

  //   // set allowance for Payment Router
  //   await this.PaymentTokenInstance.approve(
  //     this.PaymentRouterInstance.address, 
  //     value,
  //     { from: recordCreatorObligor }
  //   );

  //   // settle obligations
  //   await this.PaymentRouterInstance.settlePayment(
  //     web3.utils.toHex(this.assetId),
  //     cashflowId,
  //     eventId,
  //     this.PaymentTokenInstance.address,
  //     value,
  //     { from: recordCreatorObligor }
  //   );

  //   // progress asset state
  //   await mineBlock(eventTime);
  //   const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
  //   const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
  //     txHash, AssetActor, 'AssetProgressed'
  //   );

  //   const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
  //   const { 0: projectedNextState } = await this.PAMEngineInstance.computeNextState(
  //     this.terms,
  //     this.state,
  //     eventTime
  //   );

  //   assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
  //   assert.equal(storedNextState.lastEventTime, eventTime);
  //   assert.deepEqual(storedNextState, projectedNextState);

  //   await revertToSnapshot(snapshot_asset);
  //   snapshot_asset = await createSnapshot();
  // });

  // it('should process next state with contract status equal to DL', async () => {
  //   // compute event schedule
  //   const protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
  //     this.terms,
  //     this.terms['contractDealDate'],
  //     this.terms['maturityDate']
  //   );

  //   const eventTime = protoEventSchedule[0].eventTime;

  //   // progress asset state
  //   await mineBlock(eventTime);

  //   const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
  //   const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
  //     txHash, AssetActor, 'AssetProgressed'
  //   );
  //   const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

  //   // compute expected next state
  //   const { 0: projectedNextState } = await this.PAMEngineInstance.computeNextState(
  //     this.terms,
  //     this.state,
  //     eventTime
  //   );
    
  //   // nonPerformingDate = eventTime of first event
  //   projectedNextState.nonPerformingDate = protoEventSchedule[0].eventTime;
  //   projectedNextState[1] = protoEventSchedule[0].eventTime;
  //   // contractPerformance = DL
  //   projectedNextState.contractPerformance = '1';
  //   projectedNextState[2] = '1';

  //   // compare results
  //   assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
  //   assert.equal(storedNextState.lastEventTime, eventTime);
  //   assert.deepEqual(storedNextState, projectedNextState);

  //   await revertToSnapshot(snapshot_asset);
  //   snapshot_asset = await createSnapshot();
  // });

  // it('should process next state with contract status equal to DQ', async () => {
  //   // compute event schedule
  //   const protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
  //     this.terms,
  //     this.terms['contractDealDate'],
  //     this.terms['maturityDate']
  //   );

  //   const eventTime = protoEventSchedule[2].eventTime;

  //   // progress asset state
  //   await mineBlock(Number(eventTime) + 1);

  //   const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
  //   const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
  //     txHash, AssetActor, 'AssetProgressed'
  //   );
  //   const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

  //   // compute expected next state
  //   const { 0: projectedNextState } = await this.PAMEngineInstance.computeNextState(
  //     this.terms,
  //     this.state,
  //     eventTime
  //   );

  //   // nonPerformingDate = eventTime of first event
  //   projectedNextState.nonPerformingDate = protoEventSchedule[0].eventTime;
  //   projectedNextState[1] = protoEventSchedule[0].eventTime;
  //   // contractPerformance = DQ
  //   projectedNextState.contractPerformance = '2';
  //   projectedNextState[2] = '2';

  //   // compare results
  //   assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
  //   assert.equal(storedNextState.lastEventTime, eventTime);
  //   assert.deepEqual(storedNextState, projectedNextState);

  //   await revertToSnapshot(snapshot_asset);
  // });
});
