import { ContractTerms, ContractType, AssetOwnership, ContractState, EvaluatedEventSchedule } from './types';
import { ContractEngine, PAM } from './engines';
import { AP } from './index';


/**
 * class which provides methods for managing an ACTUS asset 
 * exposes methods for ownership management, settlement of payoffs and 
 * economic lifecycle management for an ACTUS asset
 */
export class Asset {
  
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
   * return the terms of the asset
   * @returns {Promise<ContractTerms>}
   */
  public async getTerms (): Promise<ContractTerms> { 
    return this.ap.economics.getTerms(this.assetId); 
  }

  /**
   * returns the current state of the asset
   * @returns {Promise<ContractState>}
   */
  public async getState (): Promise<ContractState> { 
    return this.ap.economics.getState(this.assetId); 
  }

  /**
   * returns the current ownership of the asset
   * @param {string} assetId 
   * @returns {Promise<AssetOwnership>}
   */
  public async getOwnership (assetId: string): Promise<AssetOwnership> {
    return this.ap.ownership.getOwnership(assetId);
  }
 
  /**
   * returns the schedule derived from the terms of the asset
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getExpectedSchedule (): Promise<EvaluatedEventSchedule> {
    return await this.contractEngine.computeEvaluatedInitialSchedule(await this.getTerms());
  }

  /**
   * returns the pending schedule derived from the terms and the current state of the asset
   * (contains all events between the last state and the specified timestamp)
   * @param {number} timestamp current timestamp
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getPendingSchedule (timestamp: number): Promise<EvaluatedEventSchedule> {
    return await this.contractEngine.computeEvaluatedPendingSchedule(
      await this.getTerms(),
      await this.getState(),
      timestamp
    );
  }

  /**
   * derives obligations by computing the next state of the asset and 
   * stores the new state if all obligation where fulfilled
   * @param {number} timestamp 
   * @return {Promise<void>}
   */
  public async progress (timestamp: number): Promise<void> {
    await this.ap.lifecycle.progress(this.assetId, timestamp);
  }

  /**
   * registers the terms, the initial state and the ownership of an asset 
   * and returns a new Asset instance.
   * computes the initial state of the asset,
   * stores it together with the terms of the EconomicsRegistry,
   * stores the ownership of the asset in the OwnershipRegistry and sends it
   * @param {AP} ap AP instance
   * @param {ContractTerms} terms terms of the asset
   * @param {AssetOwnership} ownership ownership of the asset
   * @returns {Promise<Asset>}
   */
  public static async create (
    ap: AP,
    terms: ContractTerms,
    ownership: AssetOwnership
  ): Promise<Asset> {
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

    await ap.ownership.registerOwnership(assetId, ownership);
    await ap.economics.registerEconomics(
      assetId, 
      terms, 
      initialContractState
    );

    return new Asset(ap, contractEngine, assetId);
  }

  /**
   * loads an already registered asset and returns a new Asset instance from a provided AssetId
   * @param {AP} ap AP instance
   * @param {string} assetId 
   * @returns {Promise<Asset>}
   */
  public static async load (
    ap: AP,
    assetId: string
  ): Promise<Asset> {
    const { contractType, statusDate } = await ap.economics.getTerms(assetId);

    if (statusDate == 0) { throw('NOT_FOUND_ERROR: no contract found for given AssetId!'); }

    let contractEngine;
    switch (contractType) {
      case ContractType.PAM:
        contractEngine = await PAM.init(ap.web3);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }
    
    return new Asset(ap, contractEngine, assetId);
  }
}
