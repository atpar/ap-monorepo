import Web3 from 'web3';

import { ContractTerms, ContractState, ContractEvent, ProtoEventSchedule, ProtoEvent } from '../types';
import { Contract } from 'web3-eth-contract/types';

const PAMEngineArtifact: any = require('../../../ap-contracts/build/contracts/PAMEngine.json');


export class PAMEngine {
  private pamEngine: Contract;

  private constructor (pamEngineInstance: Contract) {    
    this.pamEngine = pamEngineInstance;
  }

  public async getPrecision (): Promise<number> {
    return await this.pamEngine.methods.precision().call();
  }

  public async computeInitialState (terms: ContractTerms): Promise<ContractState> {
    const initialState: ContractState = await this.pamEngine.methods.computeInitialState(terms).call();
    return initialState;
  }

  public async computeNextState (
    terms: ContractTerms, 
    state: ContractState, 
    timestamp: number
  ): Promise<{nextState: ContractState, events: ContractEvent[]}> {
    const response = await this.pamEngine.methods.computeNextState(terms, state, timestamp).call();
    const { 0: nextState, 1: events } : { 0: ContractState, 1: ContractEvent[] } = response;

    return { nextState, events };
  }

  public async computeNextStateForProtoEvent (
    terms: ContractTerms, 
    state: ContractState, 
    protoEvent: ProtoEvent, 
    timestamp: number
  ): Promise<{nextState: ContractState, event: ContractEvent}> {
    const response = await this.pamEngine.methods.getNextState(
      terms,
      state,
      protoEvent,
      timestamp
    ).call();
    const { 0: nextState, 1: event } : { 0: ContractState, 1: ContractEvent } = response;

    return { nextState, event };
  }

  public async computeInitialProtoEventSchedule (terms: ContractTerms): Promise<ProtoEventSchedule> {
    const protoEventSchedule = await this.pamEngine.methods.computeProtoEventScheduleSegment(
      terms,
      terms.statusDate,
      terms.maturityDate
    ).call();
    return protoEventSchedule;
  }

  public async computePendingProtoEventSchedule (
    terms: ContractTerms, 
    startTimestamp: number, 
    endTimestamp: number
  ): Promise<ProtoEventSchedule> {
    const pendingProtoEventSchedule = await this.pamEngine.methods.computeContractEventScheduleSegment(
      terms,
      startTimestamp,
      endTimestamp
    ).call();
    return pendingProtoEventSchedule;
  }

  public static async instantiate (web3: Web3): Promise<PAMEngine> {
    const chainId = await web3.eth.net.getId();
    const pamEngineInstance = new web3.eth.Contract(
      PAMEngineArtifact.abi,
      PAMEngineArtifact.networks[chainId].address
    );

    return new PAMEngine(pamEngineInstance);
  }
}
