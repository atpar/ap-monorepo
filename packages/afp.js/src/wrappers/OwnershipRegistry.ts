import Web3 from 'web3';

import { Contract } from 'web3-eth-contract/types';
import { toHex } from '../utils/Utils';
import { ContractOwnership } from '../types';

const OwnershipRegistryArtifact: any = require('../../../afp-contracts/build/contracts/OwnershipRegistry.json');

export class OwnershipRegistry {
  private ownershipRegistry: Contract;

  private constructor (ownershipRegistryInstance: Contract) {
    this.ownershipRegistry = ownershipRegistryInstance
  }

  public async registerOwnership (
    contractId: string,
    recordCreatorObligorAddress: string,
    recordCreatorBeneficiaryAddress: string,
    counterpartyObligorAddress: string,
    counterpartyBeneficiaryAddress: string
    
  ): Promise<void> {
    await this.ownershipRegistry.methods.registerOwnership(
      toHex(contractId), 
      recordCreatorObligorAddress,
      recordCreatorBeneficiaryAddress,
      counterpartyObligorAddress,
      counterpartyBeneficiaryAddress
    );
  }

  public async setBeneficiaryForCashflowId (
    contractId: string, 
    cashflowId: number, 
    beneficiaryAddress: string
  ): Promise<void> {
    await this.ownershipRegistry.methods.setBeneficiaryForCashflowId(
      toHex(contractId),
      cashflowId,
      beneficiaryAddress
    );
  }

  public async getContractOwnership (contractId: string): Promise<ContractOwnership> {
    const { 
      0: recordCreatorObligorAddress, 
      1: recordCreatorBeneficiaryAddress, 
      2: counterpartyObligorAddress, 
      3: counterpartyBeneficiaryAddress 
    } : { 
      0: string, 
      1: string, 
      2: string, 
      3: string 
    } = await this.ownershipRegistry.methods.getContractOwnership(toHex(contractId));

    return { 
      recordCreatorObligorAddress, 
      recordCreatorBeneficiaryAddress, 
      counterpartyObligorAddress, 
      counterpartyBeneficiaryAddress 
    };
  }

  public async getCashflowBeneficiary (contractId: string, cashflowId: number): Promise<string> {
    const beneficiary: string = await this.ownershipRegistry.methods.getCashflowBeneficiary(toHex(contractId), cashflowId);
    return beneficiary;
  }

  public static async instantiate (web3: Web3): Promise<OwnershipRegistry> {
    const chainId = await web3.eth.net.getId();
    const ownershipRegistryInstance = new web3.eth.Contract(
      OwnershipRegistryArtifact.abi,
      OwnershipRegistryArtifact.networks[chainId].address
    );

    return new OwnershipRegistry(ownershipRegistryInstance);
  }
}