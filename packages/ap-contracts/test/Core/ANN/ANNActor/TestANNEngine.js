const BigNumber = require('bignumber.js');
const { expectEvent } = require('openzeppelin-test-helpers');

const { getTestCases } = require('@atpar/actus-solidity/test/helper/tests');

const { setupTestEnvironment, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../../../helper/blockchain');
const { generateSchedule, ZERO_ADDRESS, ZERO_BYTES32, web3ResponseToState } = require('../../../helper/utils');

const ANNActor = artifacts.require('ANNActor');


contract('ANNActor', (accounts) => {
  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;

  const getEventTime = async (_event, terms) => {
    return Number(await this.ANNEngineInstance.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ));
  }

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = { 
      ...(await getTestCases('ANN'))['ann01']['terms'],
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(creatorObligor, [counterpartyObligor]);

    // set address of payment token as currency in terms
    this.terms.currency = this.PaymentTokenInstance.address;
    this.terms.settlementCurrency = this.PaymentTokenInstance.address;
    this.terms.statusDate = this.terms.contractDealDate;

    this.schedule = await generateSchedule(this.ANNEngineInstance, this.terms);
    this.state = web3ResponseToState(await this.ANNEngineInstance.computeInitialState(this.terms));

    this.assetId;

    snapshot = await createSnapshot()
  });

  after(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should initialize Asset with ContractType ANN', async () => {
    const tx = await this.ANNActorInstance.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.ANNEngineInstance.address,
      ZERO_ADDRESS
    );

    this.assetId = tx.logs[0].args.assetId;
    const storedState = web3ResponseToState(await this.ANNRegistryInstance.getState(this.assetId));

    assert.deepEqual(storedState, this.state);
  });

  it('should correctly settle all events according to the schedule', async () => {
    for (const nextExpectedEvent of this.schedule) {
      const nextEvent = await this.ANNRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
      const eventTime = await getEventTime(nextEvent, this.terms);
      const payoff = new BigNumber(await this.ANNEngineInstance.computePayoffForEvent(
        this.terms, 
        this.state, 
        nextEvent,
        ZERO_BYTES32
      ));
      const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

      // set allowance for Payment Router
      await this.PaymentTokenInstance.approve(
        this.ANNActorInstance.address,
        value,
        { from: (payoff.isLessThan(0)) ? creatorObligor : counterpartyObligor }
      );

      // settle and progress asset state
      await mineBlock(eventTime);
      const { tx: txHash } = await this.ANNActorInstance.progress(this.assetId);
      const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(txHash, ANNActor, 'ProgressedAsset');

      const storedNextState = web3ResponseToState(await this.ANNRegistryInstance.getState(this.assetId));
      const isEventSettled = await this.ANNRegistryInstance.isEventSettled(this.assetId, nextEvent);
      const projectedNextState = web3ResponseToState(await this.ANNEngineInstance.computeStateForEvent(
        this.terms,
        this.state,
        nextEvent,
        ZERO_BYTES32
      ));

      assert.equal(nextExpectedEvent, nextEvent);
      assert.equal(emittedAssetId, this.assetId);
      assert.equal(storedNextState.statusDate, eventTime);
      assert.deepEqual(storedNextState, projectedNextState);
      assert.equal(isEventSettled[0], true);
      assert.equal(isEventSettled[1].toString(), payoff.toFixed());

      this.state = storedNextState;
    }
  });
});
