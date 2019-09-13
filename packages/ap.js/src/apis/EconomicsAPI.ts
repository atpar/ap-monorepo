import { ContractTerms, ContractState, ContractType } from  '../types';
import { ContractsAPI } from './ContractsAPI';
import { ContractEngine, PAM, ANN } from '../engines';


export class EconomicsAPI {

  private contracts: ContractsAPI;
  public engines: Map<ContractType, ContractEngine>;

  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
    this.engines = new Map();
    
    this.engines.set(ContractType.PAM, new PAM(contracts.pamEngine));
    this.engines.set(ContractType.ANN, new ANN(contracts.annEngine));
  }

  /**
   * returns the ContractEngine by ContractType 
   * @param {ContractType} contractType
   * @returns {ContractEngine}
   */
  public engine (contractType: ContractType): ContractEngine {
    const engine = this.engines.get(contractType);
    if (!engine) { throw(new Error('NOT_IMPLEMENTED_ERROR: Unsupported contract type!')); }
    return engine;
  }

  /**
   * fetches the terms of an asset with given AssetId
   * @param {string} assetId
   * @returns {Promise<ContractTerms>}
   */
  public getTerms (assetId: string): Promise<ContractTerms> {
    return this.contracts.assetRegistry.getTerms(assetId).call();
  }

  /**
   * fetches the current state of an asset with a given AssetId
   * @param assetId
   * @returns {Promise<ContractState>}
   */
  public getState (assetId: string): Promise<ContractState> {
    return this.contracts.assetRegistry.getState(assetId).call();
  }

  /**
   * fetches the address of the ACTUS engine of an asset with a given AssetId
   * @param assetId
   * @returns {Promise<string>}
   */
  public getEngineAddress (assetId: string): Promise<string> {
    return this.contracts.assetRegistry.getEngineAddress(assetId).call();
  }

  /**
   * fetches the last event id of an asset with a given AssetId
   * @param {string} assetId
   * @returns {Promise<number>}
   */
  public getEventId (assetId: string): Promise<number> {
    return this.contracts.assetRegistry.getEventId(assetId).call();
  }
}
