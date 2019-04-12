import Web3 from 'web3';

import { AssetIssuer } from '../wrappers/AssetIssuer';
import { Signer } from '../utils/Signer';
import { AssetIssuedEvent } from '../types';


export class IssuanceAPI {

  private issuer: AssetIssuer;
  // @ts-ignore 
  private signer: Signer;

  private constructor (issuer: AssetIssuer, signer: Signer) {
    this.issuer = issuer;
    this.signer = signer;
  }

  /**
   * calls the provided callback if a new asset is issued
   * @param {(event: AssetIssuedEvent) => void} cb 
   */
  public onAssetIssued (cb: (event: AssetIssuedEvent) => void): void {
    this.issuer.onAssetIssuedEvent(cb);
  }

  /**
   * returns all issuances of assets
   * @returns {Promise<AssetIssuedEvent[]>}
   */
  public async getAssetIssuances (): Promise<AssetIssuedEvent[]> {
    return this.issuer.getAssetIssuedEvents();
  }

  /**
   * return a new instance of the EconomicsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<Issuer>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<IssuanceAPI> {
    const issuer = await AssetIssuer.instantiate(web3);
    return new IssuanceAPI(issuer, signer);
  }
}
  