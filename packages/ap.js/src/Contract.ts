import { ContractTerms, ContractType, ContractOwnership, ContractState, EvaluatedEventSchedule } from './types';
import { ContractEngine, PAM } from './engines';
import { AP } from './index';


/**
 * class which provides methods for managing an ACTUS contract 
 * exposes methods for ownership management, settlement of payoffs and 
 * economic lifecycle management for an ACTUS contract
 */
export class Contract {
  
  private ap: AP;
  // @ts-ignore
  private contractEngine: ContractEngine;
  
  public assetId: string;

  private constructor (
    ap: AP,
    contractEngine: ContractEngine,
    assetId: string
  ) {
    this.ap = ap;
    this.contractEngine = contractEngine;

    this.assetId = assetId;
  }

  /**
   * return the terms of the contract
   * @returns {Promise<ContractTerms>}
   */
  public async getContractTerms (): Promise<ContractTerms> { 
    return this.ap.economics.getContractTerms(this.assetId); 
  }

  /**
   * returns the current state of the contract
   * @returns {Promise<ContractState>}
   */
  public async getContractState (): Promise<ContractState> { 
    return this.ap.economics.getContractState(this.assetId); 
  }

  /**
   * returns the current ownership of the contract
   * @param {string} assetId 
   * @returns {Promise<ContractOwnership>}
   */
  public async getContractOwnership (assetId: string): Promise<ContractOwnership> {
    return this.ap.ownership.getContractOwnership(assetId);
  }
 
  /**
   * returns the schedule derived from the terms of the contract
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getExpectedSchedule (): Promise<EvaluatedEventSchedule> {
    return await this.contractEngine.computeEvaluatedInitialSchedule(await this.getContractTerms());
  }

  /**
   * returns the pending schedule derived from the terms and the current state of the contract
   * (contains all events between the last state and the specified timestamp)
   * @param {number} timestamp current timestamp
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getPendingSchedule (timestamp: number): Promise<EvaluatedEventSchedule> {
    return await this.contractEngine.computeEvaluatedPendingSchedule(
      await this.getContractTerms(),
      await this.getContractState(),
      timestamp
    );
  }

  /**
   * derives obligations by computing the next state of the contract and 
   * stores the new state if all obligation where fulfilled
   * @param {number} timestamp 
   * @return {Promise<void>}
   */
  public async progress (timestamp: number): Promise<void> {
    await this.ap.lifecycle.progress(this.assetId, timestamp);
  }

  /**
   * registers the terms, the initial state and the ownership of a contract 
   * and returns a new Contract instance.
   * computes the initial contract state,
   * stores it together with the terms of the EconomicsRegistry,
   * stores the ownership of the contract in the OwnershipRegistry and sends it
   * @param {AP} ap AP instance
   * @param {ContractTerms} terms terms of the contract
   * @param {ContractOwnership} ownership ownership of the contract
   * @returns {Promise<Contract>}
   */
  public static async create (
    ap: AP,
    terms: ContractTerms,
    ownership: ContractOwnership
  ): Promise<Contract> {
    const assetId = 'PAM' + String(Math.floor(Date.now() / 1000));

    let contractEngine;
    switch (terms.contractType) {
      case ContractType.PAM:
        contractEngine = await PAM.init(ap.web3);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const initialContractState = await contractEngine.computeInitialState(terms);

    await ap.ownership.registerContractOwnership(assetId, ownership);
    await ap.economics.registerContract(
      assetId, 
      terms, 
      initialContractState
    );

    return new Contract(ap, contractEngine, assetId);
  }

  /**
   * loads a already registered Contract and returns a new Contract instance from a provided ContactId
   * @param {AP} ap AP instance
   * @param {string} assetId 
   * @returns {Promise<Contract>}
   */
  public static async load (
    ap: AP,
    assetId: string
  ): Promise<Contract> {
    const { contractType, statusDate } = await ap.economics.getContractTerms(assetId);

    if (statusDate == 0) { throw('NOT_FOUND_ERROR: no contract found for given AssetId!'); }

    let contractEngine;
    switch (contractType) {
      case ContractType.PAM:
        contractEngine = await PAM.init(ap.web3);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }
    
    return new Contract(ap, contractEngine, assetId);
  }
}
