/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const buidlerRuntime = require('hardhat');
const { expectRevert } = require('@openzeppelin/test-helpers');

const { getSnapshotTaker, getDefaultTerms, deployPaymentToken } = require('../../../helper/setupTestEnvironment');
const { generateSchedule, ZERO_BYTES32, ZERO_ADDRESS } = require('../../../helper/utils/utils');
const { encodeEvent } = require('../../../helper/utils/schedule');
const { mineBlock } = require('../../../helper/utils/blockchain');
const { getEnumIndexForEventType: eventIndex } = require('../../../helper/utils/dictionary');

describe('ANNActor', () => {
  let admin;

  const getEventTime = async (_event, terms) => {
    return Number(await this.ANNEngineInstance.methods.computeEventTimeForEvent(
      _event,
      terms.businessDayConvention,
      terms.calendar,
      terms.maturityDate
    ).call());
  }

  /** @param {any} self - `this` inside `before()` (and `it()`) */
  const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
    // code bellow runs right before the EVM snapshot gets taken

    admin = self.accounts[0];
    const [ ,, creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary ] = self.accounts;

    self.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };

    // deploy a test ERC20 token to use it as the terms currency
    const { options: { address: paymentTokenAddress }} = await deployPaymentToken(
      buidlerRuntime, creatorObligor, [ counterpartyBeneficiary ]
    );
    self.terms = {
      ...await getDefaultTerms("ANN"),
      gracePeriod: { i: 1, p: 2, isSet: true },
      delinquencyPeriod: { i: 1, p: 3, isSet: true },
      currency: paymentTokenAddress,
      settlementCurrency: paymentTokenAddress,
    };

    self.schedule = await generateSchedule(self.ANNEngineInstance, self.terms);
  });

  before(async () => {
    this.setupTestEnvironment = snapshotTaker(this);
  });

  beforeEach(async () => {
    // take (on the 1st call) or restore (on further calls) the snapshot
    await this.setupTestEnvironment()
  });

  it('should process next state for an unscheduled event', async () => {
    const tx = await this.ANNActorInstance.methods.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.ANNEngineInstance.options.address,
      admin,
      ZERO_ADDRESS
    ).send(this.txOpts);

    this.assetId = tx.events.InitializedAsset.returnValues.assetId;

    const initialState = await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();
    const event = encodeEvent(eventIndex('IP'), Number(this.terms.statusDate) + 100);
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    const tx2 = await this.ANNActorInstance.methods.progressWith(
      web3.utils.toHex(this.assetId),
      event,
    ).send({ from: admin });
    const emittedAssetId = tx2.events.ProgressedAsset.returnValues.assetId;
    const storedNextState = await this.ANNRegistryInstance.methods.getState(web3.utils.toHex(this.assetId)).call();

    // compute expected next state
    const projectedNextState = await this.ANNEngineInstance.methods.computeStateForEvent(
      this.terms,
      initialState,
      event,
      ZERO_BYTES32
    ).call();

    // compare results
    assert.strictEqual(emittedAssetId.toString(), this.assetId.toString());
    assert.strictEqual(storedNextState.statusDate.toString(), eventTime.toString());
    assert.strictEqual(storedNextState.toString(), projectedNextState.toString());
  });

  it('should not process next state for an unscheduled event with a later schedule time', async () => {
    const tx = await this.ANNActorInstance.methods.initialize(
      this.terms,
      this.schedule,
      this.ownership,
      this.ANNEngineInstance.options.address,
      admin,
      ZERO_ADDRESS
    ).send(this.txOpts);

    this.assetId = tx.events.InitializedAsset.returnValues.assetId;

    const event = await this.ANNRegistryInstance
      .methods.getNextScheduledEvent(web3.utils.toHex(this.assetId)).call();
    const eventTime = await getEventTime(event, this.terms);

    await mineBlock(Number(eventTime));

    await expectRevert(
      this.ANNActorInstance.methods.progressWith(
        web3.utils.toHex(this.assetId),
        event,
      ).send({ from: admin }),
      'BaseActor.progressWith: ' + 'FOUND_EARLIER_EVENT'
    );
  });
});
