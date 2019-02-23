import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import { EconomicsKernel } from '../kernels/EconomicsKernel';
import { PAMEngine } from '../wrappers/PAMEngine';
import { ContractTerms, ContractState, ContractEvent } from '../types';


/**
 * contains economic logic for a PAM contract
 */
export class PAM implements EconomicsKernel {

  protected pamEngine: PAMEngine;

  public readonly contractTerms: ContractTerms;
  public contractState: ContractState;

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
   * computes the next state based on the contract terms and the current state
   * @param timestamp current timestamp
   */
  public async computeNextState (timestamp: number) {
    const { nextContractState } = await this.pamEngine.computeNextState(
      this.contractTerms, 
      this.contractState, 
      timestamp
    );
    return nextContractState;
  }

  /**
   * recalculates the first state based on the terms of the contract
   * @param expectedContractState expected contract state to compare to
   * @returns true if the given state is equal to the computed state
   */
  public async validateFirstState (
    expectedContractState: ContractState,
  ) {
    const contractState = await this.pamEngine.computeFirstState(this.contractTerms);

    // const extractedContractStateObject = Object.keys(contractState).filter((key) => (!(/^\d+/).test(key)))
    //   .reduce((obj: any, key: any) => { obj[key] = contractState[key]; return obj }, {})

    if (contractState.toString() !== expectedContractState.toString()) { return false; }

    return true;
  }

  /**
   * recalculates a state based on the terms and the current state of the contract
   * @param expectedContractState expected contract state to compare to
   * @returns true if the given state is equal to the computed state
   */
  public async validateNextState (
    expectedContractState: ContractState,
  ) {
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
   * @returns expected event schedule
   */
  public async computeExpectedSchedule () {
    return this.pamEngine.computeSchedule(this.contractTerms);
  }

  /**
   * computes schedule for all pending events
   * @param timestamp current timestamp
   * @returns pending event schedule
   */
  public async computePendingSchedule (timestamp: number) {
    return this.pamEngine.computeScheduleSegment(
      this.contractTerms, 
      this.contractState.lastEventTime, 
      timestamp
    );
  }

  /**
   * evaluates a given event schedule
   * @param expectedSchedule expected event schedule
   * @returns evaluated event schedule
   */
  public async evaluateSchedule (schedule: any) {
    return this.pamEngine.evaluateSchedule(this.contractTerms, this.contractState, schedule);
  }

  /**
   * calculates the outstanding payoff based on all pending events for a given date
   * @param timestamp current timestamp
   * @returns summed up payoff
   */
  public async computeDuePayoff (timestamp: number) {
    const pendingEventSchedule = await this.computePendingSchedule(timestamp);
    const evaluatedSchedule = await this.evaluateSchedule(pendingEventSchedule);
    const contractEvents = evaluatedSchedule.map((entry: any) => {
      return entry.evaluatedContractEvent
    })

    return this._getPayOffFromContractEvents(contractEvents);
  }
  
  /**
   * sums up payoff for a set of evaluated events
   * @param contractEvents array of contract events
   * @returns summed up payoff 
   */
  protected _getPayOffFromContractEvents (contractEvents: ContractEvent[]) {
    const payOff = contractEvents.reduce(
      (payOffSum: BigNumber, contractEvent: ContractEvent) => payOffSum.plus(new BigNumber(contractEvent.payOff))
      , new BigNumber(0));
  
    return payOff;
  }

  /**
   * computes and stores the next contract state for a given timestamp
   * @param timestamp current timestamp
   */
  public async computeAndCommitNextState (timestamp: number) {
    const { nextContractState, evaluatedEvents } = await this.pamEngine.computeNextState(
      this.contractTerms, 
      this.contractState, 
      timestamp
    );

    // @ts-ignore
    const payOff = this._getPayOffFromContractEvents(evaluatedEvents);

    // check if all payments were made
      
    this.contractState = nextContractState; 
  }

  /**
   * returns a new PAMOffChain instance
   * computes and stores the first contract state and deploys a new stateful contract
   * @param web3 Web3 instance
   * @param contractTerms contact terms
   * @returns PAMOffChain
   */
  public static async create (
    web3: Web3,
    contractTerms: ContractTerms
    
  ) {
    const pamEngine = await PAMEngine.instantiate(web3);
    const contractState = await pamEngine.computeFirstState(contractTerms);

    return new PAM(
      pamEngine,
      contractTerms, 
      contractState
    );
  }

  /**
   * returns a new PAMOffChain instance
   * stores the provided contract state
   * @param web3 Web3 instance
   * @param contractTerms contract terms
   * @param contractState contract state
   * @returns PAMOffChain
   */
  public static async init (
    web3: Web3,
    contractTerms: ContractTerms,
    contractState: ContractState
  ) {
    const pamEngine = await PAMEngine.instantiate(web3);

    return new PAM(
      pamEngine,
      contractTerms, 
      contractState
    );
  }
}
