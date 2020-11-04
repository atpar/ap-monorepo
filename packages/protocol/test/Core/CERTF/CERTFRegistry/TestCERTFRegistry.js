/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');
const { shouldFail } = require('openzeppelin-test-helpers');

const { getSnapshotTaker } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, parseTerms, ZERO_ADDRESS } = require('../../../helper/utils/utils');

const ASSET_ALREADY_EXISTS = 'ASSET_ALREADY_EXISTS';
const UNAUTHORIZED_SENDER = 'UNAUTHORIZED_SENDER';


describe('CERTFRegistry', () => {
  let actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody;

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [
      /* deployer */, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody,
    ] = self.accounts;
    self.assetId = 'CERTF_01';
    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    self.terms = require('../../../helper/terms/CERTFTerms-complex.json');
    self.schedule = await generateSchedule(self.CERTFEngineInstance, self.terms);
    self.state = await self.CERTFEngineInstance.methods.computeInitialState(self.terms).call();
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should register an asset', async () => {
    await this.CERTFRegistryInstance.methods.registerAsset(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.state,
      this.schedule,
      this.ownership,
      this.CERTFEngineInstance.options.address,
      actor,
      ZERO_ADDRESS
    ).send({ from: actor });

    const storedTerms = await this.CERTFRegistryInstance.methods.getTerms(web3.utils.toHex(this.assetId)).call();
    const storedState = await this.CERTFRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    const storedOwnership = await this.CERTFRegistryInstance.methods.getOwnership(web3.utils.toHex(this.assetId)).call();
    const storedEngineAddress = await this.CERTFRegistryInstance.methods.getEngine(web3.utils.toHex(this.assetId)).call();

    assert.deepStrictEqual(parseTerms(storedTerms), parseTerms(Object.values({ ...this.terms })));
    assert.deepStrictEqual(storedState, this.state);
    assert.deepStrictEqual(storedEngineAddress, this.CERTFEngineInstance.options.address);
    assert.strictEqual(storedOwnership.creatorObligor, creatorObligor);
    assert.strictEqual(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.strictEqual(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.strictEqual(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should not overwrite an existing asset', async () => {
    await shouldFail.reverting.withMessage(
      this.CERTFRegistryInstance.methods.registerAsset(
        web3.utils.toHex(this.assetId),
        this.terms,
        this.state,
        this.schedule,
        this.ownership,
        this.CERTFEngineInstance.options.address,
        actor,
        ZERO_ADDRESS
      ).send({ from: actor }),
      'BaseRegistry.setAsset: ' + ASSET_ALREADY_EXISTS
    );
  });

  it('should let the actor overwrite and update the terms, state of an asset', async () => {
    await this.CERTFRegistryInstance.methods.setState(
      web3.utils.toHex(this.assetId),
      this.state,
    ).send({ from: actor });
  });

  it('should not let an unauthorized account overwrite and update the terms, state of an asset', async () => {
    await shouldFail.reverting.withMessage(
      this.CERTFRegistryInstance.methods.setState(
        web3.utils.toHex(this.assetId),
        this.state,
      ).send({ from: nobody }),
      'AccessControl.isAuthorized: ' + UNAUTHORIZED_SENDER
    );
  });
});
