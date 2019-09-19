import { Contract } from 'web3-eth-contract/types';

import { ContractTerms, ContractState, ContractEvent, ProtoEventSchedule, ProtoEvent, CallObject } from '../types';
import {
  fromContractTerms,
  toContractState, 
  toContractEvent, 
  fromContractState, 
  fromProtoEvent,
  toProtoEventSchedule
} from './Conversions';


export class IEngine {
  public instance: Contract;

  protected constructor (instance: Contract) {    
    this.instance = instance;
  }

  public getPrecision = (): CallObject<number> => ({
    call: async (): Promise<number> => {
      return Number(await this.instance.methods.precision().call());
    }
  });

  public computeInitialState = (terms: ContractTerms): CallObject<ContractState> => ({
    call: async (): Promise<ContractState> => {
      const response = await this.instance.methods.computeInitialState(fromContractTerms(terms)).call();
      const initialState = toContractState(response);
      return initialState;
    }
  });

  public computeNextState = (
    terms: ContractTerms, 
    state: ContractState, 
    timestamp: number
  ): CallObject<{nextState: ContractState; events: ContractEvent[]}> => ({
    call: async (): Promise<{nextState: ContractState; events: ContractEvent[]}> => {
      const response = await this.instance.methods.computeNextState(
        fromContractTerms(terms), 
        fromContractState(state), 
        timestamp
      ).call();
    
      const nextState = toContractState(response[0]);
      const events: ContractEvent[] = response[1].map((raw: any): ContractEvent => toContractEvent(raw));
  
      return { nextState, events };
    }
  });

  public computeNextStateForProtoEvent = (
    terms: ContractTerms, 
    state: ContractState,
    protoEvent: ProtoEvent, 
    timestamp: number
  ): CallObject<{nextState: ContractState; event: ContractEvent}> => ({
    call: async (): Promise<{nextState: ContractState; event: ContractEvent}> => {
      const response = await this.instance.methods.computeNextStateForProtoEvent(
        fromContractTerms(terms),
        fromContractState(state),
        fromProtoEvent(protoEvent),
        timestamp
      ).call();
    
      const nextState = toContractState(response[0]);
      const event = toContractEvent(response[1]);

      return { nextState, event };
    }
  });

  public computeProtoEventScheduleSegment = (
    terms: ContractTerms, 
    startTimestamp: number, 
    endTimestamp: number
  ): CallObject<ProtoEventSchedule> => ({
    call: async (): Promise<ProtoEventSchedule> => {
      const response: ProtoEventSchedule = await this.instance.methods.computeProtoEventScheduleSegment(
        fromContractTerms(terms),
        startTimestamp,
        endTimestamp
      ).call();

      const pendingProtoEventSchedule = toProtoEventSchedule(response);

      return pendingProtoEventSchedule;
    }
  });
}
