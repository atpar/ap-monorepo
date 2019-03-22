import Web3 from 'web3';

import { Contract, SendOptions } from 'web3-eth-contract/types';

import { ContractTerms, ContractState } from '../types';
import { toHex } from '../utils/Utils';

const AssetRegistryArtifact: any = require('../../../ap-contracts/build/contracts/AssetRegistry.json');

export class AssetRegistry {
  private assetRegistry: Contract;

  private constructor (assetRegistryInstance: Contract) {
    this.assetRegistry = assetRegistryInstance
  }

  public async registerContract (
    contractId: string, 
    contractTerms: ContractTerms,
    contractState: ContractState,
    actorAddress: string,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.assetRegistry.methods.registerContract(
      toHex(contractId), 
      contractTerms,
      contractState,
      actorAddress
    ).send({ ...txOptions });
  }

  public async getContractTerms (contractId: string): Promise<ContractTerms> {
    const contractTerms: ContractTerms = await this.assetRegistry.methods.getTerms(toHex(contractId)).call();
    return contractTerms;
  }

  public async getContractState (contractId: string): Promise<ContractState> {
    const contractState: ContractState = await this.assetRegistry.methods.getState(toHex(contractId)).call();

    return contractState;
  }

  public static async instantiate (web3: Web3): Promise<AssetRegistry> {
    const chainId = await web3.eth.net.getId();
    const assetRegistryInstance = new web3.eth.Contract(
      AssetRegistryArtifact.abi,
      AssetRegistryArtifact.networks[chainId].address
    );

    return new AssetRegistry(assetRegistryInstance);
  }
}