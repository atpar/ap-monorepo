// // wrapper for all smart contract functions for the PAMStatelessContract

// // import Web3 = require('web3');
// import Web3 from 'web3';

// import Contract, { CustomOptions } from 'web3/eth/contract';

// import { Utils } from '../utils/Utils';

// const PAMStatefulContractArtifact: any = require('../../../contracts/build/contracts/PAMStatefulContractOffChain_Registry.json');


// export class PAMStatefulContract {
  
//   private statefulContract: Contract;
//   public address: string;

//   constructor (statefulContractInstance: Contract) {    
//     this.statefulContract = statefulContractInstance;
//     this.address = statefulContractInstance.options.address;
//   }

//   // public async settlePayOff (contractUpdateHash: string, evaluatedContractEvents: any, payOffAbsolute: BigNumber) {
//   //   await this.statefulContract.methods.settlePayOff(
//   //     contractUpdateHash,
//   //     evaluatedContractEvents
//   //   ).send({ value: Utils.toHex(payOffAbsolute) });
//   // }

//   public async getContractId () {
//     const contractId = await this.statefulContract.methods.contractId().call();

//     return Utils.hexToUtf8(contractId);
//   }

//   public async getRecordCreatorAddress () {
//     const recordCreatorAddress = await this.statefulContract.methods.recordCreator().call();

//     return recordCreatorAddress;
//   }

//   public async getCounterpartyAddress () {
//     const counterpartyAddress = await this.statefulContract.methods.counterparty().call();

//     return counterpartyAddress;
//   }

//   // public async getPayOffEvents (contractUpdateHash: String) {
//   //   const payOffEvents = await this.statefulContract.getPastEvents('PayOff', {
//   //     filter: { contractUpdateHash: contractUpdateHash }
//   //   });

//   //   return payOffEvents;
//   // }

//   public static async instantiate (web3: Web3, address: string) {
//     const statefulContractInstance = new web3.eth.Contract(
//       PAMStatefulContractArtifact.abi,
//       address
//     );

//     return new PAMStatefulContract(statefulContractInstance);
//   }

//   public static async deploy (
//     web3: Web3, 
//     contractId: string,
//     recordCreatorAddress: string,
//     counterpartyAddress: string,
//     txOptions: CustomOptions
//   ) {
//     const statefulContractInstance = new web3.eth.Contract(
//       PAMStatefulContractArtifact.abi
//     );

//     const { options: { address } } = await statefulContractInstance.deploy({
//       data: PAMStatefulContractArtifact.bytecode,
//       arguments: [
//         Utils.toHex(contractId),
//         recordCreatorAddress,
//         counterpartyAddress
//       ]
//     }).send(txOptions);

//     statefulContractInstance.options.address = address;

//     return new PAMStatefulContract(statefulContractInstance);
//   }
// }
