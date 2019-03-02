import BigNumber from 'bignumber.js';

import { ContractTerms, ContractState } from '../types';


export interface EconomicsKernel {
  
  readonly contractTerms: ContractTerms;
  readonly contractState: ContractState;

  computeNextState (timestamp: number) : Promise<ContractState>;

  validateInitialState (expectedContractState: ContractState) : Promise<boolean>;
  
  validateNextState (expectedContractState: ContractState) : Promise<boolean>;
  
  computeExpectedSchedule () : Promise<any>;

  computePendingSchedule (timestamp: number) : Promise<any>;

  evaluateSchedule (schedule: any) : Promise<any>;

  computeDuePayoff (timestamp: number) : Promise<BigNumber>;

  computeAndCommitNextState (timestamp: number) : Promise<void>;
}
