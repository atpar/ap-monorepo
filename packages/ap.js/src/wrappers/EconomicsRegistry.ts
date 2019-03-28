import Web3 from 'web3';
import { Contract, SendOptions } from 'web3-eth-contract/types';

import { ContractTerms, ContractState } from '../types';
import { toHex } from '../utils/Utils';
import { toContractState, fromContractState } from './Conversions';

// const EconomicsRegistryArtifact: any = require('../../../ap-contracts/build/contracts/EconomicsRegistry.json');
import EconomicsRegistryArtifact from '../../../ap-contracts/build/contracts/EconomicsRegistry.json';


export class EconomicsRegistry {
  private economicsRegistry: Contract;

  private constructor (economicsRegistryInstance: Contract) {
    this.economicsRegistry = economicsRegistryInstance
  }

  public async registerEconomics (
    assetId: string, 
    contractTerms: ContractTerms,
    contractState: ContractState,
    actorAddress: string,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.economicsRegistry.methods.registerEconomics(
      toHex(assetId), 
      contractTerms,
      fromContractState(contractState),
      actorAddress
    ).send({ ...txOptions });
  }

  public async getTerms (assetId: string): Promise<ContractTerms> {
    const contractTerms: ContractTerms = await this.economicsRegistry.methods.getTerms(toHex(assetId)).call();
    return contractTerms;
  }

  public async getState (assetId: string): Promise<ContractState> {
    const response = await this.economicsRegistry.methods.getState(toHex(assetId)).call();
    const contractState = toContractState(response);
    return contractState;
  }

  public async getEventId (assetId: string): Promise<number> {
    const response = await this.economicsRegistry.methods.getEventId(toHex(assetId)).call();
    const eventId = Number(response);
    return eventId;
  }

  public static async instantiate (web3: Web3): Promise<EconomicsRegistry> {
    const chainId = await web3.eth.net.getId();
    // @ts-ignore
    if (!EconomicsRegistryArtifact.networks[chainId]) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const economicsRegistryInstance = new web3.eth.Contract(
      //@ts-ignore
      EconomicsRegistryArtifact.abi,
      //@ts-ignore
      EconomicsRegistryArtifact.networks[chainId].address
    );

    return new EconomicsRegistry(economicsRegistryInstance);
  }
}