// // defines PAM specific logic (for the on-chain version)
// // process (order)
// // validation of contract updates for pam contracts
// // calculation of contract updates

// import Web3 = require('web3');

// import { PAM } from './PAM';

// import { PAMStatelessContract } from '../../wrappers/PAMStatelessContract';
// import { PAMStatefulContract } from '../../wrappers/PAMStatefulContract';

// export class PAMOnChain extends PAM {

//   // @ts-ignore
//   private statefulContract: PAMStatefulContract;

//   constructor (statelessContract: PAMStatelessContract, statefulContract: PAMStatefulContract) {
//     super(statelessContract);
//     this.statefulContract = statefulContract;
//   }

//   public static async create (
//     web3: Web3, 
//     contractId: string, 
//     recordCreatorAddress: string, 
//     counterpartyAddress: string
//   ) {
//     const statelessContract = await PAMStatelessContract.instantiate(web3);
//     const statefulContract = await PAMStatefulContract.deploy(web3, contractId, recordCreatorAddress, counterpartyAddress);
//     return new PAMOnChain(statelessContract, statefulContract);
//   }

//   public static async init (web3: Web3, statefulContractAddress: string) {
//     const statelessContract = await PAMStatelessContract.instantiate(web3);
//     const statefulContract = await PAMStatefulContract.instantiate(web3, statefulContractAddress);
//     return new PAMOnChain(statelessContract, statefulContract);
//   }
// }
