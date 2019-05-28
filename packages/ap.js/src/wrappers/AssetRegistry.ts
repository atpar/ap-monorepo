import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';

import { ContractTerms, ContractState, TransactionObject, CallObject, AssetOwnership } from '../types';
import { toHex } from '../utils/Utils';
import { toContractState, fromContractTerms, fromContractState, toContractTerms, toAssetOwnership } from './Conversions';

import AssetRegistryArtifact from '@atpar/ap-contracts/artifacts/AssetRegistry.min.json';


export class AssetRegistry {
  private assetRegistry: Contract;

  private constructor (assetRegistryInstance: Contract) {
    this.assetRegistry = assetRegistryInstance
  }

  public registerAsset (
    assetId: string, 
    ownership: AssetOwnership,
    terms: ContractTerms, 
    state: ContractState, 
    actorAddress: string
  ): TransactionObject {
    return this.assetRegistry.methods.registerAsset(
      toHex(assetId),
      ownership,
      fromContractTerms(terms),
      fromContractState(state),
      actorAddress
    );
  }

  public getTerms = (assetId: string): CallObject<ContractTerms> => ({
    call: async (): Promise<ContractTerms> => {
      const response = await this.assetRegistry.methods.getTerms(toHex(assetId)).call();
      const terms = toContractTerms(response);
      return terms;
    }
  });

  public getState = (assetId: string): CallObject<ContractState> => ({
    call: async (): Promise<ContractState> => {
      const response = await this.assetRegistry.methods.getState(toHex(assetId)).call();
      const contractState = toContractState(response);
      return contractState;
    }
  });

  public getEventId = (assetId: string): CallObject<number> => ({
    call: async (): Promise<number> => {
      const response = await this.assetRegistry.methods.getEventId(toHex(assetId)).call();
      const eventId = Number(response);
      return eventId;
    }
  });

  public setRecordCreatorBeneficiary (assetId: string, newBenficiary: string): TransactionObject { 
    return this.assetRegistry.methods.setRecordCreatorBeneficiary(
      toHex(assetId),
      newBenficiary
    );
  };

  public setCounterpartyBeneficiary (assetId: string, newBenficiary: string): TransactionObject {
    return this.assetRegistry.methods.setCounterpartyBeneficiary(
      toHex(assetId),
      newBenficiary
    );
  };

  public setBeneficiaryForCashflowId (
    assetId: string, 
    cashflowId: number, 
    beneficiaryAddress: string
  ): TransactionObject {
    return this.assetRegistry.methods.setBeneficiaryForCashflowId(
      toHex(assetId),
      cashflowId,
      beneficiaryAddress
    )
  };

  public getOwnership = (assetId: string): CallObject<AssetOwnership> => ({
    call: async (): Promise<AssetOwnership> => {
      const response = await this.assetRegistry.methods.getOwnership(toHex(assetId)).call();
      const ownership = toAssetOwnership(response);
      return ownership;
    }
  });

  public getCashflowBeneficiary = (assetId: string, cashflowId: number): CallObject<string> => ({
    call: async (): Promise<string> => {
      const beneficiary: string = await this.assetRegistry.methods.getCashflowBeneficiary(
        toHex(assetId), cashflowId
      ).call();

      return beneficiary;
    }
  });
  
  public static async instantiate (web3: Web3): Promise<AssetRegistry> {
    const chainId = await web3.eth.net.getId();
    // @ts-ignore
    if (!AssetRegistryArtifact.networks[chainId]) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const assetRegistryInstance = new web3.eth.Contract(
      //@ts-ignore
      AssetRegistryArtifact.abi,
      //@ts-ignore
      AssetRegistryArtifact.networks[chainId].address
    );

    return new AssetRegistry(assetRegistryInstance);
  }
}
