import Web3 from 'web3';
import { Contract, SendOptions } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { toHex } from '../utils/Utils';
import { AssetProgressedEvent, AssetOwnership, ContractTerms } from '../types';
import { toAssetProgressedEvent, fromContractTerms } from './Conversions';

import PAMAssetActorArtifact from '../../../ap-contracts/build/contracts/PAMAssetActor.json';


export class PAMAssetActor {
  private pamAssetActor: Contract;

  private constructor (pamAssetActorInstance: Contract) {
    this.pamAssetActor = pamAssetActorInstance
  }

  public getAddress (): string { return this.pamAssetActor.options.address; }

  public async initialize (
    assetId: string,
    ownership: AssetOwnership,
    terms: ContractTerms,
    txOptions: SendOptions
  ): Promise<void> {
    await this.pamAssetActor.methods.initialize(
      toHex(assetId),
      [ ...Object.values(ownership) ],
      fromContractTerms(terms)
    ).send(txOptions);
  }

  public async progress (
    assetId: string, 
    timestamp: number, 
    txOptions: SendOptions
  ): Promise<void> {
    await this.pamAssetActor.methods.progress(toHex(assetId), timestamp).send(txOptions);
  }

  public onAssetProgressedEvent (cb: (event: AssetProgressedEvent) => void): void {
    this.pamAssetActor.events.AssetProgressed().on('data', (event: EventLog) => {
      const assetProgressedEvent = toAssetProgressedEvent(event);
      cb(assetProgressedEvent);
    });
  }

  public static async instantiate (web3: Web3): Promise<PAMAssetActor> {
    const chainId = await web3.eth.net.getId();
    // @ts-ignore
    if (!PAMAssetActorArtifact.networks[chainId]) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const pamAssetActorInstance = new web3.eth.Contract(
      // @ts-ignore
      PAMAssetActorArtifact.abi,
      // @ts-ignore
      PAMAssetActorArtifact.networks[chainId].address
    );

    return new PAMAssetActor(pamAssetActorInstance);
  }
}