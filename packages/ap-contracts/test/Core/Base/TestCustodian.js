/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const bre = require('@nomiclabs/buidler');
const BigNumber = require('bignumber.js');
const { shouldFail } = require('openzeppelin-test-helpers');
const { expectEvent } = require('../../helper/utils');

const { deployPaymentToken, getSnapshotTaker } = require('../../helper/setupTestEnvironment');
const { generateSchedule } = require('../../helper/utils');

describe('Custodian', () => {
  let deployer, defaultActor, creatorObligor, creatorBeneficiary, counterpartyBeneficiary, nobody;

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(bre, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [
        deployer, defaultActor, creatorObligor, creatorBeneficiary, counterpartyBeneficiary, nobody,
    ] = self.accounts;
    self.txOpts.from = nobody;

    // deploy test ERC20 token
    self.PaymentTokenInstance = await deployPaymentToken(bre, deployer, [
        creatorObligor, creatorBeneficiary, counterpartyBeneficiary,
    ]);

    self.assetId = 'CEC_01';

    self.ownership = {
      creatorObligor,
      creatorBeneficiary,
      counterpartyObligor: self.CustodianInstance.options.address,
      counterpartyBeneficiary,
    };

    self.terms = require('../../helper/terms/CECTerms-collateral.json');

    // encode collateral token address and collateral amount (notionalPrincipal of underlying + some over-collateralization)
    const overCollateral = web3.utils.toWei('100').toString();
    self.collateralAmount = (new BigNumber(self.terms.notionalPrincipal)).plus(overCollateral);
    // encode collateralToken and collateralAmount in object of second contract reference
    self.terms.contractReference_2.object = await self.CustodianInstance.methods.encodeCollateralAsObject(
      self.PaymentTokenInstance.options.address,
      self.collateralAmount.toString(),
    ).call();

    self.state = await self.CECEngineInstance.methods.computeInitialState(self.terms).call();

    self.schedule = await generateSchedule(self.CECEngineInstance, self.terms);

    if (! await self.CECRegistryInstance.methods.approvedActors(defaultActor).call()) {
      throw new Error('unexpected defaultActor or CECRegistryInstance');
    }

    await self.CECRegistryInstance.methods.registerAsset(
      web3.utils.toHex(self.assetId),
      self.terms,
      self.state,
      self.schedule,
      self.ownership,
      self.CECEngineInstance.options.address,
      self.CECActorInstance.options.address,
      deployer,
    ).send({from: defaultActor});
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    await this.setupTestEnvironment();
  });

  it('should lock collateral', async () => {
    await this.PaymentTokenInstance.methods.approve(
      this.CustodianInstance.options.address,
      this.collateralAmount.toString(),
    ).send({ from: this.ownership.counterpartyBeneficiary });

    const { events } = await this.CustodianInstance.methods.lockCollateral(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.ownership
    ).send(this.txOpts);

    expectEvent(
      events,
      'LockedCollateral',
      {
        assetId: web3.utils.padRight(web3.utils.toHex(this.assetId), 64),
        collateralizer: this.ownership.counterpartyBeneficiary,
        collateralAmount: this.collateralAmount.toFixed()
      }
    );
  });

  it('should return not executed amount after collateral was triggered', async () => {
    await this.PaymentTokenInstance.methods.approve(
      this.CustodianInstance.options.address,
      this.collateralAmount.toString(),
    ).send({ from: this.ownership.counterpartyBeneficiary });
    await this.CustodianInstance.methods.lockCollateral(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.ownership
    ).send(this.txOpts);

    const state = { ...this.state };
    state.contractPerformance = '3';
    state.exerciseDate = this.state.statusDate;
    state.exerciseAmount = this.collateralAmount.div(2).toFixed();
    state[0] = state.contractPerformance;
    state[4] = state.exerciseDate;
    state[13] = state.exerciseAmount;

    await this.CECRegistryInstance.methods.setState(web3.utils.toHex(this.assetId), state)
        .send({from: deployer});

    const { events } = await this.CustodianInstance.methods.returnCollateral(web3.utils.toHex(this.assetId))
        .send(this.txOpts);

    expectEvent(
      events,
      'ReturnedCollateral',
      {
        assetId: web3.utils.padRight(web3.utils.toHex(this.assetId), 64),
        collateralizer: this.ownership.counterpartyBeneficiary,
        returnedAmount: this.collateralAmount.div(2).toFixed()
      }
    );
  });

  it('should return entire collateral amount if collateral was not triggered before maturity', async () => {
    await this.PaymentTokenInstance.methods.approve(
      this.CustodianInstance.options.address,
      this.collateralAmount.toString(),
    ).send({ from: this.ownership.counterpartyBeneficiary });
    await this.CustodianInstance.methods.lockCollateral(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.ownership
    ).send(this.txOpts);

    const state = { ...this.state };
    state.contractPerformance = '4';
    state[0] = state.contractPerformance;

    await this.CECRegistryInstance.methods.setState(web3.utils.toHex(this.assetId), state)
        .send({from: deployer});

    const { events } = await this.CustodianInstance.methods.returnCollateral(web3.utils.toHex(this.assetId))
        .send(this.txOpts);

    expectEvent(
      events,
      'ReturnedCollateral',
      {
        assetId: web3.utils.padRight(web3.utils.toHex(this.assetId), 64),
        collateralizer: this.ownership.counterpartyBeneficiary,
        returnedAmount: this.collateralAmount.toFixed()
      }
    );
  });

  it('should revert if collateral was not triggered and maturity / termination is not reached', async () => {
    await this.PaymentTokenInstance.methods.approve(
      this.CustodianInstance.options.address,
      this.collateralAmount.toString(),
    ).send({ from: this.ownership.counterpartyBeneficiary });
    await this.CustodianInstance.methods.lockCollateral(
      web3.utils.toHex(this.assetId),
      this.terms,
      this.ownership
    ).send(this.txOpts);

    await shouldFail.reverting.withMessage(
      this.CustodianInstance.methods.returnCollateral(web3.utils.toHex(this.assetId)).send(this.txOpts),
      'Custodian.returnCollateral: COLLATERAL_CAN_NOT_BE_RETURNED'
    );
  });
});
