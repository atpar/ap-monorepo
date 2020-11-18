/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, parseTerms, ZERO_ADDRESS } = require('../../../helper/utils/utils');

const ASSET_ALREADY_EXISTS = 'ASSET_ALREADY_EXISTS';
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER';


describe('CEGRegistry', () => {
  let actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody;

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [
      /* deployer */, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody,
    ] = self.accounts;
    self.assetId = 'CEG_01';
    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    self.terms = require('../../../helper/terms/CEGTerms-complex.json');
    self.schedule = await generateSchedule(self.CEGEngineInstance, self.terms);
    self.state = await this.CEGEngineInstance.methods.computeInitialState(self.terms).call();
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should register an asset', async () => {
    await this.CEGRegistryInstance.methods.registerAsset(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.state,
      this.schedule,
      this.ownership,
      this.CEGEngineInstance.options.address,
      actor,
      ZERO_ADDRESS
    ).send({from: actor});

    const storedTerms = await this.CEGRegistryInstance.methods.getTerms(web3.utils.toHex(this.assetId)).call();
    const storedState = await this.CEGRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    const storedOwnership = await this.CEGRegistryInstance.methods.getOwnership(web3.utils.toHex(this.assetId)).call();
    const storedEngineAddress = await this.CEGRegistryInstance.methods.getEngine(web3.utils.toHex(this.assetId)).call();

    assert.deepEqual(parseTerms(storedTerms), parseTerms(Object.values({ ...this.terms })));
    assert.deepEqual(storedState, this.state);
    assert.deepEqual(storedEngineAddress, this.CEGEngineInstance.options.address);
    assert.equal(storedOwnership.creatorObligor, creatorObligor);
    assert.equal(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.equal(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.equal(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should not overwrite an existing asset', async () => {
    await expectRevert(
      this.CEGRegistryInstance.methods.registerAsset(
        web3.utils.toHex(this.assetId),
        this.terms,
        this.state,
        this.schedule,
        this.ownership,
        this.CEGEngineInstance.options.address,
        actor,
        ZERO_ADDRESS
      ).send({ from: actor }),
      'BaseRegistry.setAsset: ' + ASSET_ALREADY_EXISTS
    );
  });

  it('should let the actor overwrite and update the terms, state of an asset', async () => {
    await this.CEGRegistryInstance.methods.setState(
      web3.utils.toHex(this.assetId),
      this.state,
    ).send({ from: actor });
  });

  it('should not let an unauthorized account overwrite and update the terms, state of an asset', async () => {
    await expectRevert(
      this.CEGRegistryInstance.methods.setState(
        web3.utils.toHex(this.assetId),
        this.state,
      ).send({ from: nobody }),
      'AccessControl.isAuthorized: ' + UNAUTHORIZED_SENDER
    );
  });
});
