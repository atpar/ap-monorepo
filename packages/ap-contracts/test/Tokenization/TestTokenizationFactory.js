const BigNumber = require('bignumber.js');

const FDT_ETHExtension = artifacts.require('FDT_ETHExtension');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');
const { deriveTerms, registerTemplateFromTerms, ZERO_ADDRESS } = require('../helper/utils');


contract('TokenizationFactory', (accounts) => {
  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  const initialSupply = (new BigNumber(10000 * 10 ** 18)).toFixed();
  
  const assetId = 'C123';

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = await getDefaultTerms();

    // register template
    ({ lifecycleTerms: this.lifecycleTerms, customTerms: this.customTerms } = deriveTerms(this.terms));
    this.templateId = await registerTemplateFromTerms(this.instances, this.terms);

    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);

    // register Ownership for assetId
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(assetId), 
      this.ownership,
      web3.utils.toHex(this.templateId),
      this.customTerms,
      this.state,
      this.PAMEngineInstance.address,
      ZERO_ADDRESS,
      ZERO_ADDRESS
    );
  });

  it('should tokenize default beneficiary - ERC20', async () => {
    const tx = await this.TokenizationFactoryInstance.createERC20Distributor(
      'FundsDistributionToken',
      'FDT',
      initialSupply,
      "0x0000000000000000000000000000000000000001",
      creatorBeneficiary,
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

    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const balanceOfCreatorBeneficiary = (await FDT_ERC20ExtensionInstance.balanceOf(creatorBeneficiary)).toString();

    assert.equal(storedOwnership.creatorBeneficiary, FDT_ERC20ExtensionInstance.address);
    assert.equal(balanceOfCreatorBeneficiary, initialSupply);
  });

    it('should tokenize default beneficiary - restricted ERC20', async () => {
    const tx = await this.TokenizationFactoryInstance.createRestrictedERC20Distributor(
      'FundsDistributionToken',
      'FDT',
      initialSupply,
      "0x0000000000000000000000000000000000000001",
      counterpartyBeneficiary,
      { from: counterpartyBeneficiary }
    );

    const FDT_ERC20ExtensionInstance = await FDT_ETHExtension.at(
      tx.logs[0].args.distributor
    );

    await this.AssetRegistryInstance.setCounterpartyBeneficiary(
      web3.utils.toHex(assetId),
      FDT_ERC20ExtensionInstance.address,
      { from: counterpartyBeneficiary }
    );

    const storedOwnership = await this.AssetRegistryInstance.getOwnership(web3.utils.toHex(assetId));
    const balanceOfCounterpartyBeneficiary = (await FDT_ERC20ExtensionInstance.balanceOf(counterpartyBeneficiary)).toString();

    assert.equal(storedOwnership.counterpartyBeneficiary, FDT_ERC20ExtensionInstance.address);
    assert.equal(balanceOfCounterpartyBeneficiary, initialSupply);
  });
});
