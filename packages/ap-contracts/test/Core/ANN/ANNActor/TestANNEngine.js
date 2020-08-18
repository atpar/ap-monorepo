/*jslint node*/
/*global before, describe, it*/
const bre = require('@nomiclabs/buidler');
const { getTestCases } = require('@atpar/actus-solidity/test/helper/tests');
const { generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils');


describe('ANNActor', () => {
  let isSnapshotCreated = false;
  let accounts, instances, txOpts;
  let creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  before(async () => {
    // deploy instances and create the EVM snapshot
    isSnapshotCreated = await bre.deployments.fixture("u-tests") || true;

    accounts = bre.usrNs.accounts;
    instances = bre.usrNs.instances;
    txOpts = bre.usrNs.package.defaultDeployOptions;

    creatorObligor = accounts[2];
    creatorBeneficiary = accounts[3];
    counterpartyObligor = accounts[4];
    counterpartyBeneficiary = accounts[5];
  });

  it('should initialize Asset with ContractType ANN', async () => {
    const terms = (await getTestCases('ANN'))['ann01']['terms'];
    const schedule = await generateSchedule(instances.ANNEngineInstance, terms);
    const state = await instances.ANNEngineInstance.methods.computeInitialState(terms).call(txOpts);
    const ownership = {
      creatorObligor,
      creatorBeneficiary,
      counterpartyObligor,
      counterpartyBeneficiary
    };

    const tx = await this.ANNActorInstance.methods.initialize(
      terms,
      schedule,
      ownership,
      instances.ANNEngineInstance.options.address,
      ZERO_ADDRESS
    ).send();

    const assetId = tx.logs[0].args.assetId;
    const storedState = await this.ANNRegistryInstance.getState(assetId).call();

    assert.deepEqual(storedState, state);
  });
});
