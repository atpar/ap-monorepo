/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const BigNumber = require('bignumber.js');

const { getDefaultTerms, getSnapshotTaker, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/utils/blockchain');
const {
  generateSchedule, expectEvent, parseTerms, ZERO_ADDRESS, ZERO_BYTES32, web3ResponseToState,
} = require('../../../helper/utils/utils');


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

    [
      /*deployer*/, /*actor*/, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody,
    ] = self.accounts;

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };

    // deploy a test ERC20 token to use it as the terms currency
    self.PaymentTokenInstance = await deployPaymentToken(
      buidlerRuntime, creatorObligor, [counterpartyBeneficiary],
    );
    const { options: { address: paymentTokenAddress }} = self.PaymentTokenInstance;

    self.terms = {
      ...await getDefaultTerms("PAM"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true },
      currency: paymentTokenAddress,
      settlementCurrency: paymentTokenAddress,
    };

    self.schedule = await generateSchedule(self.PAMEngineInstance, self.terms);
    self.state = web3ResponseToState(
      await self.PAMEngineInstance.methods.computeInitialState(self.terms).call()
    );

    const { events } = await self.PAMActorInstance.methods.initialize(
      self.terms,
      self.schedule,
      self.ownership,
      self.PAMEngineInstance.options.address,
      ZERO_ADDRESS,
      ZERO_ADDRESS
    ).send({ from: nobody });
    expectEvent(events, 'InitializedAsset');

    self.assetId = events.InitializedAsset.returnValues.assetId;
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    // take (on the 1st call) or restore (on further calls) the snapshot
    await this.setupTestEnvironment()
  });

  it('should initialize an asset', async () => {
    const storedTerms = await this.PAMRegistryInstance.methods
      .getTerms(web3.utils.toHex(this.assetId)).call();
    const storedState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedOwnership = await this.PAMRegistryInstance.methods
      .getOwnership(web3.utils.toHex(this.assetId)).call();
    const storedEngineAddress = await this.PAMRegistryInstance.methods
      .getEngine(web3.utils.toHex(this.assetId)).call();

    assert.deepStrictEqual(parseTerms(storedTerms), parseTerms(Object.values(this.terms)));
    assert.deepStrictEqual(storedState, this.state);
    assert.deepStrictEqual(storedEngineAddress, this.PAMEngineInstance.options.address);

    assert.strictEqual(storedOwnership.creatorObligor, creatorObligor);
    assert.strictEqual(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.strictEqual(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.strictEqual(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should process next state with contract status equal to PF', async () => {
    const _event = await this.PAMRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    const payoff = new BigNumber(
      await this.PAMEngineInstance.methods.computePayoffForEvent(
        this.terms,
        this.state,
        _event,
        web3.eth.abi.encodeParameter('uint256', eventTime)
      ).call()
    );

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.methods.approve(
      this.PAMActorInstance.options.address,
      value,
    ).send({ from: creatorObligor });

    // settle and progress asset state
    await mineBlock(eventTime);
    const { events } = await this.PAMActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: creatorObligor });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.PAMRegistryInstance.methods
      .isEventSettled(web3.utils.toHex(this.assetId), _event).call();
    const projectedNextState = web3ResponseToState(
      await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.eth.abi.encodeParameter('uint256', eventTime)
      ).call()
    );

    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(isEventSettled[0], true);
    assert.strictEqual(isEventSettled[1].toString(), payoff.toFixed());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });

  it('should process next state transitioning from PF to DL', async () => {
    const _event = await this.PAMRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state
    await mineBlock(eventTime);

    const { events } = await this.PAMActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.PAMRegistryInstance.methods
      .isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState = web3ResponseToState(
      await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.eth.abi.encodeParameter('uint256', eventTime)
      ).call()
    );

    projectedNextState.nonPerformingDate = String(eventTime); // eventTime of first event
    projectedNextState.contractPerformance = '1'; // DL

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(storedFinalizedState.statusDate.toString(), this.state.statusDate.toString());
    assert.strictEqual(isEventSettled[0], false);
    assert.strictEqual(isEventSettled[1].toString(), '0');
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });

  it('should process next state transitioning from PF to DQ', async () => {
    const _event = await this.PAMRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state to after grace period
    await mineBlock(Number(eventTime) + 3000000);

    const { events } = await this.PAMActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.PAMRegistryInstance.methods
      .isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState = web3ResponseToState(
      await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.eth.abi.encodeParameter('uint256', eventTime)
      ).call()
    );

    // nonPerformingDate = eventTime of first event
    projectedNextState.nonPerformingDate = String(eventTime); // eventTime of first event
    projectedNextState.contractPerformance = '2'; // DQ

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(storedFinalizedState.statusDate, this.state.statusDate);
    assert.strictEqual(isEventSettled[0], false);
    assert.strictEqual(isEventSettled[1].toString(), '0');
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });

  it('should process next state transitioning from PF to DF', async () => {
    const _event = await this.PAMRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state to after deliquency period
    await mineBlock(Number(eventTime) + 30000000);

    const { events } = await this.PAMActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.PAMRegistryInstance.methods
      .isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState = web3ResponseToState(
      await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.eth.abi.encodeParameter('uint256', eventTime)
      ).call()
    );

    projectedNextState.nonPerformingDate = String(eventTime); // eventTime of first event
    projectedNextState.contractPerformance = '3'; // DF

    // compare results
    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(storedFinalizedState.statusDate, this.state.statusDate);
    assert.strictEqual(isEventSettled[0], false);
    assert.strictEqual(isEventSettled[1].toString(), '0');
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });

  it('should process next state transitioning from DL to PF', async () => {
    const _event = await this.PAMRegistryInstance.methods
      .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state
    await mineBlock(eventTime);

    const { events } = await this.PAMActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId_DL = events.ProgressedAsset.returnValues.assetId;

    const storedNextState_DL = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState_DL = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const storedPendingEvent_DL = await this.PAMRegistryInstance.methods
      .getPendingEvent(web3.utils.toHex(this.assetId)).call();
    const isEventSettled_DL = await this.PAMRegistryInstance.methods
      .isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState_DL = web3ResponseToState(
      await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.eth.abi.encodeParameter('uint256', eventTime)
      ).call()
    );

    projectedNextState_DL.nonPerformingDate = String(eventTime); // eventTime of first event
    projectedNextState_DL.contractPerformance = '1'; // DL

    // compare results
    assert.strictEqual(emittedAssetId_DL, this.assetId);
    assert.strictEqual(_event, storedPendingEvent_DL);
    assert.strictEqual(storedNextState_DL.statusDate.toString(), eventTime.toString());
    assert.strictEqual(storedFinalizedState_DL.statusDate, this.state.statusDate);
    assert.strictEqual(isEventSettled_DL[0], false);
    assert.strictEqual(isEventSettled_DL[1].toString(), '0');
    assert.deepStrictEqual(storedNextState_DL, projectedNextState_DL);

    const payoff = new BigNumber(
      await this.PAMEngineInstance.methods.computePayoffForEvent(
        this.terms,
        this.state,
        _event,
        web3.eth.abi.encodeParameter('uint256', eventTime)
      ).call()
    );

    const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

    // set allowance for Payment Router
    await this.PaymentTokenInstance.methods.approve(
      this.PAMActorInstance.options.address,
      value,
    ).send({ from: creatorObligor });

    const { events: events_PF } = await this.PAMActorInstance.methods.progress(web3.utils.toHex(this.assetId))
      .send({ from: nobody });
    expectEvent(events_PF, 'ProgressedAsset');
    const emittedAssetId_PF = events_PF.ProgressedAsset.returnValues.assetId;

    const storedNextState_PF = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState_PF = web3ResponseToState(
      await this.PAMRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const storedPendingEvent_PF = await this.PAMRegistryInstance.methods
      .getPendingEvent(web3.utils.toHex(this.assetId)).call();
    const isEventSettled_PF = await this.PAMRegistryInstance.methods
      .isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState_PF = web3ResponseToState(
      await this.PAMEngineInstance.methods.computeStateForEvent(
        this.terms,
        this.state,
        _event,
        web3.eth.abi.encodeParameter('uint256', eventTime)
      ).call()
    );

    projectedNextState_PF.nonPerformingDate = String(0); // 0
    projectedNextState_PF.contractPerformance = '0'; // PF

    // compare results
    assert.strictEqual(emittedAssetId_PF, this.assetId);
    assert.strictEqual(storedPendingEvent_PF, ZERO_BYTES32);
    assert.strictEqual(storedNextState_PF.statusDate.toString(), eventTime.toString());
    assert.strictEqual(storedFinalizedState_PF.statusDate, this.state.statusDate);
    assert.strictEqual(isEventSettled_PF[0], true);
    assert.strictEqual(isEventSettled_PF[1].toString(), payoff.toFixed());
    assert.deepStrictEqual(storedNextState_PF, projectedNextState_PF);
  });
});
