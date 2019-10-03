import BigNumber from 'bignumber.js';

import { ContractState, ContractTerms, EvaluatedEventSchedule, ProtoEventSchedule } from '../types';


export interface ContractEngine {

  computeInitialState (
    terms: ContractTerms
  ): Promise<ContractState>;

  computeNextState (
    terms: ContractTerms, 
    state: ContractState, 
    timestamp: number
  ): Promise<ContractState>;

  validateInitialState (
    terms: ContractTerms, 
    expectedState: ContractState
  ): Promise<boolean>;
  
  validateNextState (
    terms: ContractTerms, 
    state: ContractState, 
    expectedState: ContractState
  ): Promise<boolean>;

  computeInitialProtoEventSchedule (
    terms: ContractTerms
  ): Promise<ProtoEventSchedule>;

  computePendingProtoEventSchedule (
    terms: ContractTerms, 
    currentState: ContractState, 
    currentTimestamp: number
  ): Promise<ProtoEventSchedule>;
  
  computeEvaluatedInitialSchedule (
    terms: ContractTerms
  ): Promise<EvaluatedEventSchedule>;

  computeEvaluatedPendingSchedule (
    terms: ContractTerms, 
    currentState: ContractState, 
    currentTimestamp: number
  ): Promise<EvaluatedEventSchedule>;

  computeDuePayoff (
    terms: ContractTerms, 
    currentState: ContractState, 
    currentTimestamp: number
  ): Promise<BigNumber>;

  computeDuePayoffForRecordCreator (
    terms: ContractTerms, 
    currentState: ContractState, 
    currentTimestamp: number
  ): Promise<BigNumber>;

  computeDuePayoffForCounterparty (
    terms: ContractTerms, 
    currentState: ContractState, 
    currentTimestamp: number
  ): Promise<BigNumber>;
}
