import { AssetProgressedEvent, AssetOwnership, ContractTerms, TransactionObject } from '../types';
import { ContractsAPI } from './ContractsAPI';


export class LifecycleAPI {

  private contracts: ContractsAPI;

  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
  }

  /**
   * initialize an asset
   * derives the first state from the terms and
   * stores the ownership in the OwnershipRegistry and the terms in the EconomicsRegistry
   * @param {string} assetId 
   * @param {AssetOwnership} ownership
   * @param {ContractTerms} terms
   * @param {string} engineAddress
   * @returns {TransactionObject}
   */
  public initialize (
    assetId: string, 
    ownership: AssetOwnership, 
    terms: ContractTerms,
    engineAddress: string,
  ): TransactionObject {
    return this.contracts.assetActor.initialize(
      assetId, 
      ownership,
      terms,
      engineAddress
    ); //  gas: 6000000
  }

  /**
   * progress the state of an asset
   * all obligation to date have to be fullfilled
   * @param {string} assetId 
   * @returns {TransactionObject}
   */
  public progress (
    assetId: string
  ): TransactionObject {
    return this.contracts.assetActor.progress(
      assetId
    ); // gas: 500000
  }

  /**
   * calls the provided callback function when the state of any asset is progressed
   * @param {(event: AssetProgressedEvent) => void} cb callback function 
   */
  public onProgress (cb: (event: AssetProgressedEvent) => void): void {
    this.contracts.assetActor.onAssetProgressedEvent(cb);
  }
}
