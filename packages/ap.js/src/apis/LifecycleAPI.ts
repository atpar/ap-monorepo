import Web3 from 'web3';
import { SendOptions } from 'web3-eth-contract/types';

import { PAMAssetActor } from '../wrappers/PAMAssetActor';
import { Signer } from '../utils/Signer';
import { AssetProgressedEvent, AssetOwnership, ContractTerms } from '../types';

export class LifecycleAPI {

  private actor: PAMAssetActor;
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
   * @param {SendOptions} txOptions
   * @returns {Promise<void>}
   */
  public async initialize (
    assetId: string, 
    ownership: AssetOwnership, 
    terms: ContractTerms,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.actor.initialize(
      assetId, 
      ownership,
      terms, 
      { ...txOptions, from: this.signer.account, gas: 6000000 }
    );
  }

  /**
   * progress the state of an asset
   * all obligation to date have to be fullfilled
   * @param {string} assetId 
   * @param {number} timestamp
   * @param {SendOptions} txOptions
   * @returns {Promise<void>}
   */
  public async progress (
    assetId: string, 
    timestamp: number, 
    txOptions?: SendOptions
  ): Promise<void> {
    await this.actor.progress(
      assetId, 
      timestamp, 
      { ...txOptions, from: this.signer.account, gas: 500000 }
    );
  }

  /**
   * calls the provided callback function when the state of any asset is progressed
   * @param {(event: AssetProgressedEvent) => void} cb callback function 
   */
  public onProgress (cb: (event: AssetProgressedEvent) => void): void {
    this.actor.onAssetProgressedEvent(cb);
  }

  /**
   * return a new instance of the EconomicsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<EconomicsAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<LifecycleAPI> {
    const actor = await PAMAssetActor.instantiate(web3);
    return new LifecycleAPI(actor, signer);
  }
}
