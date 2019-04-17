import Web3 from 'web3';

import { PAMAssetActor } from '../wrappers/PAMAssetActor';
import { Signer } from '../utils/Signer';
import { AssetProgressedEvent, AssetOwnership, ContractTerms, TransactionObject } from '../types';

export class LifecycleAPI {

  private actor: PAMAssetActor;
  // @ts-ignore 
  private signer: Signer;

  private constructor (actor: PAMAssetActor, signer: Signer) {
    this.actor = actor;
    this.signer = signer;
  }

  /**
   * returns the address of the asset actor
   * @returns {string}
   */
  public getActorAddress(): string { return this.actor.getAddress(); }

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
    return this.actor.initialize(
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
    return this.actor.progress(
      assetId, 
      timestamp
    ); // gas: 500000
  }

  /**
   * calls the provided callback function when the state of any asset is progressed
   * @param {(event: AssetProgressedEvent) => void} cb callback function 
   */
  public onProgress (cb: (event: AssetProgressedEvent) => void): void {
    this.actor.onAssetProgressedEvent(cb);
  }

  /**
   * return a new instance of the LifecycleAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<LifecycleAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<LifecycleAPI> {
    const actor = await PAMAssetActor.instantiate(web3);
    return new LifecycleAPI(actor, signer);
  }
}
