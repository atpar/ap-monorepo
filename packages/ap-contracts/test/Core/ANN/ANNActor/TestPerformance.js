/*jslint node*/
/*global before, beforeEach, describe, it*/
const assert = require('assert');
const bre = require('@nomiclabs/buidler');
const BigNumber = require('bignumber.js');

const { getDefaultTerms, getSnapshotTaker, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { mineBlock } = require('../../../helper/blockchain');
const {
  generateSchedule, expectEvent, parseTerms, ZERO_ADDRESS, ZERO_BYTES32, web3ResponseToState,
} = require('../../../helper/utils');

describe('ANNActor', () => {
  let creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody;

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
  const snapshotTaker = (self) => getSnapshotTaker(bre, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    [
      /*deployer*/, /*actor*/, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary, nobody,
    ] = self.accounts;

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };

    // deploy a test ERC20 token to use it as the terms currency
    self.PaymentTokenInstance = await deployPaymentToken(
        bre, creatorObligor, [counterpartyBeneficiary],
    );
    const { options: { address: paymentTokenAddress }} = self.PaymentTokenInstance;

    self.terms = {
      ...await getDefaultTerms("ANN"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true },
      currency: paymentTokenAddress,
      settlementCurrency: paymentTokenAddress,
    };
    self.terms.statusDate = self.terms.contractDealDate;

    self.schedule = await generateSchedule(self.ANNEngineInstance, self.terms);
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
    await expectEvent(events, 'InitializedAsset');

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
    const storedTerms = await this.ANNRegistryInstance.methods
        .getTerms(web3.utils.toHex(this.assetId)).call();
    const storedState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedOwnership = await this.ANNRegistryInstance.methods
        .getOwnership(web3.utils.toHex(this.assetId)).call();
    const storedEngineAddress = await this.ANNRegistryInstance.methods
        .getEngine(web3.utils.toHex(this.assetId)).call();

    assert.deepStrictEqual(parseTerms(storedTerms), parseTerms(Object.values(this.terms)));
    assert.deepStrictEqual(storedState, this.state);
    assert.deepStrictEqual(storedEngineAddress, this.ANNEngineInstance.options.address);

    assert.strictEqual(storedOwnership.creatorObligor, creatorObligor);
    assert.strictEqual(storedOwnership.creatorBeneficiary, creatorBeneficiary);
    assert.strictEqual(storedOwnership.counterpartyObligor, counterpartyObligor);
    assert.strictEqual(storedOwnership.counterpartyBeneficiary, counterpartyBeneficiary);
  });

  it('should process next state with contract status equal to PF', async () => {
    const _event = await this.ANNRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms)

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
        value,
    ).send({ from: creatorObligor });

    // settle and progress asset state
    await mineBlock(eventTime);
    const { events } = await this.ANNActorInstance.methods.progress(
        web3.utils.toHex(this.assetId)
    ).send({ from: creatorObligor });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.ANNRegistryInstance
        .methods.isEventSettled(web3.utils.toHex(this.assetId), _event).call();
    const projectedNextState = web3ResponseToState(
        await this.ANNEngineInstance.methods.computeStateForEvent(
            this.terms,
            this.state,
            _event,
            web3.utils.toHex(eventTime)
        ).call()
    );

    assert.strictEqual(emittedAssetId, this.assetId);
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(isEventSettled[0], true);
    assert.strictEqual(isEventSettled[1].toString(), payoff.toFixed());
    assert.deepStrictEqual(storedNextState, projectedNextState);
  });

  it('should process next state transitioning from PF to DL', async () => {
    const _event = await this.ANNRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state
    await mineBlock(eventTime);

    const { events } = await this.ANNActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send({ from: nobody });
    await expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.ANNRegistryInstance
        .methods.isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState = web3ResponseToState(
        await this.ANNEngineInstance.methods.computeStateForEvent(
            this.terms,
            this.state,
            _event,
            web3.utils.toHex(eventTime)
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
    const _event = await this.ANNRegistryInstance
        .methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state to after grace period
    await mineBlock(Number(eventTime) + 3000000);

    const { events } = await this.ANNActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.ANNRegistryInstance
        .methods.isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState = web3ResponseToState(
        await this.ANNEngineInstance.methods.computeStateForEvent(
            this.terms,
            this.state,
            _event,
            web3.utils.toHex(eventTime)
        ).call()
    );

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
    const _event = await this.ANNRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state to after deliquency period
    await mineBlock(Number(eventTime) + 30000000);

    const { events } = await this.ANNActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

    const storedNextState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const isEventSettled = await this.ANNRegistryInstance
        .methods.isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState = web3ResponseToState(
        await this.ANNEngineInstance.methods.computeStateForEvent(
            this.terms,
            this.state,
            _event,
            web3.utils.toHex(eventTime)
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
    const _event = await this.ANNRegistryInstance.methods
        .getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(_event, this.terms);

    // progress asset state
    await mineBlock(eventTime);

    const { events } = await this.ANNActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send({ from: nobody });
    expectEvent(events, 'ProgressedAsset');
    const emittedAssetId_DL = events.ProgressedAsset.returnValues.assetId;

    const storedNextState_DL = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState_DL = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const storedPendingEvent_DL = await this.ANNRegistryInstance.methods
        .getPendingEvent(web3.utils.toHex(this.assetId)).call();
    const isEventSettled_DL = await this.ANNRegistryInstance.methods
        .isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState_DL = web3ResponseToState(
        await this.ANNEngineInstance.methods.computeStateForEvent(
            this.terms,
            this.state,
            _event,
            web3.utils.toHex(eventTime)
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
        value,
    ).send({ from: creatorObligor });

    const { events: events_PF } = await this.ANNActorInstance.methods.progress(web3.utils.toHex(this.assetId))
        .send({ from: nobody });
    expectEvent(events_PF, 'ProgressedAsset');
    const emittedAssetId_PF = events.ProgressedAsset.returnValues.assetId;

    const storedNextState_PF = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call()
    );
    const storedFinalizedState_PF = web3ResponseToState(
        await this.ANNRegistryInstance.methods.getFinalizedState(web3.utils.toHex(this.assetId)).call()
    );
    const storedPendingEvent_PF = await this.ANNRegistryInstance
        .methods.getPendingEvent(web3.utils.toHex(this.assetId)).call();
    const isEventSettled_PF = await this.ANNRegistryInstance
        .methods.isEventSettled(web3.utils.toHex(this.assetId), _event).call();

    // compute expected next state
    const projectedNextState_PF = web3ResponseToState(
        await this.ANNEngineInstance.methods.computeStateForEvent(
            this.terms,
            this.state,
            _event,
            web3.utils.toHex(eventTime)
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
