import { AssetOwnership, TransactionObject } from '../types';
import { ContractsAPI } from './ContractsAPI';


export class OwnershipAPI {

  private contracts: ContractsAPI;

  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
  }

  /**
   * registers the ownership of a new asset for a given AssetId
   * @dev this requires the users signature (metamask pop-up)
   * @param {string} assetId 
   * @param {AssetOwnership} assetOwnership ownership object for a asset
   * @returns {TransactionObject}
   */
  public registerOwnership (
    assetId: string, 
    assetOwnership: AssetOwnership
  ): TransactionObject {
    return this.contracts.ownershipRegistry.registerOwnership(
      assetId,
      assetOwnership.recordCreatorObligorAddress,
      assetOwnership.recordCreatorBeneficiaryAddress,
      assetOwnership.counterpartyObligorAddress,
      assetOwnership.counterpartyBeneficiaryAddress
    ); // gas: 300000
  }

  /**
   * fetches the ownership for a given AssetId
   * @param {string} assetId 
   * @returns {Promise<AssetOwnership>} 
   */
  public getOwnership (assetId: string): Promise<AssetOwnership> {
    return this.contracts.ownershipRegistry.getOwnership(assetId).call(); 
  }

  /**
   * updates the default benficiary for on the record creator side
   * @dev only current benficiary is allowed to update the address
   * @param {string} assetId 
   * @param {string} newBenficiary 
   * @returns {TransactionObject}
   */
  public setRecordCreatorBeneficiary (
    assetId: string, 
    newBenficiary: string
  ): TransactionObject {
    return this.contracts.ownershipRegistry.setRecordCreatorBeneficiary(
      assetId, 
      newBenficiary
    ); //gas: 100000
  }

  /**
   * updates the default benficiary for on the counterparty side
   * @dev only current benficiary is allowed to update the address
   * @param {string} assetId 
   * @param {string} newBenficiary 
   * @returns {TransactionObject}
   */
  public setCounterpartyBeneficiary (
    assetId: string, 
    newBenficiary: string
  ): TransactionObject {
    return this.contracts.ownershipRegistry.setCounterpartyBeneficiary(
      assetId, 
      newBenficiary
    ); // gas: 100000
  }
}
