import { ContractTerms, ContractState, TransactionObject, ContractType } from  '../types';
import { ContractsAPI } from './ContractsAPI';
import { ContractEngine, PAM } from '../engines';


export class EconomicsAPI {

  private contracts: ContractsAPI;
  public engines: Map<ContractType, ContractEngine>;

  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
    this.engines = new Map();
    
    this.engines.set(ContractType.PAM, new PAM(contracts.pamEngine));
  }

  public engine (contractType: ContractType): ContractEngine {
    const engine = this.engines.get(contractType);
    if (!engine) { throw(new Error('NOT_IMPLEMENTED_ERROR: Unsupported contract type!')); }
    return engine;
  }

  /**
   * registers the terms and the state of a new asset
   * @dev this requires the users signature (metamask pop-up)
   * @param {string} assetId 
   * @param {ContractTerms} contractTerms 
   * @param {ContractState} contractState
   * @returns {TransactionObject}
   */
  public registerEconomics (
    assetId: string, 
    contractTerms: ContractTerms, 
    contractState: ContractState,
    actorAddress: string
  ): TransactionObject {
    return this.contracts.economicsRegistry.registerEconomics(
      assetId,
      contractTerms, 
      contractState, 
      actorAddress
    ); // gas: 700000
  }

  /**
   * fetches the terms of an asset with given AssetId
   * @param {string} assetId
   * @returns {Promise<ContractTerms>}
   */
  public getTerms (assetId: string): Promise<ContractTerms> {
    return this.contracts.economicsRegistry.getTerms(assetId).call();
  }

  /**
   * fetches the current state of an asset with a given AssetId
   * @param assetId
   * @returns {Promise<ContractState>}
   */
  public getState (assetId: string): Promise<ContractState> {
    return this.contracts.economicsRegistry.getState(assetId).call();
  }

  /**
   * fetches the last event id of an asset with a given AssetId
   * @param {string} assetId
   * @returns {Promise<number>}
   */
  public getEventId (assetId: string): Promise<number> {
    return this.contracts.economicsRegistry.getEventId(assetId).call();
  }
}
