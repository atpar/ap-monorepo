// // defines PAM specific logic (off-chain logic, on-chain anchor points)
// // process (order)
// // validation of contract updates for pam contracts
// // calculation of contract updates

// import { EconomicsKernel } from '../../kernels/EconomicsKernel';
// import { PAMStatelessContract } from '../../wrappers/PAMStatelessContract';
// import { ContractTerms, ContractState, ContractEvent } from 'src/types';
// import BigNumber from 'bignumber.js';

// /**
//  * class for a PAM contract
//  * @notice base class for specialized child classes PAMOffChain and PAMOnChain
//  */
// export abstract class PAM implements EconomicsKernel {

//   protected statelessContract: PAMStatelessContract;

//   public readonly assetId: string;
//   public readonly contractTerms: ContractTerms;
//   public contractState: ContractState;
//   public readonly statefulContractAddress: string;
//   public readonly recordCreatorAddress: string;
//   public readonly counterpartyAddress: string;

//   constructor (
//     statelessContract: PAMStatelessContract,
//     statefulContractAddress: string,
//     assetId: string,
//     recordCreatorAddress: string,
//     counterpartyAddress: string,
//     contractTerms: ContractTerms, 
//     contractState: ContractState
//   ) {
//     this.statelessContract = statelessContract;
//     this.statefulContractAddress = statefulContractAddress;
//     this.assetId = assetId;
//     this.recordCreatorAddress = recordCreatorAddress;
//     this.counterpartyAddress = counterpartyAddress;
//     this.contractTerms = contractTerms;
//     this.contractState = contractState;
//   }

//   /**
//    * computes the next state based on the contract terms and the current state
//    * @param timestamp current timestamp
//    */
//   public async computeNextState (timestamp: number) {
//     const { nextContractState } = await this.statelessContract.computeNextState(
//       this.contractTerms, 
//       this.contractState, 
//       timestamp
//     );
//     return nextContractState;
//   }

//   /**
//    * recalculates the first state based on the terms of the contract
//    * @param expectedContractState expected contract state to compare to
//    * @returns true if the given state is equal to the computed state
//    */
//   public async validateInitialState (
//     expectedContractState: ContractState,
//   ) {
//     const contractState = await this.statelessContract.computeInitialState(this.contractTerms);

//     // const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))
//     //   .reduce((obj: any, key: any) => { obj[key] = contractState[key]; return obj }, {})

//     if (contractState.toString() !== expectedContractState.toString()) { return false; }

//     return true;
//   }

//   /**
//    * recalculates a state based on the terms and the current state of the contract
//    * @param expectedContractState expected contract state to compare to
//    * @returns true if the given state is equal to the computed state
//    */
//   public async validateNextState (
//     expectedContractState: ContractState,
//   ) {
//     const { nextContractState: contractState } = await this.statelessContract.computeNextState(
//       this.contractTerms, 
//       this.contractState,
//       expectedContractState.lastEventTime
//     );

//     // const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))
//     //   .reduce((obj: any, key: any) => { obj[key] = contractState[key]; return obj }, {})

//     if (contractState.toString() !== expectedContractState.toString()) { return false; }

//     return true;
//   }

//   /**
//    * computes the entire event schedule based on the contract terms
//    * @returns expected event schedule
//    */
//   public async computeExpectedSchedule () {
//     return this.statelessContract.computeSchedule(this.contractTerms);
//   }

//   /**
//    * computes schedule for all pending events
//    * @param timestamp current timestamp
//    * @returns pending event schedule
//    */
//   public async computePendingSchedule (timestamp: number) {
//     return this.statelessContract.computeScheduleSegment(
//       this.contractTerms, 
//       this.contractState.lastEventTime, 
//       timestamp
//     );
//   }

//   /**
//    * evaluates a given event schedule
//    * @param expectedSchedule expected event schedule
//    * @returns evaluated event schedule
//    */
//   public async evaluateSchedule (schedule: any) {
//     return this.statelessContract.evaluateSchedule(this.contractTerms, this.contractState, schedule);
//   }

//   /**
//    * calculates the outstanding payoff based on all pending events for a given date
//    * @param timestamp current timestamp
//    * @returns summed up payoff
//    */
//   public async computeDuePayoff (timestamp: number) {
//     const pendingEventSchedule = await this.computePendingSchedule(timestamp);
//     const evaluatedSchedule = await this.evaluateSchedule(pendingEventSchedule);
//     const contractEvents = evaluatedSchedule.map((entry: any) => {
//       return entry.evaluatedContractEvent
//     })

//     return this._getPayOffFromContractEvents(contractEvents);
//   }

//   // public async computeOutstandingPayOff (timestamp: number) {
//   //   const duePayOff = this.computeDuePayOff(timestamp);

//   //   const pendingEventSchedule = await this.computePendingSchedule(timestamp);

//   //   // for each event ...
//   //   const settledPayOff = this.getSettledPayOffForEvent();

//   // }

  
//   // public async settlePayoff (amount: BigNumber) {
//   // }
  
//   /**
//    * sums up payoff for a set of evaluated events
//    * @param contractEvents array of contract events
//    * @returns summed up payoff 
//    */
//   protected _getPayOffFromContractEvents (contractEvents: ContractEvent[]) {
//     const payOff = contractEvents.reduce(
//       (payOffSum: BigNumber, contractEvent: ContractEvent) => payOffSum.plus(new BigNumber(contractEvent.payOff))
//       , new BigNumber(0));
  
//     return payOff;
//   }
    
//   /**
//    * computes and stores the next contract state
//    * @notice has to be implemented by a inherenting child classes
//    * @param timestamp current timestamp
//    * @returns promise when finished
//    */
//   public abstract async computeAndCommitNextState (timestamp: number) : Promise<void>;
  
//   // /**
//   //  * computes and settles the next contract state
//   //  * @notice has to be implemented by a inherenting child classes
//   //  * @param timestamp 
//   //  * @param hash
//   //  * @returns promise when finished
//   //  */
//   // public abstract async processNextStateAndSettle (timestamp: number, hash: string) : Promise<void>;
// }
