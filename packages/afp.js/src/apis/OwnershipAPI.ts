import Web3 from 'web3';

import { OwnershipRegistry } from '../wrappers/OwnershipRegistry';
import { ContractOwnership } from '../types';

export class OwnershipAPI {

  private registry: OwnershipRegistry;

  private constructor (registry: OwnershipRegistry) {
    this.registry = registry;
  }

  public async registerContractOwnership (contractId: string, contractOwnership: ContractOwnership) {
    await this.registry.registerOwnership(
      contractId,
      contractOwnership.recordCreatorObligorAddress,
      contractOwnership.recordCreatorBeneficiaryAddress,
      contractOwnership.counterpartyObligorAddress,
      contractOwnership.counterpartyBeneficiaryAddress
    );
  }

  public async getContractOwnership (contractId: string) {
    return this.registry.getContractOwnership(contractId); 
  }

  public static async init (web3: Web3) {
    const registry = await OwnershipRegistry.instantiate(web3);
    return new OwnershipAPI(registry);
  }
}
