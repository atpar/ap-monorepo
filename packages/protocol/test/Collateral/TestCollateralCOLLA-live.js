// /* eslint-disable @typescript-eslint/no-var-requires */
// const assert = require('assert');
// const buidlerRuntime = require('hardhat');
// const BigNumber = require('bignumber.js');

// const { generateSchedule, expectEvent, ZERO_ADDRESS } = require('../helper/utils/utils');
// const { decodeEvent } = require('../helper/utils/schedule');
// const { mineBlock } = require('../helper/utils/blockchain');
// const { deployPaymentToken, getSnapshotTaker, deployContract } = require('../helper/setupTestEnvironment');
// const { getEnumIndexForEventType: eventIndex } = require('../helper/utils/dictionary');

// const { getCoinbaseData } = require('./coinbase')
// const coinbaseSigner = '0xfCEAdAFab14d46e20144F48824d0C09B1a03F2BC'

// describe('Collateral', function () {
//   let deployer, owner, lender, debtor;

//   /** @param {any} self - `this` inside `before()` (and `it()`) */
//   const snapshotTaker = (self) => getSnapshotTaker(buidlerRuntime, self, async () => {
//     // code bellow runs right before the EVM snapshot gets taken

//     [ deployer, /*actor*/, owner, lender, debtor, dataProvider ] = self.accounts;

//     self.marketObjectCodeOfCollateral = web3.utils.toHex('ETH');

//     // deploy test ERC20 token
//     self.PaymentTokenInstance = await deployPaymentToken(buidlerRuntime, lender, [lender, debtor]);
//     self.CollateralTokenInstance = await deployPaymentToken(buidlerRuntime, lender, [lender, debtor]);

//     self.OpenOracleInstance = await deployContract(buidlerRuntime, 'OpenOraclePriceData');
//     self.OpenOracleProxyInstance = await deployContract(
//       buidlerRuntime,
//       'OpenOracleProxy',
//       [self.OpenOracleInstance.options.address, coinbaseSigner]
//     );
//     self.CollateralInstance = await deployContract(buidlerRuntime, 'Collateral', [
//       self.COLLARegistryInstance.options.address,
//       self.OpenOracleProxyInstance.options.address
//     ]);

//     self.terms = {
//       ...require('./COLLA-Terms.json'),
//       marketObjectCodeOfCollateral: self.marketObjectCodeOfCollateral,
//       currency: self.PaymentTokenInstance.options.address,
//       // collateralCurrency: self.PaymentTokenInstance.options.address
//       collateralCurrency: self.CollateralTokenInstance.options.address
//     };

//     self.ownership = {
//       creatorObligor: lender,
//       creatorBeneficiary: lender,
//       counterpartyObligor: debtor,
//       counterpartyBeneficiary: debtor
//     };

//     const currentTime = Math.floor(Date.now() / 1000)
//     await mineBlock(currentTime);

//     const { events } = await self.COLLAActorInstance.methods.initialize(
//       self.terms,
//       [],
//       self.ownership,
//       self.COLLAEngineInstance.options.address,
//       ZERO_ADDRESS,
//       self.CollateralInstance.options.address
//     ).send({ from: owner });
//     expectEvent(events, 'InitializedAsset');

//     self.assetId = events.InitializedAsset.returnValues.assetId;
//     self.state = await self.COLLARegistryInstance.methods.getState(
//       web3.utils.toHex(self.assetId)
//     ).call();

//     const { message, signature, decoded } = await getCoinbaseData(web3, 'ETH');
//     const ethPrice = parseFloat(decoded[3]) / Math.pow(10, 6);

//     // assuming initially 1 CollateralToken equals 1 PaymentToken
//     self.collateralAmount = new BigNumber(this.terms.notionalPrincipal).multipliedBy(ethPrice).multipliedBy(1.6).toFixed();

//     await self.CollateralTokenInstance.methods.drip(debtor, self.collateralAmount).send({from: lender});
//     await self.OpenOracleInstance.methods.put(message, signature).send({from: dataProvider});

//   });

//   before(async () => {
//     this.setupTestEnvironment = snapshotTaker(this);
//     await this.setupTestEnvironment();
//   });

//   it('should lock the debtors collateral', async () => {
//     await this.CollateralTokenInstance.methods.approve(this.CollateralInstance.options.address, this.collateralAmount).send({ from: debtor });
//     await this.CollateralInstance.methods.addCollateral(this.assetId, new BigNumber(this.collateralAmount).dividedBy(2).toFixed()).send({ from: debtor });
//     await this.CollateralInstance.methods.addCollateral(this.assetId, new BigNumber(this.collateralAmount).dividedBy(2).toFixed()).send({ from: debtor });
//     const minCollateralAmount = await this.CollateralInstance.methods.computeMinCollateralAmount(this.assetId).call();
//     assert.strictEqual(new BigNumber(this.collateralAmount).isGreaterThan(minCollateralAmount), true);
//   });

//   it('should process the Initial Exchange Date event', async () => {
//     const iedEvent = await this.COLLARegistryInstance.methods.getNextScheduledEvent(
//       web3.utils.toHex(this.assetId)
//     ).call();
//     const { eventType, scheduleTime } = decodeEvent(iedEvent);
//     assert.strictEqual(eventType, `${eventIndex('IED')}`);

//     await this.PaymentTokenInstance.methods.approve(this.COLLAActorInstance.options.address, this.terms.notionalPrincipal).send({ from: lender });

//     const { events } = await this.COLLAActorInstance.methods.progress(
//       web3.utils.toHex(this.assetId)
//     ).send({ from: owner });
//     expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('IED')}` });
//   });

//   it('should process the first Interest Payment event', async () => {
//     const iedEvent = await this.COLLARegistryInstance.methods.getNextScheduledEvent(
//       web3.utils.toHex(this.assetId)
//     ).call();
//     const { eventType, scheduleTime } = decodeEvent(iedEvent);
//     assert.strictEqual(eventType, `${eventIndex('IP')}`);

//     await this.PaymentTokenInstance.methods.approve(this.COLLAActorInstance.options.address, this.terms.notionalPrincipal).send({ from: debtor });

//     const { events } = await this.COLLAActorInstance.methods.progress(
//       web3.utils.toHex(this.assetId)
//     ).send({ from: owner });
//     expectEvent(events, 'ProgressedAsset', { 'eventType': `${eventIndex('IP')}` });
//   });

//   it('should set new prices in open oracle', async () => {
//     const { message, signature, decoded } = await getCoinbaseData(web3, 'ETH');
//     await this.OpenOracleInstance.methods.put(message, signature).send({from: dataProvider});

//     const price = await this.OpenOracleInstance.methods.getPrice(coinbaseSigner, 'ETH').call();
//     assert.strictEqual(price.toString(), decoded[3]);

//     const ethbytes32 = web3.eth.abi.encodeParameter('bytes32', web3.utils.toHex('ETH'))

//     const proxyPrice = await this.OpenOracleProxyInstance.methods.getData(ethbytes32).call();
//     console.log(proxyPrice)
//   });

// });
