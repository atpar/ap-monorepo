import Web3 from 'web3';
import { Contract, SendOptions } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { AssetIssuedEvent, OrderData } from '../types';
import { toAssetIssuedEvent } from './Conversions';

import AssetIssuerArtifact from '../../../ap-contracts/build/contracts/AssetIssuer.json';


export class AssetIssuer {
  private assetIssuer: Contract;

  private constructor (assetIssuerInstance: Contract) {
    this.assetIssuer = assetIssuerInstance;
  }

  public async getAssetIssuedEvents (): Promise<AssetIssuedEvent[]> {
    const events = await this.assetIssuer.getPastEvents('AssetIssued', {
      filter: {},
      fromBlock: 0,
      toBlock: 'latest'
    });

    const assetIssuedEvents: AssetIssuedEvent[] = events.map((event) => {
      return toAssetIssuedEvent(event);
    });

    return assetIssuedEvents;
  }

  public onAssetIssuedEvent (cb: (event: AssetIssuedEvent) => void): void {
    this.assetIssuer.events.AssetIssued().on('data', (event: EventLog) => {
      const assetIssuedEvent = toAssetIssuedEvent(event);
      cb(assetIssuedEvent);
    });
  }

  public async fillOrder (orderData: OrderData, txOptions: SendOptions): Promise<void> {
    const order = {
      maker: orderData.makerAddress,
      taker: orderData.takerAddress,
      actor: orderData.actorAddress,
      terms: orderData.terms,
      makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
      takerCreditEnhancement: orderData.takerCreditEnhancementAddress,
      salt: orderData.salt
    };

    await this.assetIssuer.methods.fillOrder(
      order,
      orderData.signatures.makerSignature,
      orderData.signatures.takerSignature
    ).send(txOptions);
  }
    
  public static async instantiate (web3: Web3): Promise<AssetIssuer> {
    const chainId = await web3.eth.net.getId();
    // @ts-ignore
    if (!AssetIssuerArtifact.networks[chainId]) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const assetIssuerInstance = new web3.eth.Contract(
      // @ts-ignore
      AssetIssuerArtifact.abi,
      // @ts-ignore
      AssetIssuerArtifact.networks[chainId].address
    );

    return new AssetIssuer(assetIssuerInstance);
  }
}