import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { toHex } from '../utils/Utils';
import { AssetProgressedEvent, AssetOwnership, ContractTerms, TransactionObject } from '../types/index';
import { toAssetProgressedEvent, fromContractTerms } from './Conversions';

import Deployments from '@atpar/ap-contracts/deployments.json';
import AssetActorArtifact from '@atpar/ap-contracts/artifacts/AssetActor.min.json';


export class AssetActor {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance
  }

  public initialize (
    assetId: string,
    ownership: AssetOwnership,
    terms: ContractTerms
  ): TransactionObject { 
    return this.instance.methods.initialize(
      toHex(assetId),
      [ ...Object.values(ownership) ],
      fromContractTerms(terms)
    );
  };

  public progress (assetId: string): TransactionObject {
    return this.instance.methods.progress(toHex(assetId));
  }

  public onAssetProgressedEvent (cb: (event: AssetProgressedEvent) => void): void {
    this.instance.events.AssetProgressed().on('data', (event: EventLog): void => {
      const assetProgressedEvent = toAssetProgressedEvent(event);
      cb(assetProgressedEvent);
    });
  }

  public static async instantiate (web3: Web3): Promise<AssetActor> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!Deployments[netId] || !Deployments[netId].AssetActor) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const instance = new web3.eth.Contract(
      // @ts-ignore
      AssetActorArtifact.abi,
      // @ts-ignore
      Deployments[netId].AssetActor
    );

    return new AssetActor(instance);
  }
}
