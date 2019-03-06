import Web3 from 'web3';

import { ContractRegistry } from '../wrappers/ContractRegistry';
import { ContractTerms, ContractState } from  '../types';

export class EconomicsAPI {

  private registry: ContractRegistry;

  private constructor (registry: ContractRegistry) {
    this.registry = registry;
  }

  public async registerContract (
    contractId: string, 
    contractTerms: ContractTerms, 
    contractState: ContractState
  ): Promise<void> {
    await this.registry.registerContract(
      contractId, 
      contractTerms, 
      contractState, 
      '0x0000000000000000000000000000000000000000'
    );
  }

  public async getContractTerms (contractId: string): Promise<ContractTerms> {
    return await this.registry.getContractTerms(contractId);
  }

  public async getContractState (contractId: string): Promise<ContractState> {
    return await this.registry.getContractState(contractId);
  }

  public static async init (web3: Web3): Promise<EconomicsAPI> {
    const registry = await ContractRegistry.instantiate(web3);
    return new EconomicsAPI(registry);
  }
}
