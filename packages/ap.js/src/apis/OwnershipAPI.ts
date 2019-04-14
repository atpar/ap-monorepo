import Web3 from 'web3';
import { SendOptions } from 'web3-eth-contract/types';

import { OwnershipRegistry } from '../wrappers/OwnershipRegistry';
import { AssetOwnership } from '../types';
import { Signer } from '../utils/Signer';

export class OwnershipAPI {

  private registry: OwnershipRegistry;
  private signer: Signer;

  private constructor (registry: OwnershipRegistry, signer: Signer) {
    this.registry = registry;
    this.signer = signer;
  }

  /**
   * registers the ownership of a new asset for a given AssetId
   * @dev this requires the users signature (metamask pop-up)
   * @param {string} assetId 
   * @param {AssetOwnership} assetOwnership ownership object for a asset
   * @param {SendOptions} txOptions
   * @returns {Promise<void>}
   */
  public async registerOwnership (
    assetId: string, 
    assetOwnership: AssetOwnership,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.registry.registerOwnership(
      assetId,
      assetOwnership.recordCreatorObligorAddress,
      assetOwnership.recordCreatorBeneficiaryAddress,
      assetOwnership.counterpartyObligorAddress,
      assetOwnership.counterpartyBeneficiaryAddress,
      { ...txOptions, from: this.signer.account, gas: 300000 }
    );
  }

  /**
   * fetches the ownership for a given AssetId
   * @param {string} assetId 
   * @returns {Promise<AssetOwnership>} 
   */
  public async getOwnership (assetId: string): Promise<AssetOwnership> {
    return this.registry.getOwnership(assetId); 
  }

  /**
   * updates the default benficiary for on the record creator side
   * @dev only current benficiary is allowed to update the address
   * @param {string} assetId 
   * @param {string} newBenficiary 
   * @param {SendOptions} txOptions 
   */
  public async setRecordCreatorBeneficiary (
    assetId: string, 
    newBenficiary: string,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.registry.setRecordCreatorBeneficiary(
      assetId, 
      newBenficiary, 
      { ...txOptions, from: this.signer.account, gas: 100000 }
    );
  }

  /**
   * updates the default benficiary for on the counterparty side
   * @dev only current benficiary is allowed to update the address
   * @param {string} assetId 
   * @param {string} newBenficiary 
   * @param {SendOptions} txOptions 
   */
  public async setCounterpartyBeneficiary (
    assetId: string, 
    newBenficiary: string,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.registry.setCounterpartyBeneficiary(
      assetId, 
      newBenficiary, 
      { ...txOptions, from: this.signer.account, gas: 100000 }
    );
  }

  /**
   * returns a new instance of the OwnershipAPI
   * @param {Web3} web3 web3 instance
   * @returns {Promise<OwnershipAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<OwnershipAPI> {
    const registry = await OwnershipRegistry.instantiate(web3);
    return new OwnershipAPI(registry, signer);
  }
}
