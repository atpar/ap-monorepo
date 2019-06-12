import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { toHex } from '../utils/Utils';
import { AssetProgressedEvent, AssetOwnership, ContractTerms, TransactionObject } from '../types/index';
import { toAssetProgressedEvent, fromContractTerms } from './Conversions';

import Deployments from '@atpar/ap-contracts/deployments.json';
import AssetActorArtifact from '@atpar/ap-contracts/artifacts/AssetActor.min.json';


export class AssetActor {
  private assetActor: Contract;

  private constructor (assetActorInstance: Contract) {
    this.assetActor = assetActorInstance
  }

  public getAddress (): string { return this.assetActor.options.address; }

  public initialize (
    assetId: string,
    ownership: AssetOwnership,
    terms: ContractTerms
  ): TransactionObject { 
    return this.assetActor.methods.initialize(
      toHex(assetId),
      [ ...Object.values(ownership) ],
      fromContractTerms(terms)
    );
  };

  public progress (assetId: string): TransactionObject {
    return this.assetActor.methods.progress(toHex(assetId));
  }

  public onAssetProgressedEvent (cb: (event: AssetProgressedEvent) => void): void {
    this.assetActor.events.AssetProgressed().on('data', (event: EventLog): void => {
      const assetProgressedEvent = toAssetProgressedEvent(event);
      cb(assetProgressedEvent);
    });
  }

  public static async instantiate (web3: Web3): Promise<AssetActor> {
    const chainId = await web3.eth.net.getId();
    // @ts-ignore
    if (!Deployments[chainId].AssetActor) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const assetActorInstance = new web3.eth.Contract(
      // @ts-ignore
      AssetActorArtifact.abi,
      // @ts-ignore
      Deployments[chainId].AssetActor
    );

    return new AssetActor(assetActorInstance);
  }
}
