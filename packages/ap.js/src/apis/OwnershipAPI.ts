import Web3 from 'web3';

import { OwnershipRegistry } from '../wrappers/OwnershipRegistry';
import { ContractOwnership } from '../types';
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
   * @param contractOwnership ownership object for a asset
   * @returns {Promise<void>}
   */
  public async registerContractOwnership (
    assetId: string, 
    contractOwnership: ContractOwnership
  ): Promise<void> {
    await this.registry.registerOwnership(
      assetId,
      contractOwnership.recordCreatorObligorAddress,
      contractOwnership.recordCreatorBeneficiaryAddress,
      contractOwnership.counterpartyObligorAddress,
      contractOwnership.counterpartyBeneficiaryAddress,
      { from: this.signer.account, gas: 300000 }
    );
  }

  /**
   * fetches the ownership for a given AssetId
   * @param assetId 
   * @returns {Promise<ContractOwnership>} 
   */
  public async getContractOwnership (assetId: string): Promise<ContractOwnership> {
    return this.registry.getContractOwnership(assetId); 
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
