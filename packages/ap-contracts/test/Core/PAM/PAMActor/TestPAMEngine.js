const { getTestCases } = require('@atpar/actus-solidity/test/helper/tests');

const { setupTestEnvironment } = require('../../../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot } = require('../../../helper/blockchain');
const { generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils');


contract('PAMActor', (accounts) => {
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

  it('should initialize Asset with ContractType PAM', async () => {
    const terms = (await getTestCases('PAM'))['10001']['terms'];
    const schedule = await generateSchedule(this.PAMEngineInstance, terms);
    const state = await this.PAMEngineInstance.computeInitialState(terms);
    const ownership = {
      creatorObligor, 
      creatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };
  
    const tx = await this.PAMActorInstance.initialize(
      terms,
      schedule,
      ownership,
      this.PAMEngineInstance.address,
      ZERO_ADDRESS
    );

    const assetId = tx.logs[0].args.assetId;
    const storedState = await this.PAMRegistryInstance.getState(assetId);

    assert.deepEqual(storedState, state);
  });
});
