import Web3 from 'web3';

import { Contract } from 'web3-eth-contract/types';
import { toHex } from '../utils/Utils';
import { AssetOwnership, TransactionObject, CallObject } from '../types';

import OwnershipRegistryArtifact from '@atpar/ap-contracts/build/contracts/OwnershipRegistry.json';


export class OwnershipRegistry {
  private ownershipRegistry: Contract;

  private constructor (ownershipRegistryInstance: Contract) {
    this.ownershipRegistry = ownershipRegistryInstance
  }

  public registerOwnership (
    assetId: string,
    recordCreatorObligorAddress: string,
    recordCreatorBeneficiaryAddress: string,
    counterpartyObligorAddress: string,
    counterpartyBeneficiaryAddress: string
  ): TransactionObject {
    return this.ownershipRegistry.methods.registerOwnership(
      toHex(assetId), 
      recordCreatorObligorAddress,
      recordCreatorBeneficiaryAddress,
      counterpartyObligorAddress,
      counterpartyBeneficiaryAddress
    );
  };

  public setRecordCreatorBeneficiary (assetId: string, newBenficiary: string): TransactionObject { 
    return this.ownershipRegistry.methods.setRecordCreatorBeneficiary(
      toHex(assetId),
      newBenficiary
    );
  };

  public setCounterpartyBeneficiary (assetId: string, newBenficiary: string): TransactionObject {
    return this.ownershipRegistry.methods.setCounterpartyBeneficiary(
      toHex(assetId),
      newBenficiary
    );
  };

  public setBeneficiaryForCashflowId (
    assetId: string, 
    cashflowId: number, 
    beneficiaryAddress: string
  ): TransactionObject {
    return this.ownershipRegistry.methods.setBeneficiaryForCashflowId(
      toHex(assetId),
      cashflowId,
      beneficiaryAddress
    )
  };

  public getOwnership = (assetId: string): CallObject<AssetOwnership> => ({
    call: async (): Promise<AssetOwnership> => {
      const { 
        0: recordCreatorObligorAddress, 
        1: recordCreatorBeneficiaryAddress, 
        2: counterpartyObligorAddress, 
        3: counterpartyBeneficiaryAddress 
      }: { 
        0: string; 
        1: string; 
        2: string; 
        3: string; 
      } = await this.ownershipRegistry.methods.getOwnership(toHex(assetId)).call();

      return { 
        recordCreatorObligorAddress, 
        recordCreatorBeneficiaryAddress, 
        counterpartyObligorAddress, 
        counterpartyBeneficiaryAddress 
      };
    }
  });

  public getCashflowBeneficiary = (assetId: string, cashflowId: number): CallObject<string> => ({
    call: async (): Promise<string> => {
      const beneficiary: string = await this.ownershipRegistry.methods.getCashflowBeneficiary(
        toHex(assetId), cashflowId
      ).call();

      return beneficiary;
    }
  });

  public static async instantiate (web3: Web3): Promise<OwnershipRegistry> {
    const chainId = await web3.eth.net.getId();
    // @ts-ignore
    if (!OwnershipRegistryArtifact.networks[chainId]) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const ownershipRegistryInstance = new web3.eth.Contract(
      // @ts-ignore
      OwnershipRegistryArtifact.abi,
      // @ts-ignore
      OwnershipRegistryArtifact.networks[chainId].address
    );

    return new OwnershipRegistry(ownershipRegistryInstance);
  }
}