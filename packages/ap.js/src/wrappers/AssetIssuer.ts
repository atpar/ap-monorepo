import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { AssetIssuedEvent } from '../types';
import { toAssetIssuedEvent } from './Conversions';

// const AssetIssuerArtifact: any = require('../../../ap-contracts/build/contracts/AssetIssuer.json');
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