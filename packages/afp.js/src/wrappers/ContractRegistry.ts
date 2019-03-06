import Web3 from 'web3';

import { Contract } from 'web3-eth-contract/types';

import { ContractTerms, ContractState } from '../types';
import { toHex } from '../utils/Utils';

const ContractRegistryArtifact: any = require('../../../afp-contracts/build/contracts/ContractRegistry.json');

export class ContractRegistry {
  private contractRegistry: Contract;

  private constructor (contractRegistryInstance: Contract) {
    this.contractRegistry = contractRegistryInstance
  }

  public async registerContract (
    contractId: string, 
    contractTerms: ContractTerms,
    contractState: ContractState,
    actorAddress: string
  ): Promise<void> {
    await this.contractRegistry.methods.registerContract(
      toHex(contractId), 
      contractTerms,
      contractState,
      actorAddress
    );
  }

  public async getContractTerms (contractId: string): Promise<ContractTerms> {
    const contractTerms: ContractTerms = await this.contractRegistry.methods.getTerms(toHex(contractId));
    return contractTerms;
  }

  public async getContractState (contractId: string): Promise<ContractState> {
    const contractState: ContractState = await this.contractRegistry.methods.getState(toHex(contractId));
    return contractState;
  }

  public static async instantiate (web3: Web3): Promise<ContractRegistry> {
    const chainId = await web3.eth.net.getId();
    const contractRegistryInstance = new web3.eth.Contract(
      ContractRegistryArtifact.abi,
      ContractRegistryArtifact.networks[chainId].address
    );

    return new ContractRegistry(contractRegistryInstance);
  }
}