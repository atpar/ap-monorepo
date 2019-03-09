import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import { ContractEngine } from './ContractEngine';
import { PAMEngine } from '../wrappers/PAMEngine';
import { ContractTerms, ContractState, ContractEvent } from '../types';


/**
 * contains economic logic for a PAM contract
 */
export class PAM implements ContractEngine {

  protected pamEngine: PAMEngine;

  private constructor (pamEngine: PAMEngine) {
    this.pamEngine = pamEngine;
  }

  /**
   * computes the inital state based on the contract terms and the current state
   * @param {contractTerms} contractTerms
   * @returns {Promise<ContractState>}
   */
  public async computeInitialState (contractTerms: ContractTerms): Promise<ContractState> {
    const initialContractState = await this.pamEngine.computeInitialState(
      contractTerms
    );
    return initialContractState;
  }

  /**
   * computes the next state based on the contract terms and the current state
   * @param {ContractTerms} contractTerms
   * @param {ContractState} contractState
   * @param {number} timestamp current timestamp
   * @returns {Promise<ContractState>}
   */
  public async computeNextState (
    contractTerms: ContractTerms,
    contractState: ContractState,
    timestamp: number
  ): Promise<ContractState> {
    const { nextContractState } = await this.pamEngine.computeNextState(
      contractTerms, 
      contractState, 
      timestamp
    );
    return nextContractState;
  }

  /**
   * recalculates the first state based on the terms of the contract
   * @param {ContractTerms} contractTerms
   * @param {ContractState} expectedContractState expected contract state to compare to
   * @returns {Promise<boolean>} true if the given state is equal to the computed state
   */
  public async validateInitialState (
    contractTerms: ContractTerms,
    expectedContractState: ContractState,
  ): Promise<boolean> {
    const contractState = await this.pamEngine.computeInitialState(contractTerms);

    // const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))
    //   .reduce((obj: any, key: any) => { obj[key] = contractState[key]; return obj }, {})

    if (contractState.toString() !== expectedContractState.toString()) { return false; }

    return true;
  }

  /**
   * recalculates a state based on the terms and the current state of the contract
   * @param {ContractTerms} contractTerms
   * @param {ContractState} contractState
   * @param {ContractState} expectedContractState expected contract state to compare to
   * @returns {Promise<boolean>} true if the given state is equal to the computed state
   */
  public async validateNextState (
    contractTerms: ContractTerms,
    contractState: ContractState,
    expectedContractState: ContractState,
  ): Promise<boolean> {
    const { nextContractState: actualContractState } = await this.pamEngine.computeNextState(
      contractTerms, 
      contractState,
      expectedContractState.lastEventTime
    );

    // const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))
    //   .reduce((obj: any, key: any) => { obj[key] = contractState[key]; return obj }, {})

    if (actualContractState.toString() !== expectedContractState.toString()) { return false; }

    return true;
  }

  /**
   * computes the entire event schedule based on the contract terms
   * @param {ContractTerms} contractTerms
   * @returns {Promise<any>} expected event schedule
   */
  public async computeExpectedSchedule (contractTerms: ContractTerms): Promise<any> {
    return this.pamEngine.computeSchedule(contractTerms);
  }

  /**
   * computes schedule for all pending events
   * @param {ContractTerms} contractTerms
   * @param {ContractState} contractState
   * @param {number} timestamp current timestamp
   * @returns {Promise<any>} pending event schedule
   */
  public async computePendingSchedule (
    contractTerms: ContractTerms,
    contractState: ContractState,
    timestamp: number
  ): Promise<any> {
    return this.pamEngine.computeScheduleSegment(
      contractTerms, 
      contractState.lastEventTime, 
      timestamp
    );
  }

  /**
   * evaluates a given event schedule
   * @param {ContractTerms} contractTerms
   * @param {ContractState} contractState
   * @param {any} expectedSchedule expected event schedule
   * @returns {Promise<{postContractState: ContractState, evaluatedContractEvent: any}[]>} evaluated event schedule
   */
  public async evaluateSchedule (
    contractTerms: ContractTerms,
    contractState: ContractState,
    schedule: any
  ): Promise<{postContractState: ContractState, evaluatedContractEvent: any}[]> {
    return this.pamEngine.evaluateSchedule(contractTerms, contractState, schedule);
  }

  /**
   * calculates the outstanding payoff based on all pending events for a given date
   * @param {ContractTerms} contractTerms
   * @param {ContractState} contractState
   * @param {number} timestamp current timestamp
   * @returns {Promise<BigNumber>} summed up payoff
   */
  public async computeDuePayoff (
    contractTerms: ContractTerms,
    contractState: ContractState,
    timestamp: number
  ): Promise<BigNumber> {
    const pendingEventSchedule = await this.computePendingSchedule(contractTerms, contractState, timestamp);
    const evaluatedSchedule = await this.evaluateSchedule(contractTerms, contractState, pendingEventSchedule);
    const contractEvents = evaluatedSchedule.map((entry: any) => {
      return entry.evaluatedContractEvent
    })

    return this._getPayOffFromContractEvents(contractEvents);
  }
  
  /**
   * sums up payoff for a set of evaluated events
   * @param {ContractEvent[]} contractEvents array of contract events
   * @returns {BigNumber} summed up payoff 
   */
  protected _getPayOffFromContractEvents (contractEvents: ContractEvent[]): BigNumber {
    const payOff = contractEvents.reduce(
      (payOffSum: BigNumber, contractEvent: ContractEvent) => payOffSum.plus(new BigNumber(contractEvent.payOff)), 
      new BigNumber(0)
    );
  
    return payOff;
  }

  // /**
  //  * computes and stores the next contract state for a given timestamp
  //  * @param timestamp current timestamp
  //  */
  // public async computeAndCommitNextState (timestamp: number) {
  //   const { nextContractState, evaluatedEvents } = await this.pamEngine.computeNextState(
  //     this.contractTerms, 
  //     this.contractState, 
  //     timestamp
  //   );

  //   // @ts-ignore
  //   const payOff = this._getPayOffFromContractEvents(evaluatedEvents);

  //   // check if all payments were made
      
  //   this.contractState = nextContractState; 
  // }

  /**
   * returns a new PAM instance
   * @param {Web3} web3 Web3 instance
   * @returns {Promise<PAM>}
   */
  public static async init (web3: Web3): Promise<PAM> {
    const pamEngine = await PAMEngine.instantiate(web3);

    return new PAM(pamEngine);
  }
}
