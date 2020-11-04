/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');
const BigNumber = require('bignumber.js');

const { getDefaultTerms, getSnapshotTaker, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain');
const { generateSchedule, expectEvent, ZERO_ADDRESS, web3ResponseToState } = require('../../../helper/utils/utils');


describe('PAMActor', () => {
  let creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody;

  const getEventTime = async (_event, terms) => {
    return Number(
      await this.PAMEngineInstance.methods.computeEventTimeForEvent(
        _event,
        terms.businessDayConvention,
        terms.calendar,
        terms.maturityDate
      ).call()
    );
  }

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [, , creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody] = self.accounts;

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };

    // deploy a test ERC20 token to use it as the terms currency
    self.PaymentTokenInstance = await deployPaymentToken(
      buidlerRuntime, creatorObligor, [counterpartyObligor, counterpartyBeneficiary],
    );

    self.terms = {
      ...await getDefaultTerms('PAM'),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true },
      currency: self.PaymentTokenInstance.options.address,
      settlementCurrency: self.PaymentTokenInstance.options.address,
    };
    self.terms.statusDate = self.terms.contractDealDate;

    self.schedule = await generateSchedule(self.PAMEngineInstance, self.terms);
    self.state = web3ResponseToState(
      await self.PAMEngineInstance.methods.computeInitialState(self.terms).call()
    );

    const { events } = await this.PAMActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.PAMEngineInstance.options.address,
      ZERO_ADDRESS
    ).send({ from: nobody });
    expectEvent(events, 'InitializedAsset');

    self.assetId = events.InitializedAsset.returnValues.assetId;
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should process the first non-cyclic event', async () => {
    const _event = await this.PAMRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();
    const eventTime = await getEventTime(_event, this.terms);

    const payoff = new BigNumber(
      await this.PAMEngineInstance.methods.computePayoffForEvent(
        this.terms,
        this.state,
        _event,
        web3.utils.toHex(0)
      ).call()
    );

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.methods.approve(
      this.PAMActorInstance.options.address,
      value,
    ).send({ from: (payoff.isGreaterThan(0)) ? counterpartyObligor : creatorObligor });

    // settle and progress asset state
    await mineBlock(eventTime);
    const { events } = await this.PAMActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: creatorObligor });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.PAMRegistryInstance.methods.isEventSettled(
      web3.utils.toHex(this.assetId), _event
    ).call();
    const projectedNextState = web3ResponseToState(
      await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.utils.toHex(0)
      ).call()
    );
    const storedNextEvent = await this.PAMRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();

    assert.strictEqual(emittedAssetId, this.assetId);
    assert.notStrictEqual(storedNextEvent, _event);
    assert.strictEqual(storedNextState.statusDate, eventTime.toString());
    assert.strictEqual(isEventSettled[0], true);
    assert.strictEqual(isEventSettled[1], payoff.toFixed());
    assert.deepStrictEqual(storedNextState, projectedNextState);

    this.state = storedNextState;
  });

  it('should process the next cyclic event', async () => {
    const _event = await this.PAMRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();
    const eventTime = await getEventTime(_event, this.terms);

    const payoff = new BigNumber(
      await this.PAMEngineInstance.methods.computePayoffForEvent(
        this.terms,
        this.state,
        _event,
        web3.utils.toHex(0)
      ).call()
    );

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.methods.approve(
      this.PAMActorInstance.options.address,
      value,
    ).send({ from: (payoff.isGreaterThan(0)) ? counterpartyObligor : creatorObligor });

    // settle and progress asset state
    await mineBlock(eventTime);
    const { events } = await this.PAMActorInstance.methods.progress(
      web3.utils.toHex(this.assetId)
    ).send({ from: creatorObligor });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.PAMRegistryInstance.methods.isEventSettled(
      web3.utils.toHex(this.assetId), _event
    ).call();
    const projectedNextState = web3ResponseToState(
      await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.utils.toHex(0)
      ).call()
    );
    const storedNextEvent = await this.PAMRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();

    assert.strictEqual(emittedAssetId, this.assetId);
    assert.notStrictEqual(storedNextEvent, _event);
    assert.strictEqual(storedNextState.statusDate, eventTime.toString());
    assert.strictEqual(isEventSettled[0], true);
    assert.strictEqual(isEventSettled[1], payoff.toFixed());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });
});
