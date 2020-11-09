/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const BigNumber = require('bignumber.js');

const { getDefaultTerms, getSnapshotTaker, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain');
const { expectEvent, ZERO_ADDRESS, web3ResponseToState } = require('../../../helper/utils/utils');


describe('ANNActor', () => {
  let creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  const getEventTime = async (_event, terms) => {
    return Number(
      await this.ANNEngineInstance.methods.computeEventTimeForEvent(
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

    [ /*deployer*/, /*actor*/,
      creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody
    ] = self.accounts;

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };

    // deploy a test ERC20 token to use it as the terms currency
    self.PaymentTokenInstance = await deployPaymentToken(
      buidlerRuntime, creatorObligor, [counterpartyObligor, counterpartyBeneficiary],
    );

    self.terms = {
      ...await getDefaultTerms("ANN"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true },
      currency: self.PaymentTokenInstance.options.address,
      settlementCurrency: self.PaymentTokenInstance.options.address,
    };
    self.terms.statusDate = self.terms.contractDealDate;

    self.schedule = [];
    self.state = web3ResponseToState(
      await self.ANNEngineInstance.methods.computeInitialState(self.terms).call()
    );

    const { events } = await self.ANNActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.ANNEngineInstance.options.address,
      ZERO_ADDRESS
    ).send({ from: nobody });
    expectEvent(events, 'InitializedAsset');

    self.assetId = events.InitializedAsset.returnValues.assetId;
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    await this.setupTestEnvironment();
  });

  it('should process the next cyclic event', async () => {
    const _event = await this.ANNRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();
    const eventTime = await getEventTime(_event, this.terms);

    const payoff = new BigNumber(
      await this.ANNEngineInstance.methods.computePayoffForEvent(
        this.terms,
        this.state,
        _event,
        web3.utils.toHex(eventTime)
      ).call()
    );

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.methods.approve(
      this.ANNActorInstance.options.address,
      value
    ).send({ from: (payoff.isGreaterThan(0)) ? counterpartyObligor : creatorObligor });

    // settle and progress asset state
    await mineBlock(eventTime);
    const { events } = await this.ANNActorInstance.methods.progress(
      web3.utils.toHex(this.assetId),
    ).send({ from: creatorObligor });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
      await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.ANNRegistryInstance.methods.isEventSettled(
      web3.utils.toHex(this.assetId), _event
    ).call();
    const projectedNextState = web3ResponseToState(
      await this.ANNEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.utils.toHex(0)
      ).call()
    );
    const storedNextEvent = await this.ANNRegistryInstance.methods.getNextScheduledEvent(
      web3.utils.toHex(this.assetId)
    ).call();

    assert.strictEqual(emittedAssetId, this.assetId);
    assert.notStrictEqual(storedNextEvent, _event);
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(isEventSettled[0], true);
    assert.strictEqual(isEventSettled[1].toString(), payoff.toFixed());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });
});
