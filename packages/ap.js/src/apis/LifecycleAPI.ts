import { AssetProgressedEvent, AssetOwnership, ContractTerms, TransactionObject } from '../types';
import { ContractsAPI } from './ContractsAPI';


export class LifecycleAPI {

  private contracts: ContractsAPI;

  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
  }

  /**
   * returns the address of the asset actor
   * @returns {string}
   */
  public getActorAddress(): string { return this.contracts.assetActor.getAddress(); }

  /**
   * initialize an asset
   * derives the first state from the terms and
   * stores the ownership in the OwnershipRegistry and the terms in the EconomicsRegistry
   * @param {string} assetId 
   * @param {AssetOwnership} ownership
   * @param {ContractTerms} terms
   * @returns {TransactionObject}
   */
  public initialize (
    assetId: string, 
    ownership: AssetOwnership, 
    terms: ContractTerms
  ): TransactionObject {
    return this.contracts.assetActor.initialize(
      assetId, 
      ownership,
      terms
    ); //  gas: 6000000
  }

  /**
   * progress the state of an asset
   * all obligation to date have to be fullfilled
   * @param {string} assetId 
   * @param {number} timestamp
   * @returns {TransactionObject}
   */
  public progress (
    assetId: string,
    timestamp: number
  ): TransactionObject {
    return this.contracts.assetActor.progress(
      assetId,
      timestamp
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
