const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');

const AssetActor = artifacts.require('AssetActor');

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
    this.terms = await getDefaultTerms();
    this.state = await this.PAMEngineInstance.computeInitialState(this.terms, {});
    this.ownership = {
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    
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

  it('should process next state with contract status equal to PF', async () => {
    const protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.terms,
      this.terms['contractDealDate'],
      this.terms['maturityDate']
    );
    const { 1: event } = await this.PAMEngineInstance.computeNextStateForProtoEvent(
      this.terms, 
      this.state, 
      protoEventSchedule[0],
      await getLatestBlockTimestamp()
    );

    const eventTime = event.eventTime;
    const payoff = new BigNumber(event.payoff);
    const cashflowId = (payoff.isGreaterThan(0)) ? Number(event.eventType) + 1 : (Number(event.eventType) + 1) * -1;
    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());
    const eventId = web3.utils.soliditySha3(event.eventType, protoEventSchedule[0].eventTimeWithEpochOffset);

    // settle obligations
    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(this.assetId),
      cashflowId,
      eventId,
      '0x0000000000000000000000000000000000000000',
      value,
      { from: recordCreatorObligor, value: value }
    );

    // progress asset state
    await mineBlock(eventTime);
    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );

    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const { 0: projectedNextState } = await this.PAMEngineInstance.computeNextState(
      this.terms,
      this.state,
      eventTime
    );

    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.lastEventTime, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });

  it('should process next state with contract status equal to DL', async () => {
    // initialize gracePeriod and delinquencyPeriod
    this.terms['gracePeriod'] = { i: 1, p: 3 }; // 1M grace period
    this.terms['delinquencyPeriod'] = { i: 1, p: 4 }; // 1Q delinquency period

    // compute event schedule
    const protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.terms,
      this.terms['contractDealDate'],
      this.terms['maturityDate']
    );

    // fix target block time (block time to which to simulate state progression)
    const eventTime = protoEventSchedule[0].eventTime; // progress to within gracePeriod

    // progress asset state
    await mineBlock(eventTime); // simulate blockchain to target block time
    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    let { 0: projectedNextState } = await this.PAMEngineInstance.computeNextState(
      this.terms,
      this.state,
      eventTime
    );
    projectedNextState[1] = projectedNextState[0]; // nonPerformingDate = eventTime of first event
    projectedNextState[10] = '1'; // contractStatus

    // compare results
    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.lastEventTime, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });

  it('should process next state with contract status equal to DQ', async () => {
    // initialize gracePeriod and delinquencyPeriod
    this.terms['gracePeriod'] = { i: 1, p: 0 }; // 1M grace period
    this.terms['delinquencyPeriod'] = { i: 1, p: 4 }; // 1Q delinquency period

    // compute event schedule
    const protoEventSchedule = await this.PAMEngineInstance.computeProtoEventScheduleSegment(
      this.terms,
      this.terms['contractDealDate'],
      this.terms['maturityDate']
    );

    // fix target block time (block time to which to simulate state progression)
    const eventTime = protoEventSchedule[2].eventTime; // progress to post gracePeriod

    // progress asset state
    await mineBlock(eventTime); // simulate blockchain to target block time
    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    let { 0: projectedNextState } = await this.PAMEngineInstance.computeNextState(
      this.terms,
      this.state,
      eventTime
    );
    projectedNextState[1] = this.terms['initialExchangeDate']; // nonPerformingDate = initialExchangeDate
    projectedNextState[10] = '2'; // contractStatus = delinquent

    // compare results
    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.lastEventTime, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });
});
