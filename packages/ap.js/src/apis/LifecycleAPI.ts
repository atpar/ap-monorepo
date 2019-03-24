import Web3 from 'web3';

import { PAMContractActor } from '../wrappers/PAMContractActor';
import { Signer } from '../utils/Signer';

export class LifecycleAPI {

  private actor: PAMContractActor;
  private signer: Signer;

  private constructor (actor: PAMContractActor, signer: Signer) {
    this.actor = actor;
    this.signer = signer;
  }

  public async progress (assetId: string, timestamp: number): Promise<void> {
    await this.actor.progress(assetId, timestamp, { from: this.signer.account, gas: 500000 });
  }

  /**
   * return a new instance of the EconomicsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<EconomicsAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<LifecycleAPI> {
    const registry = await PAMContractActor.instantiate(web3);
    return new LifecycleAPI(registry, signer);
  }
}
