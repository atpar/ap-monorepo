const { expectEvent } = require('openzeppelin-test-helpers');

const { setupTestEnvironment } = require('../../../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../../../helper/blockchain');
const { generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils');
const { decodeEvent } = require('../../../helper/scheduleUtils');

const CERTFActor = artifacts.require('CERTFActor');


contract('CERTFActor', (accounts) => {

  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;
  let snapshot_asset;
  
  const getEventTime = async (_event, terms) => {
    return Number(await this.CERTFEngineInstance.computeEventTimeForEvent(
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
    this.terms = require('../../../helper/terms/CERTFTerms-external-data.json');
  
    // only want RR events in the schedules
    this.schedule = (await generateSchedule(this.CERTFEngineInstance, this.terms, 1623456000)).filter((event) => event.startsWith('0x17'));
  
    const tx = await this.CERTFActorInstance.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.CERTFEngineInstance.address,
      ZERO_ADDRESS
    );

    this.assetId = tx.logs[0].args.assetId;
    this.state = await this.CERTFRegistryInstance.getState(web3.utils.toHex(this.assetId));
    this.redemptionAmounts = [100, 110];

    snapshot = await createSnapshot();
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should process next state with external rate', async () => {
    const _event = await this.CERTFRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    const { scheduleTime } = decodeEvent(_event);
    
    await mineBlock(Number(scheduleTime));
    
    await this.MarketObjectRegistryInstance.setMarketObjectProvider(
      this.terms.contractReference_1.object,
      accounts[0]
    );

    await this.MarketObjectRegistryInstance.publishDataPointOfMarketObject(
      this.terms.contractReference_1.object,
      this.terms.issueDate,
      web3.utils.padLeft(
        web3.utils.numberToHex(
          web3.utils.toWei(String(this.redemptionAmounts[0]))
        ),
        64
      )
    );
      
    await this.MarketObjectRegistryInstance.publishDataPointOfMarketObject(
      this.terms.contractReference_1.object,
      scheduleTime,
      web3.utils.padLeft(
        web3.utils.numberToHex(
          web3.utils.toWei(String(this.redemptionAmounts[1]))
        ),
        64
      )
    );

    const { tx: txHash } = await this.CERTFActorInstance.progress(web3.utils.toHex(this.assetId));
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, CERTFActor, 'ProgressedAsset'
    );
    const storedNextState = await this.CERTFRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    const projectedNextState = await this.CERTFEngineInstance.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      web3.utils.padLeft(
        web3.utils.numberToHex(
          web3.utils.toWei(String(this.redemptionAmounts[1] / this.redemptionAmounts[0]))
        ),
        64
      )
    );

    // compare results
    assert.equal(emittedAssetId, this.assetId);
    assert.equal(storedNextState.statusDate, scheduleTime);
    assert.deepEqual(storedNextState, projectedNextState);

    await revertToSnapshot(snapshot_asset);
  });
});
