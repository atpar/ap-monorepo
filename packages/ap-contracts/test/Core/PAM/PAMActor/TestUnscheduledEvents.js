const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const AssetActor = artifacts.require('AssetActor');

const { setupTestEnvironment, getDefaultTerms, deployPaymentToken } = require('../../helper/setupTestEnvironment');
const { deriveTerms, ZERO_BYTES32, registerTemplateFromTerms } = require('../../helper/utils');
const { encodeEvent } = require('../../helper/scheduleUtils');
const { 
  createSnapshot, 
  revertToSnapshot, 
  mineBlock
} = require('../../helper/blockchain');


contract('AssetActor', (accounts) => {

  const admin = accounts[0];
  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;
  
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

  afterEach(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should process next state with for an unscheduled event', async () => {
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(this.assetId),
      this.ownership,
      web3.utils.toHex(this.templateId),
      this.customTerms,
      this.PAMEngineInstance.address,
      admin
    );

    const initialState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const event = encodeEvent(8, Number(this.terms.contractDealDate) + 100);
    const eventTime = await getEventTime(event, this.terms);
    
    await mineBlock(Number(eventTime));

    const { tx: txHash } = await this.AssetActorInstance.progressWith(
      web3.utils.toHex(this.assetId),
      event,
      { from: admin }
    );
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'ProgressedAsset'
    );
    const storedNextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.computeStateForEvent(
      this.lifecycleTerms,
      initialState,
      event,
      ZERO_BYTES32
    );

    // compare results
    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(storedNextState.statusDate, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);
  });

  it('should not process next state with for an unscheduled event with a later schedule time', async () => {
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(this.assetId),
      this.ownership,
      web3.utils.toHex(this.templateId),
      this.customTerms,
      this.PAMEngineInstance.address,
      admin
    );

    const initialState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const event = await this.AssetRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const eventTime = await getEventTime(event, this.terms);
    
    await mineBlock(Number(eventTime));

    await shouldFail.reverting.withMessage(
      this.AssetActorInstance.progressWith(
        web3.utils.toHex(this.assetId),
        event,
        { from: admin }
      ),
      'AssetActor.progressWith: ' + 'FOUND_EARLIER_EVENT'
    );
  });
});
