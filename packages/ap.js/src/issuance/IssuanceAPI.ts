import Web3 from 'web3';
import { SendOptions } from 'web3-eth-contract/types';

import { AssetIssuer } from '../wrappers/AssetIssuer';
import { Signer } from '../utils/Signer';
import { AssetIssuedEvent, OrderData } from '../types';


export class IssuanceAPI {

  private issuer: AssetIssuer;
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
   * issues a new asset from a filled order
   * @dev registers ownership in the OwnershipRegistry and terms in the EconomicsRegistry
   * derives a new AssetId from the keccak256 of the maker and taker signatures
   * @param {OrderData} orderData filled order
   * @param {SendOptions} txOptions web3 transaction options
   */
  public async fillOrder (orderData: OrderData, txOptions?: SendOptions): Promise<void> {
    this.issuer.fillOrder(orderData, { ...txOptions, from: this.signer.account, gas: 3000000 });
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
  