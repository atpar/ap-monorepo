import Web3 from 'web3';

import { AssetIssuer } from '../wrappers/AssetIssuer';
import { Signer } from '../utils/Signer';


export class IssuanceAPI {

  private issuer: AssetIssuer;
  private signer: Signer;

  private constructor (issuer: AssetIssuer, signer: Signer) {
    this.issuer = issuer;
    this.signer = signer;
  }

  /**
   * calls the provided callback if a new asset associated with 
   * the default account got issued
   * @param {(assetId: string) => void} cb 
   */
  public onAssetIssued (cb: (assetId: string) => void): void {
    this.issuer.onAssetIssuedEvent((event) => {
      if (
        event.recordCreatorAddress === this.signer.account || 
        event.counterpartyAddress === this.signer.account
      ) {
        cb(event.assetId);
      }
    });
  }

  /**
   * returns all assetIds of assets which are associated with default account
   * @returns {Promise<string[]>}
   */
  public async getAssetIds (): Promise<string[]> {
    const events = await this.issuer.getAssetIssuedEvents();
    const assetIds = [];
    
    for (const event of events) {
      if (
        event.recordCreatorAddress === this.signer.account ||
        event.counterpartyAddress === this.signer.account
      ) {
        assetIds.push(event.assetId);
      }
    }

    return assetIds;
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
  