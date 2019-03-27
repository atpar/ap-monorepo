import Web3 from 'web3';

import { EconomicsRegistry } from '../wrappers/EconomicsRegistry';
import { ContractTerms, ContractState } from  '../types';
import { Signer } from '../utils/Signer';

export class EconomicsAPI {

  private registry: EconomicsRegistry;
  private signer: Signer;

  private constructor (registry: EconomicsRegistry, signer: Signer) {
    this.registry = registry;
    this.signer = signer;
  }

  /**
   * registers the terms and the state of a new asset
   * @dev this requires the users signature (metamask pop-up)
   * @param {string} assetId 
   * @param {ContractTerms} contractTerms 
   * @param {ContractState} contractState 
   * @returns {Promise<void>}
   */
  public async registerEconomics (
    assetId: string, 
    contractTerms: ContractTerms, 
    contractState: ContractState,
    actorAddress: string
  ): Promise<void> {
    await this.registry.registerEconomics(
      assetId,
      contractTerms, 
      contractState, 
      actorAddress,
      { from: this.signer.account, gas: 700000 }
    );
  }

  /**
   * fetches the terms of a asset with given AssetId
   * @param {string} assetId
   * @returns {Promise<ContractTerms>} ContractTerms
   */
  public async getTerms (assetId: string): Promise<ContractTerms> {
    return this.registry.getTerms(assetId);
  }

  /**
   * fetches the current state of a asset with a given AssetId
   * @param assetId
   * @returns {Promise<ContractState>}
   */
  public async getState (assetId: string): Promise<ContractState> {
    return this.registry.getState(assetId);
  }

  public async getEventId (assetId: string): Promise<number> {
    return this.registry.getEventId(assetId);
  }

  /**
   * return a new instance of the EconomicsAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<EconomicsAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<EconomicsAPI> {
    const registry = await EconomicsRegistry.instantiate(web3);
    return new EconomicsAPI(registry, signer);
  }
}
