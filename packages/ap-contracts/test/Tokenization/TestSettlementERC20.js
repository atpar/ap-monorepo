const BigNumber = require('bignumber.js');

const FDT_ERC20Extension = artifacts.require('FDT_ERC20Extension');
const ERC20SampleToken = artifacts.require('ERC20SampleToken');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');


contract('SettlementERC20', (accounts) => {
  const recordCreatorObligor = accounts[0];
  const recordCreatorBeneficiary = accounts[1];
  const counterpartyObligor = accounts[2];
  const counterpartyBeneficiary = accounts[3];

  const ownerA = accounts[4];
  const ownerB = '0x0000000000000000000000000000000000000001';
  const ownerC = '0x0000000000000000000000000000000000000002';
  const ownerD = '0x0000000000000000000000000000000000000003';

  const mintedTokensPerOwner = (new BigNumber(2500 * 10 ** 18)).toFixed();
  
  const assetId = 'C123';
  const cashflowId = 5;
  const payoffAmount = 2 * 10  ** 15;

  before(async () => {
    const instances = await setupTestEnvironment();
    Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

    this.terms = await getDefaultTerms();
    this.state = await this.PAMEngineInstance.computeInitialState(this.terms, {});
    this.ownership = { 
      recordCreatorObligor, 
      recordCreatorBeneficiary, 
      counterpartyObligor, 
      counterpartyBeneficiary
    };

    // register Ownership for assetId
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(assetId), 
      this.ownership,
      this.terms,
      this.state,
      this.PAMEngineInstance.address,
      '0x0000000000000000000000000000000000000000'
    );

    // deploy test ERC20 token
    this.PaymentTokenInstance = await ERC20SampleToken.new();
    await this.PaymentTokenInstance.transfer(counterpartyObligor, payoffAmount);

    // deploy FDT_ERC20Extension
    this.FDT_ERC20ExtensionInstance = await FDT_ERC20Extension.new(
      'FundsDistributionToken',
      'FDT',
      this.PaymentTokenInstance.address
    );

    // mint FD-Tokens for each owner
    this.FDT_ERC20ExtensionInstance.mint(ownerA, mintedTokensPerOwner);
    this.FDT_ERC20ExtensionInstance.mint(ownerB, mintedTokensPerOwner);
    this.FDT_ERC20ExtensionInstance.mint(ownerC, mintedTokensPerOwner);
    this.FDT_ERC20ExtensionInstance.mint(ownerD, mintedTokensPerOwner);

    // set FDT_ERC20Extension as beneficiary for CashflowId
    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(assetId),
      cashflowId,
      this.FDT_ERC20ExtensionInstance.address,
      { from: recordCreatorBeneficiary }
    );
  });

  it('should increment ERC20 balance of FDT after settling payoff in tokens', async () => {
    const preBalanceOfFDT_ERC20Extension = (await this.PaymentTokenInstance.balanceOf(
      this.FDT_ERC20ExtensionInstance.address
    )).toString();

    await this.PaymentTokenInstance.approve(
      this.PaymentRouterInstance.address, 
      payoffAmount, 
      { from: counterpartyObligor }
    );

    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(assetId), 
      cashflowId,
      1,
      this.PaymentTokenInstance.address,
      payoffAmount,
      { from: counterpartyObligor }
    );

    await this.FDT_ERC20ExtensionInstance.updateFundsReceived();

    const postBalanceOfFDT_ERC20Extension = (await this.PaymentTokenInstance.balanceOf(
      this.FDT_ERC20ExtensionInstance.address
    )).toString();

    assert.equal(Number(preBalanceOfFDT_ERC20Extension) + payoffAmount, postBalanceOfFDT_ERC20Extension);
  });
});
