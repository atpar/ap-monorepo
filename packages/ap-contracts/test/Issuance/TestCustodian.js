const BigNumber = require('bignumber.js');
const { shouldFail, expectEvent } = require('openzeppelin-test-helpers');

const CECCollateralTerms = require('../helper/terms/cec-collateral-terms.json');
const { setupTestEnvironment, getDefaultTerms, deployPaymentToken } = require('../helper/setupTestEnvironment');
const { deriveTerms, registerTemplateFromTerms } = require('../helper/utils');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../helper/blockchain')

const Custodian = artifacts.require('Custodian');


contract('Custodian', (accounts) => {

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(accounts[0], accounts);

    this.assetId = 'C123';
    this.ownership = {
      creatorObligor: accounts[1],
      creatorBeneficiary: accounts[2],
      counterpartyObligor: this.CustodianInstance.address,
      counterpartyBeneficiary: accounts[4]
    };

    const defaultTerms = await getDefaultTerms();
    this.terms = {
      ...CECCollateralTerms,
      maturityDate: defaultTerms.maturityDate,
      statusDate: defaultTerms.statusDate,
      contractDealDate: defaultTerms.contractDealDate
    };

    // encode collateral token address and collateral amount (notionalPrincipal of underlying + some over-collateralization)
    const overCollateral = web3.utils.toWei('100').toString();
    this.collateralAmount = (new BigNumber(this.terms.notionalPrincipal)).plus(overCollateral);
    // encode collateralToken and collateralAmount in object of second contract reference
    this.terms.contractReference_2.object = await this.CustodianInstance.encodeCollateralAsObject(
      this.PaymentTokenInstance.address,
      this.collateralAmount
    );

    ({ lifecycleTerms: this.lifecycleTerms, customTerms: this.customTerms } = deriveTerms(this.terms));

    this.state = await this.PAMEngineInstance.computeInitialState(this.lifecycleTerms);

    // register template
    this.templateId = await registerTemplateFromTerms(this.instances, this.terms);
    
    await this.AssetRegistryInstance.registerAsset(
      web3.utils.toHex(this.assetId),
      this.ownership,
      this.templateId,
      this.customTerms,
      this.state,
      this.PAMEngineInstance.address,
      this.AssetActorInstance.address,
      accounts[0]
    );

    this.snapshot = await createSnapshot();
  });

  afterEach(async () => {
    await revertToSnapshot(this.snapshot);
    this.snapshot = await createSnapshot();
  });

  it('should lock collateral', async () => {
    await this.PaymentTokenInstance.approve(
      this.CustodianInstance.address,
      this.collateralAmount,
      { from: this.ownership.counterpartyBeneficiary }
    );


    const { tx: txHash } = await this.CustodianInstance.lockCollateral(
      web3.utils.toHex(this.assetId),
      this.lifecycleTerms,
      this.ownership
    );

    await expectEvent.inTransaction(
      txHash,
      Custodian,
      'LockedCollateral', 
      { 
        assetId: web3.utils.padRight(web3.utils.toHex(this.assetId), 64),
        collateralizer: this.ownership.counterpartyBeneficiary,
        collateralAmount: this.collateralAmount.toFixed()
      }
    );
  });

  it('should return not executed amount after collateral was triggered', async () => {
    await this.PaymentTokenInstance.approve(
      this.CustodianInstance.address,
      this.collateralAmount,
      { from: this.ownership.counterpartyBeneficiary }
    );
    await this.CustodianInstance.lockCollateral(
      web3.utils.toHex(this.assetId),
      this.lifecycleTerms,
      this.ownership
    );
    
    const state = { ...this.state };
    state.contractPerformance = '3';
    state.exerciseDate = this.state.statusDate;
    state.exerciseAmount = this.collateralAmount.div(2).toFixed();
    state[0] = state.contractPerformance;
    state[4] = state.exerciseDate;
    state[13] = state.exerciseAmount;

    await this.AssetRegistryInstance.setState(web3.utils.toHex(this.assetId), state);
    
    const { tx: txHash } = await this.CustodianInstance.returnCollateral(web3.utils.toHex(this.assetId));

    await expectEvent.inTransaction(
      txHash,
      Custodian,
      'ReturnedCollateral', 
      { 
        assetId: web3.utils.padRight(web3.utils.toHex(this.assetId), 64),
        collateralizer: this.ownership.counterpartyBeneficiary,
        returnedAmount: this.collateralAmount.div(2).toFixed()
      }
    );
  });

  it('should return entire collateral amount if collateral was not triggered before maturity', async () => {
    await this.PaymentTokenInstance.approve(
      this.CustodianInstance.address,
      this.collateralAmount,
      { from: this.ownership.counterpartyBeneficiary }
    );
    await this.CustodianInstance.lockCollateral(
      web3.utils.toHex(this.assetId),
      this.lifecycleTerms,
      this.ownership
    );
    
    const state = { ...this.state };
    state.contractPerformance = '4';
    state[0] = state.contractPerformance;

    await this.AssetRegistryInstance.setState(web3.utils.toHex(this.assetId), state);
    
    const { tx: txHash } = await this.CustodianInstance.returnCollateral(web3.utils.toHex(this.assetId));

    await expectEvent.inTransaction(
      txHash,
      Custodian,
      'ReturnedCollateral', 
      { 
        assetId: web3.utils.padRight(web3.utils.toHex(this.assetId), 64),
        collateralizer: this.ownership.counterpartyBeneficiary,
        returnedAmount: this.collateralAmount.toFixed()
      }
    );
  });

  it('should revert if collateral was not triggered and maturity / termination is not reached', async () => {
    await this.PaymentTokenInstance.approve(
      this.CustodianInstance.address,
      this.collateralAmount,
      { from: this.ownership.counterpartyBeneficiary }
    );
    await this.CustodianInstance.lockCollateral(
      web3.utils.toHex(this.assetId),
      this.lifecycleTerms,
      this.ownership
    );
    
    await shouldFail.reverting.withMessage(
      this.CustodianInstance.returnCollateral(web3.utils.toHex(this.assetId)),
      'Custodian.returnCollateral: COLLATERAL_CAN_NOT_BE_RETURNED'
    );
  });
});
