const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');

const AssetActor = artifacts.require('AssetActor');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');


contract('AssetActor', (accounts) => {
  const issuer = accounts[0];
  const recordCreatorObligor = accounts[1];
  const recordCreatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

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
  });

  it('should initialize an asset', async () => {
    await this.AssetActorInstance.initialize(
      web3.utils.toHex(this.assetId),
      this.ownership,
      this.terms
    );

    const storedTerms = await this.AssetRegistryInstance.getTerms(web3.utils.toHex(this.assetId));
    const storedState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(this.assetId));

    assert.deepEqual(storedTerms['contractDealDate'], this.terms['contractDealDate'].toString());
    assert.deepEqual(storedState, this.state);

    assert.equal(storedOwnership.recordCreatorObligor, recordCreatorObligor);
    assert.equal(storedOwnership.recordCreatorBeneficiary, recordCreatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should process next state', async () => {
    const { 1: { 0: iedEvent } } = await this.PAMEngineInstance.computeNextState(
      this.terms, 
      this.state, 
      this.terms['maturityDate']
    );
    const eventTime = iedEvent.scheduledTime;
    const payoff = new BigNumber(iedEvent.payoff);
    const cashflowId = (payoff.isGreaterThan(0)) ? Number(iedEvent.eventType) + 1 : (Number(iedEvent.eventType) + 1) * -1;
    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());
    const lastEventId = Number(await this.AssetRegistryInstance.getEventId(web3.utils.toHex(this.assetId)));

    // settle obligations
    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(this.assetId),
      cashflowId,
      lastEventId + 1,
      '0x0000000000000000000000000000000000000000',
      value,
      { from: recordCreatorObligor, value: value }
    );

    // progress asset state
    const { tx: txHash } = await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId), eventTime);
    const { args: { 0: emittedAssetId, 1: emittedEventId } } = await expectEvent.inTransaction(
      txHash, AssetActor, 'AssetProgressed'
    );
    const nextState = await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const nextLastEventId = new BigNumber(await this.AssetRegistryInstance.getEventId(web3.utils.toHex(this.assetId)));

    assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
    assert.equal(emittedEventId.toString(), nextLastEventId.toString());
    assert.equal(nextState.lastEventTime, eventTime);
    assert.isTrue(nextLastEventId.isEqualTo(lastEventId + 2)); // IED + IP, todo: do it programmatically
  });
});
