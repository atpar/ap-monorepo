/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const BigNumber = require('bignumber.js');

const { mineBlock } = require('../../../helper/utils/blockchain');
const { getSnapshotTaker, getDefaultTerms, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const {
  expectEvent, generateSchedule, web3ResponseToState, ZERO_ADDRESS
} = require('../../../helper/utils/utils');


describe('CEGActor', () => {
  let creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  const getEventTime = async (_event, terms) => {
    return Number(await this.CEGEngineInstance.methods.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ).call());
  }

  /** @param {any} self - `this` inside `before()`/`it()` */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken
    [
      /* deployer */, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary,
    ] = self.accounts;
    // deploy a test ERC20 token to use it as the terms currency
    self.PaymentTokenInstance = await deployPaymentToken(
      buidlerRuntime, creatorObligor, [counterpartyObligor, counterpartyBeneficiary],
    );

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    self.terms = {
      ...await getDefaultTerms('CEG'),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };
    // set address of payment token as currency in terms
    self.terms.currency = self.PaymentTokenInstance.options.address;
    self.terms.settlementCurrency = self.PaymentTokenInstance.options.address;

    self.schedule = await generateSchedule(self.CEGEngineInstance, self.terms);
    self.state = web3ResponseToState(
      await self.CEGEngineInstance.methods.computeInitialState(self.terms).call()
    );

    const { events } = await self.CEGActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.CEGEngineInstance.options.address,
      ZERO_ADDRESS
    ).send({ from: creatorObligor });
    await expectEvent(events, 'InitializedAsset');

    self.assetId = events.InitializedAsset.returnValues.assetId;
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should process the next cyclic event', async () => {
    const _event = await this.CEGRegistryInstance.methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms)

    const payoff = new BigNumber(await this.CEGEngineInstance.methods.computePayoffForEvent(
      this.terms,
      this.state,
      _event,
      web3.utils.toHex(eventTime)
    ).call());

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.methods.approve(
      this.CEGActorInstance.options.address,
      value
    ).send({ from: (payoff.isGreaterThan(0)) ? counterpartyObligor : creatorObligor });

    // settle and progress asset state
    await mineBlock(eventTime);
    const { events } = await this.CEGActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: creatorObligor });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(await this.CEGRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call());
    const isEventSettled = await this.CEGRegistryInstance.methods.isEventSettled(web3.utils.toHex(this.assetId), _event).call();
    const projectedNextState = web3ResponseToState(await this.CEGEngineInstance.methods.computeStateForEvent(
      this.terms,
      this.state,
      _event,
      web3.eth.abi.encodeParameter('uint256', eventTime)
    ).call());
    const storedNextEvent = await this.CEGRegistryInstance.methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();

    assert.strictEqual(emittedAssetId, this.assetId);
    assert.notStrictEqual(storedNextEvent, _event);
    assert.strictEqual(storedNextState.statusDate, String(eventTime));
    assert.strictEqual(isEventSettled[0], true);
    assert.strictEqual(isEventSettled[1].toString(), payoff.toFixed());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });
});
