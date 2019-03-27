import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';

import { ContractTerms, ContractState, ContractEvent, ProtoEventSchedule, ProtoEvent } from '../types';
import { 
  toContractState, 
  toContractEvent, 
  fromContractState, 
  fromProtoEvent,
  toProtoEventSchedule
} from './Conversions';

const PAMEngineArtifact: any = require('../../../ap-contracts/build/contracts/PAMEngine.json');


export class PAMEngine {
  private pamEngine: Contract;

  private constructor (pamEngineInstance: Contract) {    
    this.pamEngine = pamEngineInstance;
  }

  public async getPrecision (): Promise<number> {
    return Number(await this.pamEngine.methods.precision().call());
  }

  public async computeInitialState (terms: ContractTerms): Promise<ContractState> {
    const response = await this.pamEngine.methods.computeInitialState(terms).call();
    const initialState = toContractState(response);
    return initialState;
  }

  public async computeNextState (
    terms: ContractTerms, 
    state: ContractState, 
    timestamp: number
  ): Promise<{nextState: ContractState, events: ContractEvent[]}> {
    const response = await this.pamEngine.methods.computeNextState(
      terms, 
      fromContractState(state), 
      timestamp
    ).call();
    
    const nextState = toContractState(response[0]);
    const events: ContractEvent[] = response[1].map((raw: any) => toContractEvent(raw));
  
    return { nextState, events };
  }

  public async computeNextStateForProtoEvent (
    terms: ContractTerms, 
    state: ContractState,
    protoEvent: ProtoEvent, 
    timestamp: number
  ): Promise<{nextState: ContractState, event: ContractEvent}> {
    const response = await this.pamEngine.methods.computeNextStateForProtoEvent(
      terms,
      fromContractState(state),
      fromProtoEvent(protoEvent),
      timestamp
    ).call();
    
    const nextState = toContractState(response[0]);
    const event = toContractEvent(response[1]);

    return { nextState, event };
  }

  public async computeProtoEventScheduleSegment (
    terms: ContractTerms, 
    startTimestamp: number, 
    endTimestamp: number
  ): Promise<ProtoEventSchedule> {
    const response: ProtoEventSchedule = await this.pamEngine.methods.computeProtoEventScheduleSegment(
      terms,
      startTimestamp,
      endTimestamp
    ).call();

    const pendingProtoEventSchedule = toProtoEventSchedule(response);

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
