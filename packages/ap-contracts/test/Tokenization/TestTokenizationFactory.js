const BigNumber = require('bignumber.js');

const FDT_ETHExtension = artifacts.require('FDT_ETHExtension');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');
const { deriveTerms, registerProduct, ZERO_ADDRESS } = require('../helper/utils');


contract('TokenizationFactory', (accounts) => {
  const creatorObligor = accounts[0];
  const creatorBeneficiary = accounts[1];
  const counterpartyObligor = accounts[2];
  const counterpartyBeneficiary = accounts[3];

  const initialSupply = (new BigNumber(10000 * 10 ** 18)).toFixed();
  
  const assetId = 'C123';

  beforeEach(async () => {
    this.instances = await setupTestEnvironment();
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = await getDefaultTerms();

    // register product
    ({ lifecycleTerms: this.lifecycleTerms, customTerms: this.customTerms } = deriveTerms(this.terms));
    this.productId = await registerProduct(this.instances, this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);

    // register Ownership for assetId
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(assetId), 
      this.ownership,
      web3.utils.toHex(this.productId),
      this.customTerms,
      this.state,
      this.PAMEngineInstance.address,
      ZERO_ADDRESS
    );
  });

  it('should tokenize default beneficiary - ERC20', async () => {
    const tx = await this.TokenizationFactoryInstance.createERC20Distributor(
      'FundsDistributionToken',
      'FDT',
      initialSupply,
      "0x0000000000000000000000000000000000000001",
      { from: creatorBeneficiary }
    );

    const FDT_ERC20ExtensionInstance = await FDT_ETHExtension.at(
      tx.logs[0].args.distributor
    );

    await this.AssetRegistryInstance.setCreatorBeneficiary(
      web3.utils.toHex(assetId),
      FDT_ERC20ExtensionInstance.address,
      { from: creatorBeneficiary }
    );

    const storedCreatorBeneficiary = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const balanceOfRecordCreatoBeneficiary = (await FDT_ERC20ExtensionInstance.balanceOf(creatorBeneficiary)).toString();

    assert.equal(storedCreatorBeneficiary.creatorBeneficiary, FDT_ERC20ExtensionInstance.address);
    assert.equal(balanceOfRecordCreatoBeneficiary, initialSupply);
  });
});
