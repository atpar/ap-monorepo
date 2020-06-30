// const BigNumber = require('bignumber.js');
// const { expectEvent } = require('openzeppelin-test-helpers');

// const { setupTestEnvironment, getDefaultTerms, deployPaymentToken, parseToContractTerms } = require('../../../helper/setupTestEnvironment');
// const { createSnapshot, revertToSnapshot, mineBlock } = require('../../../helper/blockchain');
// const { generateSchedule, parseTerms, ZERO_ADDRESS, ZERO_BYTES32, web3ResponseToState } = require('../../../helper/utils');

// const CEGActor = artifacts.require('CEGActor');


// contract('CEGActor', (accounts) => {

//   const creatorObligor = accounts[1];
//   const creatorBeneficiary = accounts[2];
//   const counterpartyObligor = accounts[3];
//   const counterpartyBeneficiary = accounts[4];

//   let snapshot;
//   let snapshot_asset;
  
//   const getEventTime = async (_event, terms) => {
//     return Number(await this.CEGEngineInstance.computeEventTimeForEvent(
//       _event,
//       terms.businessDayConvention,
//       terms.calendar,
//       terms.maturityDate
//     ));
//   }

//   before(async () => {
//     this.instances = await setupTestEnvironment(accounts);
//     Object.keys(this.instances).forEach((instance) => this[instance] = this.instances[instance]);

//     this.ownership = { creatorObligor, creatorBeneficiary, counterpartyObligor, counterpartyBeneficiary };
//     this.terms = { 
//       ...await getDefaultTerms('CEG'),
//       gracePeriod: { i: 1, p: 2, isSet: true },
//       delinquencyPeriod: { i: 1, p: 3, isSet: true }
//     };

//     // deploy test ERC20 token
//     this.PaymentTokenInstance = await deployPaymentToken(creatorObligor, [counterpartyObligor, counterpartyBeneficiary]);

//     // set address of payment token as currency in terms
//     this.terms.currency = this.PaymentTokenInstance.address;
//     this.terms.settlementCurrency = this.PaymentTokenInstance.address;
//     this.terms.statusDate = this.terms.contractDealDate;

//     this.schedule = [];
//     this.state = web3ResponseToState(await this.CEGEngineInstance.computeInitialState(this.terms));

//     const tx = await this.CEGActorInstance.initialize(
//       this.terms,
//       this.schedule,
//       this.ownership,
//       this.CEGEngineInstance.address,
//       ZERO_ADDRESS
//     );

//     await expectEvent.inTransaction(
//       tx.tx, CEGActor, 'InitializedAsset'
//     );

//     this.assetId =  tx.logs[0].args.assetId;

//     snapshot = await createSnapshot();
//   });

//   after(async () => {
//     await revertToSnapshot(snapshot);
//   });

//   it('should process the next cyclic event', async () => {
//     const _event = await this.ANNRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
//     const eventTime = await getEventTime(_event, this.terms)

//     const payoff = new BigNumber(await this.CEGEngineInstance.computePayoffForEvent(
//       this.terms, 
//       this.state, 
//       _event,
//       web3.utils.toHex(eventTime)
//     ));

//     const value = web3.utils.toHex((payoff.isGreaterThan(0)) ? payoff : payoff.negated());

//     // set allowance for Payment Router
//     await this.PaymentTokenInstance.approve(
//       this.CEGActorInstance.address,
//       value,
//       { from: (payoff.isGreaterThan(0)) ? counterpartyObligor : creatorObligor }
//     );

//     // settle and progress asset state
//     await mineBlock(eventTime);
//     const tx = await this.CEGActorInstance.progress(
//       web3.utils.toHex(this.assetId), 
//       { from: creatorObligor }
//     );
//     const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(
//       tx.tx, CEGActor, 'ProgressedAsset'
//     );

//     const storedNextState = web3ResponseToState(await this.ANNRegistryInstance.getState(web3.utils.toHex(this.assetId)));
//     const isEventSettled = await this.ANNRegistryInstance.isEventSettled(web3.utils.toHex(this.assetId), _event);
//     const projectedNextState = web3ResponseToState(await this.CEGEngineInstance.computeStateForEvent(
//       this.terms,
//       this.state,
//       _event,
//       web3.utils.toHex(eventTime)
//     ));
//     const storedNextEvent = await this.ANNRegistryInstance.getNextScheduledEvent(web3.utils.toHex(this.assetId));
    
//     assert.equal(emittedAssetId, this.assetId);
//     assert.notEqual(storedNextEvent, _event);
//     assert.equal(storedNextState.statusDate, eventTime);
//     assert.equal(isEventSettled[0], true);
//     assert.equal(isEventSettled[1].toString(), payoff.toFixed());
//     assert.deepEqual(storedNextState, projectedNextState);

//     await revertToSnapshot(snapshot_asset);
//     snapshot_asset = await createSnapshot();
//   });
// });
