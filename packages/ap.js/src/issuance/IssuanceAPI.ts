import Web3 from 'web3';

import { AssetIssuer } from '../wrappers/AssetIssuer';
import { Signer } from '../utils/Signer';
import { AssetIssuedEvent, OrderData, TransactionObject } from '../types';


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
  public getAssetIssuances (): Promise<AssetIssuedEvent[]> {
    return this.issuer.getAssetIssuedEvents().call();
  }

  /**
   * issues a new asset from a filled order
   * @dev registers ownership in the OwnershipRegistry and terms in the EconomicsRegistry
   * derives a new AssetId from the keccak256 of the maker and taker signatures
   * @param {OrderData} orderData filled order
   * @returns {TransactionObject}
   */
  public fillOrder (orderData: OrderData): TransactionObject {
    return this.issuer.fillOrder(orderData); // gas: 3000000
  }

  /**
   * return a new instance of the IssuanceAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<IssuanceAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<IssuanceAPI> {
    const issuer = await AssetIssuer.instantiate(web3);
    return new IssuanceAPI(issuer, signer);
  }
}
  
