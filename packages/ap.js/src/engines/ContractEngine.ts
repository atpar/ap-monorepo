import BigNumber from 'bignumber.js';

import { ContractState, ContractTerms } from '../types';


export interface ContractEngine {

  computeInitialState (contractTerms: ContractTerms): Promise<ContractState>;

  computeNextState (
    contractTerms: ContractTerms,
    contractState: ContractState,
    timestamp: number
  ): Promise<ContractState>;

  validateInitialState (contractTerms: ContractTerms, expectedContractState: ContractState): Promise<boolean>;
  
  validateNextState (
    contractTerms: ContractTerms, 
    contractState: ContractState, 
    expectedContractState: ContractState
  ): Promise<boolean>;
  
  computeExpectedSchedule (contractTerms: ContractTerms): Promise<any>;

  computePendingSchedule (contractTerms: ContractTerms, contractState: ContractState, timestamp: number): Promise<any>;

  evaluateSchedule (contractTerms: ContractTerms, contractState: ContractState, schedule: any): Promise<any>;

  computeDuePayoff (contractTerms: ContractTerms, contractState: ContractState, timestamp: number): Promise<BigNumber>;
}
