/*jslint node*/
/*global before, beforeEach, describe, it, web3*/
const assert = require('assert');
const buidlerRuntime = require('@nomiclabs/buidler');
const BigNumber = require('bignumber.js');

const { mineBlock } = require('../../../helper/utils/blockchain');
const { getTestCases } = require('../../../helper/ACTUS/tests');
const { getSnapshotTaker, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const {
  expectEvent, generateSchedule, web3ResponseToState, ZERO_ADDRESS, ZERO_BYTES32
} = require('../../../helper/utils/utils');


describe('PAMActor', () => {
  let actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary;

  const getEventTime = async (_event, terms) => {
    return Number(
        await this.PAMEngineInstance.methods.computeEventTimeForEvent(
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
      /* deployer */, actor, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary,
    ] = self.accounts;
    // deploy a test ERC20 token to use it as the terms currency
    self.PaymentTokenInstance = await deployPaymentToken(
        buidlerRuntime, creatorObligor, [counterpartyObligor, counterpartyBeneficiary],
    );

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    self.terms = {
      ...(await getTestCases('PAM'))['pam01']['terms'],
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
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
    await this.setupTestEnvironment();
  });

  it('should initialize Asset with ContractType PAM', async () => {
    const { events } = await this.PAMActorInstance.methods.initialize(
        this.terms,
        this.schedule,
        this.ownership,
        this.PAMEngineInstance.options.address,
        ZERO_ADDRESS
    ).send({ from: actor });
    expectEvent(events, 'InitializedAsset');

    this.assetId = events.InitializedAsset.returnValues.assetId;
    const storedState = web3ResponseToState(
        await this.PAMRegistryInstance.methods.getState(this.assetId).call()
    );

    assert.deepStrictEqual(storedState, this.state);
  });

  it('should correctly settle all events according to the schedule', async () => {
    for (const nextExpectedEvent of this.schedule) {
      const nextEvent = await this.PAMRegistryInstance.methods.getNextScheduledEvent(
          web3.utils.toHex(this.assetId)
      ).call();
      const eventTime = await getEventTime(nextEvent, this.terms);
      const payoff = new BigNumber(await this.PAMEngineInstance.methods.computePayoffForEvent(
          this.terms,
          this.state,
          nextEvent,
          ZERO_BYTES32
      ).call());
      const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

      // set allowance for Payment Router
      await this.PaymentTokenInstance.methods.approve(
          this.PAMActorInstance.options.address,
          value
      ).send({ from: (payoff.isLessThan(0)) ? creatorObligor : counterpartyObligor });

      // settle and progress asset state
      await mineBlock(eventTime);
      const { events } = await this.PAMActorInstance.methods.progress(this.assetId).send({ from: creatorObligor });
      expectEvent(events, 'ProgressedAsset');
      const emittedAssetId = events.ProgressedAsset.returnValues.assetId;

      const storedNextState = web3ResponseToState(await this.PAMRegistryInstance.methods.getState(this.assetId).call());
      const isEventSettled = await this.PAMRegistryInstance.methods.isEventSettled(this.assetId, nextEvent).call();
      const projectedNextState = web3ResponseToState(
          await this.PAMEngineInstance.methods.computeStateForEvent(
              this.terms,
              this.state,
              nextEvent,
              ZERO_BYTES32
          ).call()
      );

      assert.strictEqual(nextExpectedEvent, nextEvent);
      assert.strictEqual(emittedAssetId, this.assetId);
      assert.strictEqual(storedNextState.statusDate, eventTime.toString());
      assert.deepStrictEqual(storedNextState, projectedNextState);
      assert.strictEqual(isEventSettled[0], true);
      assert.strictEqual(isEventSettled[1], payoff.toFixed());

      this.state = storedNextState;
    }
  });
});
