// // defines PAM specific logic (for the on-chain/off-chain version)
// // process (order)
// // validation of contract updates for pam contracts
// // calculation of contract updates

// import Web3 = require('web3');

// import { PAM } from './PAM';
// import { ContractTerms, ContractState } from '../../types';

// import { PAMStatelessContract } from '../../wrappers/PAMStatelessContract';
// import { PAMStatefulContract } from '../../wrappers/PAMStatefulContract';
// import { CustomOptions } from 'web3/eth/contract';

// export class PAMOffChain extends PAM {

//   // @ts-ignore
//   private statefulContract: PAMStatefulContract;
  
//   private constructor (
//     statelessContract: PAMStatelessContract, 
//     statefulContract: PAMStatefulContract,
//     assetId: string,
//     recordCreatorAddress: string,
//     counterpartyAddress: string,
//     contractTerms: ContractTerms,
//     contractState: ContractState
//   ) {
//     super(
//       statelessContract,
//       statefulContract.address,
//       assetId,
//       recordCreatorAddress, 
//       counterpartyAddress,
//       contractTerms, 
//       contractState
//     );
//     this.statefulContract = statefulContract;
//   }

//   // public async processNextStateAndSettle (timestamp: number, hash: string) {
//   //   const { nextContractState, evaluatedEvents } = await this.statelessContract.computeNextState(
//   //     this.contractTerms, 
//   //     this.contractState, 
//   //     timestamp
//   //   );

//   //   const payOff = this._getPayOffFromContractEvents(evaluatedEvents);

//   //   if (!payOff.isEqualTo(0)) {
//   //     await this.statefulContract.settlePayOff(
//   //       hash,
//   //       evaluatedEvents,
//   //       payOff
//   //     );
//   //   }
      
//   //   this.contractState = nextContractState;
//   // }

//   /**
//    * computes and stores the next contract state for a given timestamp
//    * @param timestamp current timestamp
//    */
//   public async computeAndCommitNextState (timestamp: number) {
//     const { nextContractState, evaluatedEvents } = await this.statelessContract.computeNextState(
//       this.contractTerms, 
//       this.contractState, 
//       timestamp
//     );

//     // @ts-ignore
//     const payOff = this._getPayOffFromContractEvents(evaluatedEvents);

//     // check if all payments were made
      
//     this.contractState = nextContractState; 
//   }

//   /**
//    * returns a new PAMOffChain instance
//    * computes and stores the first contract state and deploys a new stateful contract
//    * @param web3 Web3 instance
//    * @param assetId contract id
//    * @param recordCreatorAddress address of the record creator
//    * @param counterpartyAddress address of the counterparty
//    * @param contractTerms contact terms
//    * @param txOptions transaction options (see web3 options)
//    * @returns PAMOffChain
//    */
//   public static async create (
//     web3: Web3, 
//     assetId: string,
//     recordCreatorAddress: string,
//     counterpartyAddress: string,
//     contractTerms: ContractTerms,
//     txOptions: CustomOptions
//   ) {
//     const statelessContract = await PAMStatelessContract.instantiate(web3);
//     const statefulContract = await PAMStatefulContract.deploy(
//       web3, 
//       assetId, 
//       recordCreatorAddress, 
//       counterpartyAddress, 
//       txOptions
//     );
//     const contractState = await statelessContract.computeInitialState(contractTerms);

//     return new PAMOffChain(
//       statelessContract, 
//       statefulContract, 
//       assetId,
//       recordCreatorAddress,
//       counterpartyAddress,
//       contractTerms, 
//       contractState
//     );
//   }

//   /**
//    * returns a new PAMOffChain instance
//    * stores the provided contract state and 
//    * the address of an already deployed stateful contract
//    * @param web3 Web3 instance
//    * @param statefulContractAddress address of the stateful contract
//    * @param assetId contract id
//    * @param contractTerms contract terms
//    * @param contractState contract state
//    * @returns PAMOffChain
//    */
//   public static async init (
//     web3: Web3, 
//     statefulContractAddress: string,
//     assetId: string,
//     contractTerms: ContractTerms,
//     contractState: ContractState
//   ) {
//     const statelessContract = await PAMStatelessContract.instantiate(web3);
//     const statefulContract = await PAMStatefulContract.instantiate(web3, statefulContractAddress);
//     const recordCreatorAddress = await statefulContract.getRecordCreatorAddress();
//     const counterpartyAddress = await statefulContract.getCounterpartyAddress();

//     return new PAMOffChain(
//       statelessContract, 
//       statefulContract, 
//       assetId, 
//       recordCreatorAddress,
//       counterpartyAddress,
//       contractTerms, 
//       contractState
//     );
//   }
// }
