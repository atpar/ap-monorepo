import Web3 from 'web3';

import { EconomicsRegistry } from '../wrappers/EconomicsRegistry';
import { ContractTerms, ContractState, TransactionObject } from  '../types';
import { Signer } from '../utils/Signer';

export class EconomicsAPI {

  private registry: EconomicsRegistry;
  // @ts-ignore
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
   * @returns {TransactionObject}
   */
  public registerEconomics (
    assetId: string, 
    contractTerms: ContractTerms, 
    contractState: ContractState,
    actorAddress: string
  ): TransactionObject {
    return this.registry.registerEconomics(
      assetId,
      contractTerms, 
      contractState, 
      actorAddress
    ); // gas: 700000
  }

  /**
   * fetches the terms of an asset with given AssetId
   * @param {string} assetId
   * @returns {Promise<ContractTerms>}
   */
  public getTerms (assetId: string): Promise<ContractTerms> {
    return this.registry.getTerms(assetId).call();
  }

  /**
   * fetches the current state of an asset with a given AssetId
   * @param assetId
   * @returns {Promise<ContractState>}
   */
  public getState (assetId: string): Promise<ContractState> {
    return this.registry.getState(assetId).call();
  }

  /**
   * fetches the last event id of an asset with a given AssetId
   * @param {string} assetId
   * @returns {Promise<number>}
   */
  public getEventId (assetId: string): Promise<number> {
    return this.registry.getEventId(assetId).call();
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
