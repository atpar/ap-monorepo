// const BigNumber = require('bignumber.js');
// const { expectEvent } = require('openzeppelin-test-helpers');

// const AssetActor = artifacts.require('AssetActor');

// const { setupTestEnvironment, getDefaultTerms } = require('../helper/setupTestEnvironment');
// const { 
//   createSnapshot, 
//   revertToSnapshot, 
//   mineBlock,
//   getLatestBlockTimestamp
// } = require('../helper/blockchain');


// contract('AssetActor', (accounts) => {
//   const issuer = accounts[0];
//   const recordCreatorObligor = accounts[1];
//   const recordCreatorBeneficiary = accounts[2];
//   const counterpartyObligor = accounts[3];
//   const counterpartyBeneficiary = accounts[4];

//   let snapshot;
//   let snapshot_asset;

//   before(async () => {
//     const instances = await setupTestEnvironment();
//     Object.keys(instances).forEach((instance) => this[instance] = instances[instance]);

//     this.assetId_underlying = 'U_123';
//     this.terms_underlying = { 
//       ...await getDefaultTerms(),
//       gracePeriod: { i: 1, p: 2, isSet: true },
//       delinquencyPeriod: { i: 1, p: 3, isSet: true }
//     };
//     this.state_underlying = await this.PAMEngineInstance.computeInitialState(this.terms_underlying);
//     this.ownership_underlying = {
//       recordCreatorObligor, 
//       recordCreatorBeneficiary, 
//       counterpartyObligor, 
//       counterpartyBeneficiary
//     };

//     this.assetId_ce = 'CE_123';
//     this.terms_ce = { 
//       ...await getDefaultTerms(),
//       contractType: 16,
//       gracePeriod: { i: 1, p: 2, isSet: true },
//       delinquencyPeriod: { i: 1, p: 3, isSet: true },
//       coverageOfCreditEnhancement: (new BigNumber(1).shiftedBy(18)).toString(),
//       creditEventTypeCovered: '3', // DF
//       contractStructure: {
//         contractReference: { 
//           object: web3.utils.toHex(this.assetId_underlying),
//           contractReferenceType: 0,
//           contractReferenceRole: 0
//         } 
//       }
//     };
//     this.state_ce = await this.PAMEngineInstance.computeInitialState(this.terms_ce);
//     this.ownership_ce = {
//       recordCreatorObligor, 
//       recordCreatorBeneficiary, 
//       counterpartyObligor, 
//       counterpartyBeneficiary
//     };
    
//     snapshot = await createSnapshot();
//   });

//   after(async () => {
//     await revertToSnapshot(snapshot);
//   });

//   it('should initialize an asset', async () => {
//     await this.AssetActorInstance.initialize(
//       web3.utils.toHex(this.assetId_underlying),
//       this.ownership_underlying,
//       this.terms_underlying,
//       this.PAMEngineInstance.address
//     );

//     await this.AssetActorInstance.initialize(
//       web3.utils.toHex(this.assetId_ce),
//       this.ownership_ce,
//       this.terms_ce,
//       this.CEGEngineInstance.address
//     );


//     snapshot_asset = await createSnapshot();
//   });

//   it('should ', async () => {
//     // const pendingSchedule = await this.CEGEngineInstance.computePendingProtoEventScheduleSegment(
//     //   this.terms_ce,
//     //   this.terms_ce.contractDealDate,
//     //   this.terms_ce.maturityDate
//     // );


//     // progress timestamp such that underlying transition into default
//     await mineBlock(Number(this.terms_underlying.maturityDate));

//     await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId_underlying));

//     await this.AssetActorInstance.progress(web3.utils.toHex(this.assetId_ce));

//     console.log(await this.AssetRegistryInstance.getState(web3.utils.toHex(this.assetId_ce)));
//   });
// });
