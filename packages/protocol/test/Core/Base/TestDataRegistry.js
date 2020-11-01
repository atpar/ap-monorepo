/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');
const { shouldFail } = require('openzeppelin-test-helpers');

const { getSnapshotTaker } = require('../../helper/setupTestEnvironment');
const { expectEvent } = require('../../helper/utils/utils');


describe('DataRegistry', () => {
  let admin, marketObjectProvider, unregisteredProvider;

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [ admin, marketObjectProvider, unregisteredProvider ] = self.accounts;
    self.marketObjectId = web3.utils.toHex('MOID_1');
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should register a data provider', async () => {
    const { events } = await this.DataRegistryInstance.methods.setDataProvider(
      this.marketObjectId,
      marketObjectProvider,
    ).send({ from: admin });

    expectEvent(events, 'UpdatedDataProvider');
  });

  it('should register a data point for a registered data provider', async () => {
    const { events } = await this.DataRegistryInstance.methods.publishDataPoint(
      this.marketObjectId,
      1,
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    ).send({ from: marketObjectProvider });

    expectEvent(events, 'PublishedDataPoint');
  });

  it('should register a data point with an earlier timestamp for a registered data provider', async () => {
    const { events } = await this.DataRegistryInstance.methods.publishDataPoint(
      this.marketObjectId,
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    ).send({ from: marketObjectProvider });

    expectEvent(events, 'PublishedDataPoint');
  });

  it('should revert if an unregistered account tries to publish a data point', async () => {
    await shouldFail.reverting.withMessage(
      this.DataRegistryInstance.methods.publishDataPoint(
        this.marketObjectId,
        1,
        '0x0000000000000000000000000000000000000000000000000000000000000001',
      ).send({ from: unregisteredProvider }),
      'DataRegistry.publishDataPoint: UNAUTHORIZED_SENDER'
    );
  });

  it('should retrieve the correct data point', async () => {
    const result = await this.DataRegistryInstance.methods.getDataPoint(this.marketObjectId, 1).call();

    assert.equal(result[0].toString(), '1');
    assert.equal(result[1], true);
  });

  it('should retrieve the correct last updated timestamp', async () => {
    const lastUpdated = await this.DataRegistryInstance.methods.getLastUpdatedTimestamp(this.marketObjectId).call();

    assert.equal(lastUpdated.toString(), '1');
  });
});
