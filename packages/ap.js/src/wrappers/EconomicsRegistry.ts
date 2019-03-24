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
    contractId: string, 
    contractTerms: ContractTerms,
    contractState: ContractState,
    actorAddress: string,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.economicsRegistry.methods.registerContract(
      toHex(contractId), 
      contractTerms,
      contractState,
      actorAddress
    ).send({ ...txOptions });
  }

  public async getContractTerms (contractId: string): Promise<ContractTerms> {
    const contractTerms: ContractTerms = await this.economicsRegistry.methods.getTerms(toHex(contractId)).call();
    return contractTerms;
  }

  public async getContractState (contractId: string): Promise<ContractState> {
    const contractState: ContractState = await this.economicsRegistry.methods.getState(toHex(contractId)).call();

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