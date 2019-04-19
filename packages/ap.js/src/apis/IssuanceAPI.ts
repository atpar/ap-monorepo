import { AssetIssuedEvent, OrderData, TransactionObject } from '../types';
import { ContractsAPI } from './ContractsAPI';


export class IssuanceAPI {

  private contracts: ContractsAPI;

  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
  }

  /**
   * calls the provided callback if a new asset is issued
   * @param {(event: AssetIssuedEvent) => void} cb 
   */
  public onAssetIssued (cb: (event: AssetIssuedEvent) => void): void {
    this.contracts.assetIssuer.onAssetIssuedEvent(cb);
  }

  /**
   * returns all issuances of assets
   * @returns {Promise<AssetIssuedEvent[]>}
   */
  public getAssetIssuances (): Promise<AssetIssuedEvent[]> {
    return this.contracts.assetIssuer.getAssetIssuedEvents().call();
  }

  /**
   * issues a new asset from a filled order
   * @dev registers ownership in the OwnershipRegistry and terms in the EconomicsRegistry
   * derives a new AssetId from the keccak256 of the maker and taker signatures
   * @param {OrderData} orderData filled order
   * @returns {TransactionObject}
   */
  public fillOrder (orderData: OrderData): TransactionObject {
    return this.contracts.assetIssuer.fillOrder(orderData); // gas: 3000000
  }
}
