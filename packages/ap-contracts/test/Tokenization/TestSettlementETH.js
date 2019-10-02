const BigNumber = require('bignumber.js');

const FDT_ETHExtension = artifacts.require('FDT_ETHExtension');

const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');


contract('SettlementETH', (accounts) => {
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

    // deploy FDT_ETHExtension
    this.FDT_ETHExtensionInstance = await FDT_ETHExtension.new(
      'FundsDistributionToken',
      'FDT'
    );
    
    // mint FD-Tokens for each owner
    this.FDT_ETHExtensionInstance.mint(ownerA, mintedTokensPerOwner);
    this.FDT_ETHExtensionInstance.mint(ownerB, mintedTokensPerOwner);
    this.FDT_ETHExtensionInstance.mint(ownerC, mintedTokensPerOwner);
    this.FDT_ETHExtensionInstance.mint(ownerD, mintedTokensPerOwner);

    // set FDT_ETHExtension as beneficiary for CashflowId
    await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
      web3.utils.toHex(assetId), 
      cashflowId, 
      this.FDT_ETHExtensionInstance.address,
      { from: recordCreatorBeneficiary }
    );
  });

  it('should increment Ether balance of FDT after settling payoff in ether', async () => {
    const preBalanceOfFDT_ETHExtension = await web3.eth.getBalance(this.FDT_ETHExtensionInstance.address);

    await this.PaymentRouterInstance.settlePayment(
      web3.utils.toHex(assetId), 
      cashflowId,
      '0x0000000000000000000000000000000000000000',
      '0x0000000000000000000000000000000000000000',
      payoffAmount,
      { from: counterpartyObligor, value: payoffAmount }
    );

    const postBalanceOfFDT_ETHExtension = await web3.eth.getBalance(this.FDT_ETHExtensionInstance.address);

    assert.equal(Number(preBalanceOfFDT_ETHExtension) + payoffAmount, postBalanceOfFDT_ETHExtension);
  });
});
