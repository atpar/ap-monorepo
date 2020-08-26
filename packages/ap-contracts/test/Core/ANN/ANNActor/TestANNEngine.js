/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');

const { getTestCases } = require('@atpar/actus-solidity/test/helper/tests');
const { generateSchedule, ZERO_ADDRESS } = require('../../../helper/utils');
const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');


describe('ANNActor', () => {
  let actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(bre, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    [
      /* deployer */, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary,
    ] = self.accounts;
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    await this.setupTestEnvironment();
  });

  it('should initialize Asset with ContractType ANN', async () => {
    const terms = (await getTestCases('ANN'))['ann01']['terms'];
    const schedule = await generateSchedule(this.ANNEngineInstance, terms);
    const state = await this.ANNEngineInstance.methods.computeInitialState(terms).call(this.txOpts);
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
    ).send({ from: actor });

    const assetId = tx.events.InitializedAsset.returnValues.assetId;
    const storedState = await this.ANNRegistryInstance.methods.getState(assetId).call();

    assert.deepStrictEqual(storedState, state);
  });
});
