const { getTestCases } = require('@atpar/actus-solidity/test/helper/tests');

const { setupTestEnvironment } = require('../../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot } = require('../../helper/blockchain');
const { generateSchedule, ZERO_ADDRESS } = require('../../helper/utils');


contract('ANNActor', (accounts) => {
  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    snapshot = await createSnapshot()
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should initialize Asset with ContractType ANN', async () => {
    const terms = (await getTestCases('ANN'))['20001']['terms'];
    const schedule = await generateSchedule(this.ANNEngineInstance, terms);
    const state = await this.ANNEngineInstance.computeInitialState(terms);
    const ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
  
    const tx = await this.ANNActorInstance.initialize(
      terms,
      schedule,
      ownership,
      this.ANNEngineInstance.address,
      ZERO_ADDRESS
    );

    const assetId = tx.logs[0].args.assetId;
    const storedState = await this.ANNRegistryInstance.getState(assetId);

    assert.deepEqual(storedState, state);
  });
});
