import Web3 from 'web3';

import { OwnershipRegistry } from '../wrappers/OwnershipRegistry';
import { ContractOwnership } from '../types';

export class OwnershipAPI {

  private registry: OwnershipRegistry;

  private constructor (registry: OwnershipRegistry) {
    this.registry = registry;
  }

  /**
   * registers the ownership of a new contract for a given ContractId
   * @param contractId 
   * @param contractOwnership ownership object for a contract
   * @returns {Promise<void>}
   */
  public async registerContractOwnership (
    contractId: string, 
    contractOwnership: ContractOwnership
  ): Promise<void> {
    await this.registry.registerOwnership(
      contractId,
      contractOwnership.recordCreatorObligorAddress,
      contractOwnership.recordCreatorBeneficiaryAddress,
      contractOwnership.counterpartyObligorAddress,
      contractOwnership.counterpartyBeneficiaryAddress
    );
  }

  /**
   * fetches the ownership for a given ContractId
   * @param contractId 
   * @returns {Promise<ContractOwnership>} 
   */
  public async getContractOwnership (contractId: string): Promise<ContractOwnership> {
    return this.registry.getContractOwnership(contractId); 
  }

  /**
   * returns a new instance of the OwnershipAPI
   * @param {Web3} web3 web3 instance
   * @returns {Promise<OwnershipAPI>}
   */
  public static async init (web3: Web3): Promise<OwnershipAPI> {
    const registry = await OwnershipRegistry.instantiate(web3);
    return new OwnershipAPI(registry);
  }
}
