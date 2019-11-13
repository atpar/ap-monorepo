// const { shouldFail, expectEvent } = require('openzeppelin-test-helpers');

// const PaymentRegistry = artifacts.require('PaymentRegistry');
// const ERC20SampleToken = artifacts.require('ERC20SampleToken');

// const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');

// const UNAUTHORIZED_SENDER_OR_UNKNOWN_OWNERSHIP = 'UNAUTHORIZED_SENDER_OR_UNKNOWN_OWNERSHIP';
// const INVALID_FUNCTION_PARAMETERS = 'INVALID_FUNCTION_PARAMETERS';


// contract('PaymentKernel', (accounts) => {
//   const recordCreatorObligor = accounts[0];
//   const recordCreatorBeneficiary = accounts[1];
//   const counterpartyObligor = accounts[2];
//   const counterpartyBeneficiary = accounts[3];
  
//   const cashflowIdBeneficiary = accounts[4];

//   before(async () => {
//     const instances = await setupTestEnvironment();
//     Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

//     this.assetId = 'C123';
//     this.terms = await getDefaultTerms();
//     this.state = await this.PAMEngineInstance.computeInitialState(this.terms);
//     this.value = 5000;
//     this.ownership = {
//       recordCreatorObligor, 
//       recordCreatorBeneficiary, 
//       counterpartyObligor, 
//       counterpartyBeneficiary
//     };
//     this.protoEventSchedules = {
//       nonCyclicProtoEventSchedule: await this.PAMEngineInstance.computeNonCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate),
//       cyclicIPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 8),
//       cyclicPRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 15),
//       cyclicSCProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 19),
//       cyclicRRProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 18),
//       cyclicFPProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 4),
//       cyclicPYProtoEventSchedule: await this.PAMEngineInstance.computeCyclicProtoEventScheduleSegment(this.terms, this.terms.contractDealDate, this.terms.maturityDate, 11),
//     };

//     await this.AssetRegistryInstance.registerAsset(
//       web3.utils.toHex(this.assetId), 
//       this.ownership,
//       this.terms,
//       this.state,
//       this.protoEventSchedules,
//       this.PAMEngineInstance.address,
//       '0x0000000000000000000000000000000000000000'
//     );

//     await this.AssetRegistryInstance.setBeneficiaryForCashflowId(
//       web3.utils.toHex(this.assetId),
//       5,
//       cashflowIdBeneficiary,
//       { from: recordCreatorBeneficiary }
//     );

//     // deploy test ERC20 token
//     this.PaymentTokenInstance = await ERC20SampleToken.new();
//     await this.PaymentTokenInstance.transfer(counterpartyObligor, 100000);

//     // set allowance for Payment Router
//     await this.PaymentTokenInstance.approve(
//       this.PaymentRouterInstance.address, 
//       100000
//     );
//     await this.PaymentTokenInstance.approve(
//       this.PaymentRouterInstance.address, 
//       100000, 
//       { from: counterpartyObligor }
//     );
//   });

//   it('should settle and register a payment', async () => {
//     const preBalanceOfBeneficiary = await this.PaymentTokenInstance.balanceOf(counterpartyBeneficiary);

//     const eventId = web3.utils.soliditySha3(3, 2222); // arbitrary eventId

//     const { tx: txHash } = await this.PaymentRouterInstance.settlePayment(
//       web3.utils.toHex(this.assetId), 
//       -3,
//       eventId,
//       this.PaymentTokenInstance.address,
//       5000,
//       { from: recordCreatorObligor }
//     );
    
//     const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(txHash, PaymentRegistry, 'Paid');

//     const payoffBalanceFromEvent = await this.PaymentRegistryInstance.getPayoffBalance(emittedAssetId, eventId);
//     const payoffBalance = await this.PaymentRegistryInstance.getPayoffBalance(web3.utils.toHex(this.assetId), eventId); // eventId)

//     const postBalanceOfBeneficiary = await this.PaymentTokenInstance.balanceOf(counterpartyBeneficiary);


//     assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
//     assert.isTrue(payoffBalanceFromEvent.toString() === payoffBalance.toString());
//     assert.isTrue(payoffBalance > 0);
//     assert.equal(Number(preBalanceOfBeneficiary) + this.value, postBalanceOfBeneficiary);
//   });

//   it('should settle and register a payment routed to a beneficiary corresponding to a CashflowId', async () => {
//     const preBalanceOfBeneficiary = await this.PaymentTokenInstance.balanceOf(cashflowIdBeneficiary);
    
//     const eventId = web3.utils.soliditySha3(5, 3333); // arbitrary eventId

//     const { tx: txHash } = await this.PaymentRouterInstance.settlePayment(
//       web3.utils.toHex(this.assetId), 
//       5,
//       eventId,
//       this.PaymentTokenInstance.address,
//       5000,
//       { from: counterpartyObligor }
//     );
    
//     const { args: { 0: emittedAssetId } } = await expectEvent.inTransaction(txHash, PaymentRegistry, 'Paid');
    
//     const payoffBalanceFromEvent = await this.PaymentRegistryInstance.getPayoffBalance(emittedAssetId, eventId);
//     const payoffBalance = await this.PaymentRegistryInstance.getPayoffBalance(web3.utils.toHex(this.assetId), eventId);

//     const postBalanceOfBeneficiary = await this.PaymentTokenInstance.balanceOf(cashflowIdBeneficiary);

//     assert.equal(web3.utils.hexToUtf8(emittedAssetId), this.assetId);
//     assert.isTrue(payoffBalanceFromEvent.toString() === payoffBalance.toString());
//     assert.isTrue(payoffBalance > 0);
//     assert.equal(Number(preBalanceOfBeneficiary) + this.value, postBalanceOfBeneficiary);
//   });

//   it('should revert for an invalid AssetId and an invalid CashflowId', async () => {
//     await shouldFail.reverting.withMessage(
//       this.PaymentRouterInstance.settlePayment(
//         web3.utils.toHex(''), 
//         -3,
//         '0x0000000000000000000000000000000000000001',
//         this.PaymentTokenInstance.address,
//         5000,
//         { from: recordCreatorObligor }
//       ),
//       'PaymentRouter.settlePayment: ' + INVALID_FUNCTION_PARAMETERS
//     );

//     await shouldFail.reverting.withMessage(
//       this.PaymentRouterInstance.settlePayment(
//         web3.utils.toHex(this.assetId), 
//         0,
//         '0x0000000000000000000000000000000000000001',
//         this.PaymentTokenInstance.address,
//         5000,
//         { from: recordCreatorObligor }
//       ),
//       'PaymentRouter.settlePayment: ' + INVALID_FUNCTION_PARAMETERS
//     );
//   });

//   it('should revert for an unknown ownership of a contract', async () => {
//     await shouldFail.reverting.withMessage(
//       this.PaymentRouterInstance.settlePayment(
//         web3.utils.toHex('C567'), 
//         -3,
//         '0x0000000000000000000000000000000000000001',
//         this.PaymentTokenInstance.address,
//         5000,
//         { from: recordCreatorObligor }
//       ),
//       'PaymentRouter.settlePayment: ' + UNAUTHORIZED_SENDER_OR_UNKNOWN_OWNERSHIP
//     );
//   });

//   it('should revert for an unauthorized sender', async () => {
//     await shouldFail.reverting.withMessage(
//       this.PaymentRouterInstance.settlePayment(
//         web3.utils.toHex(this.assetId), 
//         3,
//         '0x0000000000000000000000000000000000000001',
//         this.PaymentTokenInstance.address,
//         5000,
//         { from: counterpartyBeneficiary}
//       ),
//       'PaymentRouter.settlePayment: ' + UNAUTHORIZED_SENDER_OR_UNKNOWN_OWNERSHIP
//     );
//   });

//   it('should revert for an unauthorized sender (for a payment routed to a beneficiary corresponding to a CashflowId)', async () => {
//     await shouldFail.reverting.withMessage(
//       this.PaymentRouterInstance.settlePayment(
//         web3.utils.toHex(this.assetId), 
//         5,
//         '0x0000000000000000000000000000000000000001',
//         this.PaymentTokenInstance.address,
//         5000,
//         { from: recordCreatorObligor }
//       ),
//       'PaymentRouter.settlePayment: ' + UNAUTHORIZED_SENDER_OR_UNKNOWN_OWNERSHIP
//     );
//   });
// });
