import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';

import { ContractTerms, ContractState, TransactionObject, CallObject, AssetOwnership } from '../types';
import { toHex } from '../utils/Utils';
import { toContractState, fromContractTerms, fromContractState, toContractTerms, toAssetOwnership } from './Conversions';

import Deployments from '@atpar/ap-contracts/deployments.json';
import AssetRegistryArtifact from '@atpar/ap-contracts/artifacts/AssetRegistry.min.json';


export class AssetRegistry {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance
  }

  public registerAsset (
    assetId: string, 
    ownership: AssetOwnership,
    terms: ContractTerms, 
    state: ContractState, 
    actorAddress: string
  ): TransactionObject {
    return this.instance.methods.registerAsset(
      toHex(assetId),
      ownership,
      fromContractTerms(terms),
      fromContractState(state),
      actorAddress
    );
  }

  public getTerms = (assetId: string): CallObject<ContractTerms> => ({
    call: async (): Promise<ContractTerms> => {
      const response = await this.instance.methods.getTerms(toHex(assetId)).call();
      const terms = toContractTerms(response);
      return terms;
    }
  });

  public getState = (assetId: string): CallObject<ContractState> => ({
    call: async (): Promise<ContractState> => {
      const response = await this.instance.methods.getState(toHex(assetId)).call();
      const contractState = toContractState(response);
      return contractState;
    }
  });

  public getEventId = (assetId: string): CallObject<number> => ({
    call: async (): Promise<number> => {
      const response = await this.instance.methods.getEventId(toHex(assetId)).call();
      const eventId = Number(response);
      return eventId;
    }
  });

  public setRecordCreatorBeneficiary (assetId: string, newBenficiary: string): TransactionObject { 
    return this.instance.methods.setRecordCreatorBeneficiary(
      toHex(assetId),
      newBenficiary
    );
  };

  public setCounterpartyBeneficiary (assetId: string, newBenficiary: string): TransactionObject {
    return this.instance.methods.setCounterpartyBeneficiary(
      toHex(assetId),
      newBenficiary
    );
  };

  public setBeneficiaryForCashflowId (
    assetId: string, 
    cashflowId: number, 
    beneficiaryAddress: string
  ): TransactionObject {
    return this.instance.methods.setBeneficiaryForCashflowId(
      toHex(assetId),
      cashflowId,
      beneficiaryAddress
    )
  };

  public getOwnership = (assetId: string): CallObject<AssetOwnership> => ({
    call: async (): Promise<AssetOwnership> => {
      const response = await this.instance.methods.getOwnership(toHex(assetId)).call();
      const ownership = toAssetOwnership(response);
      return ownership;
    }
  });

  public getCashflowBeneficiary = (assetId: string, cashflowId: number): CallObject<string> => ({
    call: async (): Promise<string> => {
      const beneficiary: string = await this.instance.methods.getCashflowBeneficiary(
        toHex(assetId), cashflowId
      ).call();

      return beneficiary;
    }
  });
  
  public static async instantiate (web3: Web3): Promise<AssetRegistry> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!Deployments[netId] || !Deployments[netId].AssetRegistry) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const instance = new web3.eth.Contract(
      //@ts-ignore
      AssetRegistryArtifact.abi,
      //@ts-ignore
      Deployments[netId].AssetRegistry
    );

    return new AssetRegistry(instance);
  }
}
