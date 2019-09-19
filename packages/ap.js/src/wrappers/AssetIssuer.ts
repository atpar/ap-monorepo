import Web3 from 'web3';
import { Contract, EventOptions } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { AssetIssuedEvent, OrderData, TransactionObject, CallObject } from '../types';
import { toAssetIssuedEvent } from './Conversions';

import Deployments from '@atpar/ap-contracts/deployments.json';
import AssetIssuerArtifact from '@atpar/ap-contracts/artifacts/AssetIssuer.min.json';


export class AssetIssuer {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance;
  }

  public getAssetIssuedEvents = (options: EventOptions): CallObject<AssetIssuedEvent[]> => ({
    call: async (): Promise<AssetIssuedEvent[]> => {
      const events = await this.instance.getPastEvents('AssetIssued', options);

      const assetIssuedEvents: AssetIssuedEvent[] = events.map((event): AssetIssuedEvent => {
        return toAssetIssuedEvent(event);
      });

      return assetIssuedEvents;
    }
  })

  public onAssetIssuedEvent (cb: (event: AssetIssuedEvent) => void): void {
    this.instance.events.AssetIssued().on('data', (event: EventLog): void => {
      const assetIssuedEvent = toAssetIssuedEvent(event);
      cb(assetIssuedEvent);
    });
  }

  public fillOrder (orderData: OrderData): TransactionObject {
    const order = {
      maker: orderData.makerAddress,
      taker: orderData.takerAddress,
      engine: orderData.engineAddress,
      actor: orderData.actorAddress,
      terms: orderData.terms,
      makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
      takerCreditEnhancement: orderData.takerCreditEnhancementAddress,
      salt: orderData.salt
    };

    return this.instance.methods.fillOrder(
      order,
      orderData.signatures.makerSignature,
      orderData.signatures.takerSignature
    );
  }
    
  public static async instantiate (web3: Web3, customAddress?: string): Promise<AssetIssuer> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!customAddress && (!Deployments[netId] || !Deployments[netId].AssetIssuer)) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const instance = new web3.eth.Contract(
      // @ts-ignore
      AssetIssuerArtifact.abi,
      // @ts-ignore
      customAddress || Deployments[netId].AssetIssuer
    );

    return new AssetIssuer(instance);
  }
}
