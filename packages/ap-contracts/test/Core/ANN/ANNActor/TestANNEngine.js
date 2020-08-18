/*jslint node*/
/*global before, describe, it*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const { getTestCases } = require('@atpar/actus-solidity/test/helper/tests');
const { generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils');


describe('ANNActor', () => {
  const txOpts = {};
  let instances;

  let creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  before(async () => {
    // deploy instances and create the EVM snapshot
    await bre.deployments.fixture("u-tests");

    instances = bre.usrNs.instances;
    const accounts = bre.usrNs.accounts;
    txOpts.from = accounts[9];

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

    const tx = await instances.ANNActorInstance.methods.initialize(
      terms,
      schedule,
      ownership,
      instances.ANNEngineInstance.options.address,
      ZERO_ADDRESS
    ).send(txOpts);

    const assetId = tx.events.InitializedAsset.returnValues.assetId;
    const storedState = await instances.ANNRegistryInstance.methods.getState(assetId).call();

    assert.deepStrictEqual(storedState, state);
  });
});
