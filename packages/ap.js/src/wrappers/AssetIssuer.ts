import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { AssetIssuedEvent, OrderData, TransactionObject, CallObject } from '../types';
import { toAssetIssuedEvent } from './Conversions';

import Deployments from '@atpar/ap-contracts/deployments.json';
import AssetIssuerArtifact from '@atpar/ap-contracts/artifacts/AssetIssuer.min.json';


export class AssetIssuer {

  private assetIssuer: Contract;

  private constructor (assetIssuerInstance: Contract) {
    this.assetIssuer = assetIssuerInstance;
  }

  public getAssetIssuedEvents = (): CallObject<AssetIssuedEvent[]> => ({
    call: async (): Promise<AssetIssuedEvent[]> => {
      const events = await this.assetIssuer.getPastEvents('AssetIssued', {
        filter: {},
        fromBlock: 0,
        toBlock: 'latest'
      });

      const assetIssuedEvents: AssetIssuedEvent[] = events.map((event): AssetIssuedEvent => {
        return toAssetIssuedEvent(event);
      });

      return assetIssuedEvents;
    }
  })

  public onAssetIssuedEvent (cb: (event: AssetIssuedEvent) => void): void {
    this.assetIssuer.events.AssetIssued().on('data', (event: EventLog): void => {
      const assetIssuedEvent = toAssetIssuedEvent(event);
      cb(assetIssuedEvent);
    });
  }

  public fillOrder (orderData: OrderData): TransactionObject {
    const order = {
      maker: orderData.makerAddress,
      taker: orderData.takerAddress,
      actor: orderData.actorAddress,
      terms: orderData.terms,
      makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
      takerCreditEnhancement: orderData.takerCreditEnhancementAddress,
      salt: orderData.salt
    };

    return this.assetIssuer.methods.fillOrder(
      order,
      orderData.signatures.makerSignature,
      orderData.signatures.takerSignature
    );
  }
    
  public static async instantiate (web3: Web3): Promise<AssetIssuer> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!Deployments[netId] || !Deployments[netId].AssetIssuer) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const assetIssuerInstance = new web3.eth.Contract(
      // @ts-ignore
      AssetIssuerArtifact.abi,
      // @ts-ignore
      Deployments[netId].AssetIssuer
    );

    return new AssetIssuer(assetIssuerInstance);
  }
}
