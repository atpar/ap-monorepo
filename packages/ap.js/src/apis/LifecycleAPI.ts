import Web3 from 'web3';

import { PAMAssetActor } from '../wrappers/PAMAssetActor';
import { Signer } from '../utils/Signer';
import { SendOptions } from 'web3-eth-contract/types';

export class LifecycleAPI {

  private actor: PAMAssetActor;
  private signer: Signer;

  private assetListenerRegistry: Map<string, (assetId: string, eventId: number) => void>;

  private constructor (actor: PAMAssetActor, signer: Signer) {
    this.actor = actor;
    this.signer = signer;

    this.assetListenerRegistry = new Map<string, (assetId: string) => void>();
  }

  public getActorAddress(): string { return this.actor.getAddress(); }

  public async progress (assetId: string, timestamp: number, txOptions: SendOptions): Promise<void> {
    await this.actor.progress(
      assetId, 
      timestamp, 
      { ...txOptions, from: this.signer.account, gas: 500000 }
    );
  }

  /**
   * registers an asset listener which calls the provided callback function
   * upon receiving an AssetProgressed event for an asset
   * @param {string} assetId id of asset for which a listener should be registered
   * @param {(assetId: string, eventId: number) => void} cb callback function which returns id of the asset
   */
  public registerAssetListener (
    assetId: string, 
    cb: (assetId: string, eventId: number) => void
  ): void {
    if (this.assetListenerRegistry.size === 0) {
      this.actor.onAssetProgressedEvent((event) => {
        const listener = this.assetListenerRegistry.get(event.assetId);
        if (listener) { return listener(event.assetId, event.eventId); }
      });
    }

    this.assetListenerRegistry.set(assetId, cb);
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
