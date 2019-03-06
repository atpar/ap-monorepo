import BigNumber from 'bignumber.js';

import { ContractState, ContractTerms } from '../types';


export interface ContractEngine {

  getContractTerms() : ContractTerms;

  getContractState() : ContractState;

  setContractTerms (contractTerms: ContractTerms) : void;

  setContractState (contractState: ContractState) : void;

  computeInitialState (timestamp: number) : Promise<ContractState>;

  computeNextState (timestamp: number) : Promise<ContractState>;

  validateInitialState (expectedContractState: ContractState) : Promise<boolean>;
  
  validateNextState (expectedContractState: ContractState) : Promise<boolean>;
  
  computeExpectedSchedule () : Promise<any>;

  computePendingSchedule (timestamp: number) : Promise<any>;

  evaluateSchedule (schedule: any) : Promise<any>;

  computeDuePayoff (timestamp: number) : Promise<BigNumber>;
}
