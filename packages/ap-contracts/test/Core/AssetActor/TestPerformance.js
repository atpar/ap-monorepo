const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');

const { setupTestEnvironment, getDefaultTerms, deployPaymentToken } = require('../../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../../helper/blockchain');
const { deriveTerms, registerTemplateFromTerms, ZERO_ADDRESS } = require('../../helper/utils');

const AssetActor = artifacts.require('AssetActor');


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
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.assetId = 'C123';
    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = { 
      ...await getDefaultTerms(),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(creatorObligor,[counterpartyBeneficiary]);
    // set address of payment token as currency in terms
    this.terms.currency = this.PaymentTokenInstance.address;
    this.terms.settlementCurrency = this.PaymentTokenInstance.address;
    this.terms.statusDate = this.terms.contractDealDate;

    // register template
    ({ lifecycleTerms: this.lifecycleTerms, customTerms: this.customTerms } = deriveTerms(this.terms));
    this.templateId = await registerTemplateFromTerms(this.instances, this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should initialize an asset', async () => {
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(this.assetId),
      this.ownership,
      web3.utils.toHex(this.templateId),
      this.customTerms,
      this.PAMEngineInstance.address,
      ZERO_ADDRESS
    );

    // const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));
    const storedEngineAddress = await this.AssetRegistryInstance.getEngine(web3.utils.toHex(this.assetId));

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
    const _event = await this.AssetRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
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
      txHash, AssetActor, 'ProgressedAsset'
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
    const _event = await this.AssetRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const eventTime = await getEventTime(_event, this.lifecycleTerms);

    // progress asset state
    await mineBlock(eventTime);

    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'ProgressedAsset'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedNextFinalizedState = await this.AssetRegistryInstance.getFinalizedState(web3.utils.toHex(this.assetId));

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
    assert.equal(storedNextFinalizedState.statusDate, projectedNextState.statusDate);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
    snapshot_asset = await createSnapshot();
  });

  it('should process next state with contract status equal to DQ', async () => {
    const _event = await this.AssetRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state to after deliquency period
    await mineBlock(Number(eventTime) + 3000000);

    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'ProgressedAsset'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedNextFinalizedState = await this.AssetRegistryInstance.getFinalizedState(web3.utils.toHex(this.assetId));

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
    assert.equal(storedNextFinalizedState.statusDate, projectedNextState.statusDate);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });
});
