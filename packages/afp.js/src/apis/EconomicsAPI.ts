import Web3 from 'web3';

import { ContractRegistry } from '../wrappers/ContractRegistry';
import { ContractTerms, ContractState } from  '../types';

export class EconomicsAPI {

  private registry: ContractRegistry;

  private constructor (registry: ContractRegistry) {
    this.registry = registry;
  }

  /**
   * registers the terms and the state of a new contract
   * @param {string} contractId 
   * @param {ContractTerms} contractTerms 
   * @param {ContractState} contractState 
   * @returns {Promise<void>}
   */
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

  /**
   * fetches the terms of a contract with given ContractId
   * @param {string} contractId
   * @returns {Promise<ContractTerms>} ContractTerms
   */
  public async getContractTerms (contractId: string): Promise<ContractTerms> {
    return await this.registry.getContractTerms(contractId);
  }

  /**
   * fetches the current state of a contract with a given ContractId
   * @param contractId
   * @returns {Promise<ContractState>}
   */
  public async getContractState (contractId: string): Promise<ContractState> {
    return await this.registry.getContractState(contractId);
  }

  /**
   * return a new instance of the EconomicsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<EconomicsAPI>}
   */
  public static async init (web3: Web3): Promise<EconomicsAPI> {
    const registry = await ContractRegistry.instantiate(web3);
    return new EconomicsAPI(registry);
  }
}
