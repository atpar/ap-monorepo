import Web3 from 'web3';

import { PAMAssetActor } from '../wrappers/PAMAssetActor';
import { Signer } from '../utils/Signer';
import { SendOptions } from 'web3-eth-contract/types';

export class LifecycleAPI {

  private actor: PAMAssetActor;
  private signer: Signer;

  private constructor (actor: PAMAssetActor, signer: Signer) {
    this.actor = actor;
    this.signer = signer;
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
   * return a new instance of the EconomicsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<EconomicsAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<LifecycleAPI> {
    const registry = await PAMAssetActor.instantiate(web3);
    return new LifecycleAPI(registry, signer);
  }
}
