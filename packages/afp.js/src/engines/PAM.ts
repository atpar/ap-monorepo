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

  private contractTerms: ContractTerms;
  private contractState: ContractState;

  private constructor (
    pamEngine: PAMEngine,
    contractTerms: ContractTerms, 
    contractState: ContractState
  ) {
    this.pamEngine = pamEngine;
    this.contractTerms = contractTerms;
    this.contractState = contractState;
  }

  /**
   * return the terms of the contract
   * @returns {ContractTerms}
   */
  public getContractTerms (): ContractTerms {
    return this.contractTerms;
  }

  /**
   * returns the current state of the contract
   * @returns {ContractState}
   */
  public getContractState (): ContractState {
    return this.contractState;
  }

  /**
   * updates the terms of the contract
   * @param {ContractTerms} 
   */
  public setContractTerms (contractTerms: ContractTerms): void {
    this.contractTerms = contractTerms; 
  }

  /**
   * updates the state of the contract
   * @param {ContractState}
   */
  public setContractState (contractState: ContractState): void {
    this.contractState = contractState; 
  }

  /**
   * computes the next state based on the contract terms and the current state
   * @returns {Promise<ContractState>}
   */
  public async computeInitialState (): Promise<ContractState> {
    const initialContractState = await this.pamEngine.computeInitialState(
      this.contractTerms
    );
    return initialContractState;
  }

  /**
   * computes the next state based on the contract terms and the current state
   * @param {number} timestamp current timestamp
   * @returns {Promise<ContractState>}
   */
  public async computeNextState (timestamp: number): Promise<ContractState> {
    const { nextContractState } = await this.pamEngine.computeNextState(
      this.contractTerms, 
      this.contractState, 
      timestamp
    );
    return nextContractState;
  }

  /**
   * recalculates the first state based on the terms of the contract
   * @param {ContractState} expectedContractState expected contract state to compare to
   * @returns {Promise<boolean>} true if the given state is equal to the computed state
   */
  public async validateInitialState (
    expectedContractState: ContractState,
  ): Promise<boolean> {
    const contractState = await this.pamEngine.computeInitialState(this.contractTerms);

    // const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))
    //   .reduce((obj: any, key: any) => { obj[key] = contractState[key]; return obj }, {})

    if (contractState.toString() !== expectedContractState.toString()) { return false; }

    return true;
  }

  /**
   * recalculates a state based on the terms and the current state of the contract
   * @param {ContractState} expectedContractState expected contract state to compare to
   * @returns {Promise<boolean>} true if the given state is equal to the computed state
   */
  public async validateNextState (
    expectedContractState: ContractState,
  ): Promise<boolean> {
    const { nextContractState: contractState } = await this.pamEngine.computeNextState(
      this.contractTerms, 
      this.contractState,
      expectedContractState.lastEventTime
    );

    // const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))
    //   .reduce((obj: any, key: any) => { obj[key] = contractState[key]; return obj }, {})

    if (contractState.toString() !== expectedContractState.toString()) { return false; }

    return true;
  }

  /**
   * computes the entire event schedule based on the contract terms
   * @returns {Promise<any>} expected event schedule
   */
  public async computeExpectedSchedule (): Promise<any> {
    return this.pamEngine.computeSchedule(this.contractTerms);
  }

  /**
   * computes schedule for all pending events
   * @param {number} timestamp current timestamp
   * @returns {Promise<any>} pending event schedule
   */
  public async computePendingSchedule (timestamp: number): Promise<any> {
    return this.pamEngine.computeScheduleSegment(
      this.contractTerms, 
      this.contractState.lastEventTime, 
      timestamp
    );
  }

  /**
   * evaluates a given event schedule
   * @param {any} expectedSchedule expected event schedule
   * @returns {Promise<{postContractState: ContractState, evaluatedContractEvent: any}[]>} evaluated event schedule
   */
  public async evaluateSchedule (
    schedule: any
  ): Promise<{postContractState: ContractState, evaluatedContractEvent: any}[]> {
    return this.pamEngine.evaluateSchedule(this.contractTerms, this.contractState, schedule);
  }

  /**
   * calculates the outstanding payoff based on all pending events for a given date
   * @param {number} timestamp current timestamp
   * @returns {Promise<BigNumber>} summed up payoff
   */
  public async computeDuePayoff (timestamp: number): Promise<BigNumber> {
    const pendingEventSchedule = await this.computePendingSchedule(timestamp);
    const evaluatedSchedule = await this.evaluateSchedule(pendingEventSchedule);
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
      (payOffSum: BigNumber, contractEvent: ContractEvent) => payOffSum.plus(new BigNumber(contractEvent.payOff))
      , new BigNumber(0));
  
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
   * computes and sets the initial contract state
   * @param {Web3} web3 Web3 instance
   * @param {ContractTerms} contractTerms
   * @returns {Promise<PAM>}
   */
  public static async create (
    web3: Web3,
    contractTerms: ContractTerms
  ): Promise<PAM> {
    const pamEngine = await PAMEngine.instantiate(web3);
    const initialContractState = await pamEngine.computeInitialState(contractTerms);

    return new PAM(
      pamEngine,
      contractTerms, 
      initialContractState
    );
  }

  /**
   * returns a new PAM instance
   * sets the provided contract state
   * @param {Web3} web3 Web3 instance
   * @param {ContractTerms} contractTerms
   * @param {ContractState} contractState
   * @returns {Promise<PAM>}
   */
  public static async init (
    web3: Web3,
    contractTerms: ContractTerms,
    contractState: ContractState
  ): Promise<PAM> {
    const pamEngine = await PAMEngine.instantiate(web3);

    return new PAM(
      pamEngine,
      contractTerms, 
      contractState
    );
  }
}
