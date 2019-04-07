import Web3 from 'web3';

import { PAMAssetActor } from '../wrappers/PAMAssetActor';
import { Signer } from '../utils/Signer';
import { SendOptions } from 'web3-eth-contract/types';
import { AssetProgressedEvent } from 'src/types';

export class LifecycleAPI {

  private actor: PAMAssetActor;
  private signer: Signer;

  // private progressListenerRegistry: Map<string, (assetId: string, eventId: number) => void>;

  private constructor (actor: PAMAssetActor, signer: Signer) {
    this.actor = actor;
    this.signer = signer;

    // this.progressListenerRegistry = new Map<string, (assetId: string) => void>();
  }

  public getActorAddress(): string { return this.actor.getAddress(); }

  public async progress (assetId: string, timestamp: number, txOptions: SendOptions): Promise<void> {
    await this.actor.progress(
      assetId, 
      timestamp, 
      { ...txOptions, from: this.signer.account, gas: 500000 }
    );
  }

  // /**
  //  * registers a listener which calls the provided callback function
  //  * upon receiving an AssetProgressed event for a specific asset
  //  * @param {string} assetId id of asset for which a listener should be registered
  //  * @param {(assetId: string, eventId: number) => void} cb callback function which returns id of the asset
  //  */
  // public registerAssetProgressListener (
  //   assetId: string, 
  //   cb: (assetId: string, eventId: number) => void
  // ): void {
  //   if (this.progressListenerRegistry.size === 0) {
  //     this.actor.onAssetProgressedEvent((event) => {
  //       const listener = this.progressListenerRegistry.get(event.assetId);
  //       if (listener) { return listener(event.assetId, event.eventId); }
  //     });
  //   }

  //   this.progressListenerRegistry.set(assetId, cb);
  // }

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
