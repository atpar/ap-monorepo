import { ContractTerms, ContractState, ContractType } from  '../types';
import { ContractsAPI } from './ContractsAPI';
import { ContractEngine, PAM, ANN } from '../engines';


export class EconomicsAPI {

  private contracts: ContractsAPI;


  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
  }

  /**
   * returns the ContractEngine by ContractType 
   * @param {ContractType} contractType
   * @returns {ContractEngine}
   */
  public engine (contractType: ContractType, address?: string): ContractEngine {
    switch (contractType) {
      case ContractType.PAM: {
        return (address) ? new PAM(this.contracts.engineContract(address)) : new PAM(this.contracts.pamEngine);
      }
      case ContractType.ANN: {
        return (address) ? new ANN(this.contracts.engineContract(address)) : new ANN(this.contracts.annEngine);
      }
      default: {
        throw new Error('NOT_IMPLEMENTED_ERROR: Unsupported contract type!');
      }
    }
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
   * fetches the finalized state of an asset with a given AssetId
   * @param assetId
   * @returns {Promise<ContractState>}
   */
  public getFinalizedState (assetId: string): Promise<ContractState> {
    return this.contracts.assetRegistry.getFinalizedState(assetId).call();
  }

  /**
   * fetches the address of the ACTUS engine of an asset with a given AssetId
   * @param assetId
   * @returns {Promise<string>}
   */
  public getEngineAddress (assetId: string): Promise<string> {
    return this.contracts.assetRegistry.getEngineAddress(assetId).call();
  }
}
