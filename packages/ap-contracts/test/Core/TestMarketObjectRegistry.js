const { shouldFail, expectEvent } = require('openzeppelin-test-helpers');

const { setupTestEnvironment } = require('../helper/setupTestEnvironment');

const MarketObjectRegistry = artifacts.require('MarketObjectRegistry');


contract('MarketRegistry', (accounts) => {
  const admin = accounts[0];
  const marketObjectProvider = accounts[1];
  const unregisteredProvider = accounts[2];

  before(async () => {
    const instances = await setupTestEnvironment(accounts);
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.marketObjectId = web3.utils.toHex('MOID_1');
  });

  it('should register a market object provider', async () => {
    const { tx: txHash } = await this.MarketObjectRegistryInstance.setMarketObjectProvider(
      this.marketObjectId,
      marketObjectProvider,
      { from: admin }
    );

    await expectEvent.inTransaction(
      txHash, MarketObjectRegistry, 'UpdatedMarketObjectProvider'
    );
  });

  it('should register a data point for a registered market object provider', async () => {
    const { tx: txHash } = await this.MarketObjectRegistryInstance.publishDataPointOfMarketObject(
      this.marketObjectId,
      1,
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      { from: marketObjectProvider }
    );

    await expectEvent.inTransaction(
      txHash, MarketObjectRegistry, 'PublishedDataPoint'
    );
  });

  it('should register a data point with an earlier timestamp for a registered market object provider', async () => {
    const { tx: txHash } = await this.MarketObjectRegistryInstance.publishDataPointOfMarketObject(
      this.marketObjectId,
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      { from: marketObjectProvider }
  );

    await expectEvent.inTransaction(
      txHash, MarketObjectRegistry, 'PublishedDataPoint'
    );
  });

  it('should revert if an unregistered account tries to publish a data point', async () => {
    await shouldFail.reverting.withMessage(
      this.MarketObjectRegistryInstance.publishDataPointOfMarketObject(
        this.marketObjectId,
        1,
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        { from: unregisteredProvider }
      ),
      'MarketObjectRegistry.publishMarketObject: UNAUTHORIZED_SENDER'
    );
  });

  it('should retrieve the correct data point', async () => {
    const result = await this.MarketObjectRegistryInstance.getDataPointOfMarketObject(this.marketObjectId, 1);

    assert.equal(result[0].toString(), '1');
    assert.equal(result[1], true);
  });

  it('should retrieve the correct last updated timestamp', async () => {
    const lastUpdated = await this.MarketObjectRegistryInstance.getMarketObjectLastUpdatedTimestamp(this.marketObjectId);

    assert.equal(lastUpdated.toString(), '1');
  });
});
