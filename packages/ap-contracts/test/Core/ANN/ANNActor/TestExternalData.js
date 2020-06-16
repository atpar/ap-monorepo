const { expectEvent } = require('openzeppelin-test-helpers');

const { setupTestEnvironment } = require('../../../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../../../helper/blockchain');
const { generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils');

const ANNActor = artifacts.require('ANNActor');


contract('ANNActor', (accounts) => {

  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;
  let snapshot_asset;
  
  const getEventTime = async (_event, terms) => {
    return Number(await this.ANNEngineInstance.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ));
  }

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);

    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
    // schedule with RR
    this.terms = require('../../../helper/terms/ANNTerms-external-data.json');
    // console.log(this.terms)

    // only want RR events in the schedules
    let x = (await generateSchedule(this.ANNEngineInstance, this.terms))
    console.log(x)
    this.schedule = (await generateSchedule(this.ANNEngineInstance, this.terms)).filter((event) => event.startsWith('0x0c'));
  
    // console.log(this.schedule)

    const tx = await this.ANNActorInstance.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.ANNEngineInstance.address,
      ZERO_ADDRESS
    );

    this.assetId = tx.logs[0].args.assetId;
    this.state = await this.ANNRegistryInstance.getState(web3.utils.toHex(this.assetId));

    this.resetRate = web3.utils.toWei('0'); // TODO: investigate overflow if set to non zero

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should process next state with external rate', async () => {
    const _event = await this.ANNRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    console.log(_event)
    const eventTime = await getEventTime(_event, this.terms);
    
    await mineBlock(Number(eventTime));
    
    await this.MarketObjectRegistryInstance.setMarketObjectProvider(
      this.terms.marketObjectCodeRateReset,
      accounts[0]
    );
      
    await this.MarketObjectRegistryInstance.publishDataPointOfMarketObject(
      this.terms.marketObjectCodeRateReset,
      eventTime,
      this.resetRate
    );
        
    const { tx: txHash } = await this.ANNActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, ANNActor, 'ProgressedAsset'
    );
    const storedNextState = await this.ANNRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    const projectedNextState = await this.ANNEngineInstance.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      web3.utils.toHex(this.resetRate)
    );

    // compare results
    assert.equal(emittedAssetId, this.assetId);
    assert.equal(storedNextState.statusDate, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });
});
