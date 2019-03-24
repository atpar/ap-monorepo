import Web3 from 'web3';

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
   * @param assetId 
   * @param assetOwnership ownership object for a asset
   * @returns {Promise<void>}
   */
  public async registerOwnership (
    assetId: string, 
    assetOwnership: AssetOwnership
  ): Promise<void> {
    await this.registry.registerOwnership(
      assetId,
      assetOwnership.recordCreatorObligorAddress,
      assetOwnership.recordCreatorBeneficiaryAddress,
      assetOwnership.counterpartyObligorAddress,
      assetOwnership.counterpartyBeneficiaryAddress,
      { from: this.signer.account, gas: 300000 }
    );
  }

  /**
   * fetches the ownership for a given AssetId
   * @param assetId 
   * @returns {Promise<AssetOwnership>} 
   */
  public async getOwnership (assetId: string): Promise<AssetOwnership> {
    return this.registry.getOwnership(assetId); 
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
