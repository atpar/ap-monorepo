import Web3 from 'web3';

import { ContractRegistry } from '../wrappers/ContractRegistry';
import { ContractTerms, ContractState } from  '../types';
import { Signer } from '../utils/Signer';

export class EconomicsAPI {

  private registry: ContractRegistry;
  private signer: Signer;

  private constructor (registry: ContractRegistry, signer: Signer) {
    this.registry = registry;
    this.signer = signer;
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
      '0x0000000000000000000000000000000000000001',
      { from: this.signer.account, gas: 700000 }
    );
  }

  /**
   * fetches the terms of a contract with given ContractId
   * @param {string} contractId
   * @returns {Promise<ContractTerms>} ContractTerms
   */
  public async getContractTerms (contractId: string): Promise<ContractTerms> {
    return this.registry.getContractTerms(contractId);
  }

  /**
   * fetches the current state of a contract with a given ContractId
   * @param contractId
   * @returns {Promise<ContractState>}
   */
  public async getContractState (contractId: string): Promise<ContractState> {
    return this.registry.getContractState(contractId);
  }

  /**
   * return a new instance of the EconomicsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<EconomicsAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<EconomicsAPI> {
    const registry = await ContractRegistry.instantiate(web3);
    return new EconomicsAPI(registry, signer);
  }
}
