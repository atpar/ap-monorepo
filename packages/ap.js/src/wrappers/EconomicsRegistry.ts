import Web3 from 'web3';

import { Contract, SendOptions } from 'web3-eth-contract/types';

import { ContractTerms, ContractState } from '../types';
import { toHex } from '../utils/Utils';

const EconomicsRegistryArtifact: any = require('../../../ap-contracts/build/contracts/EconomicsRegistry.json');

export class EconomicsRegistry {
  private economicsRegistry: Contract;

  private constructor (economicsRegistryInstance: Contract) {
    this.economicsRegistry = economicsRegistryInstance
  }

  public async registerContract (
    assetId: string, 
    contractTerms: ContractTerms,
    contractState: ContractState,
    actorAddress: string,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.economicsRegistry.methods.registerContract(
      toHex(assetId), 
      contractTerms,
      contractState,
      actorAddress
    ).send({ ...txOptions });
  }

  public async getContractTerms (assetId: string): Promise<ContractTerms> {
    const contractTerms: ContractTerms = await this.economicsRegistry.methods.getTerms(toHex(assetId)).call();
    return contractTerms;
  }

  public async getContractState (assetId: string): Promise<ContractState> {
    const contractState: ContractState = await this.economicsRegistry.methods.getState(toHex(assetId)).call();

    return contractState;
  }

  public static async instantiate (web3: Web3): Promise<EconomicsRegistry> {
    const chainId = await web3.eth.net.getId();
    const economicsRegistryInstance = new web3.eth.Contract(
      EconomicsRegistryArtifact.abi,
      EconomicsRegistryArtifact.networks[chainId].address
    );

    return new EconomicsRegistry(economicsRegistryInstance);
  }
}