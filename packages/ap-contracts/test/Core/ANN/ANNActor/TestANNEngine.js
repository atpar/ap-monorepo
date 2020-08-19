/*jslint node*/
/*global before, describe, it*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const { getTestCases } = require('@atpar/actus-solidity/test/helper/tests');
const { generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils');
const { setupTestEnvironment } = require('../../../helper/setupTestEnvironment');


describe('ANNActor', () => {
  const txOpts = {};

  let creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  before(async () => {
    await setupTestEnvironment(bre, this);

    const accounts = bre.usrNs.accounts;
    txOpts.from = accounts[9];

    creatorObligor = accounts[2];
    creatorBeneficiary = accounts[3];
    counterpartyObligor = accounts[4];
    counterpartyBeneficiary = accounts[5];
  });

  it('should initialize Asset with ContractType ANN', async () => {
    const terms = (await getTestCases('ANN'))['ann01']['terms'];
    const schedule = await generateSchedule(this.ANNEngineInstance, terms);
    const state = await this.ANNEngineInstance.methods.computeInitialState(terms).call(txOpts);
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
      this.ANNEngineInstance.options.address,
      ZERO_ADDRESS
    ).send(txOpts);

    const assetId = tx.events.InitializedAsset.returnValues.assetId;
    const storedState = await this.ANNRegistryInstance.methods.getState(assetId).call();

    assert.deepStrictEqual(storedState, state);
  });
});
