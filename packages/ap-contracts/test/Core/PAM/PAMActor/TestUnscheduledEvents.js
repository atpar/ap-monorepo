const { expectEvent, shouldFail } = require('openzeppelin-test-helpers');
const PAMActor = artifacts.require('PAMActor');

const { setupTestEnvironment, getDefaultTerms, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, ZERO_BYTES32, parseTerms } = require('../../../helper/utils');
const { encodeEvent } = require('../../../helper/scheduleUtils');
const { createSnapshot, revertToSnapshot, mineBlock } = require('../../../helper/blockchain');


contract('PAMActor', (accounts) => {

  const admin = accounts[0];
  const creatorObligor = accounts[1];
  const creatorBeneficiary = accounts[2];
  const counterpartyObligor = accounts[3];
  const counterpartyBeneficiary = accounts[4];

  let snapshot;

  const getEventTime = async (_event, terms) => {
    return Number(await this.PAMEngineInstance.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ));
  }

  before(async () => {
    this.instances = await setupTestEnvironment(accounts);
    Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

    this.assetId;
    this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
    this.terms = {
      ...await getDefaultTerms("PAM"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true }
    };

    // deploy test ERC20 token
    this.PaymentTokenInstance = await deployPaymentToken(creatorObligor, [counterpartyBeneficiary]);
    // set address of payment token as currency in terms
    this.terms.currency = this.PaymentTokenInstance.address;
    this.terms.settlementCurrency = this.PaymentTokenInstance.address;
    this.terms.statusDate = this.terms.contractDealDate;

    this.schedule = await generateSchedule(this.PAMEngineInstance, this.terms);

    snapshot = await createSnapshot();
  });

  afterEach(async () => {
    await revertToSnapshot(snapshot);
  });

  it('should process next state for an unscheduled event', async () => {
    const tx = await this.PAMActorInstance.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.PAMEngineInstance.address,
      admin
    );

    this.assetId = tx.logs[0].args.assetId;

    const initialState = await this.PAMRegistryInstance.getState(web3.utils.toHex(this.assetId));
    const event = encodeEvent(9, Number(this.terms.contractDealDate) + 100);
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    const { tx: txHash } = await this.PAMActorInstance.progressWith(
      web3.utils.toHex(this.assetId),
      event,
      { from: admin }
    );
    const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
      txHash, PAMActor, 'ProgressedAsset'
    );
    const storedNextState = await this.PAMRegistryInstance.getState(web3.utils.toHex(this.assetId));

    // compute expected next state
    const projectedNextState = await this.PAMEngineInstance.computeStateForEvent(
      this.terms,
      initialState,
      event,
      ZERO_BYTES32
    );

    // compare results
    assert.equal(emittedAssetId, this.assetId);
    assert.equal(storedNextState.statusDate, eventTime);
    assert.deepEqual(storedNextState, projectedNextState);
  });

  // it('should not process next state for an unscheduled event with a later schedule time', async () => {
  //   await this.PAMActorInstance.initialize(
  //     this.terms,
  //     this.schedule,
  //     this.ownership,
  //     this.PAMEngineInstance.address,
  //     admin
  //   );
  //
  //   const event = await this.PAMRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
  //   const eventTime = await getEventTime(event, this.terms);
  //
  //   await mineBlock(Number(eventTime));
  //
  //   await shouldFail.reverting.withMessage(
  //     this.PAMActorInstance.progressWith(
  //       web3.utils.toHex(this.assetId),
  //       event,
  //       { from: admin }
  //     ),
  //     'BaseActor.progressWith: ' + 'FOUND_EARLIER_EVENT'
  //   );
  // });
});
