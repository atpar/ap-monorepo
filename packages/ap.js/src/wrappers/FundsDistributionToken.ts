import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';
import BigNumber from 'bignumber.js';

import { TransactionObject, CallObject } from '../types';
import { numberToHex } from '../utils/Utils';

import FundsDistributionTokenArtifact from '@atpar/ap-contracts/artifacts/FundsDistributionToken.min.json';


export class FundsDistributionToken {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance;
  }

  public withdrawableFundsOf = (
    claimsTokenAddress: string, 
    tokenHolderAddress: string
  ): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const instance = this.instance.clone();
      instance.options.address = claimsTokenAddress;

      const response = await instance.methods.withdrawableFundsOf(tokenHolderAddress).call();

      return new BigNumber(response);
    }
  });

  public withdrawFunds (claimsTokenAddress: string): TransactionObject {
    const instance = this.instance.clone();
    instance.options.address = claimsTokenAddress;

    return instance.methods.withdrawFunds();
  }

  public totalSupply = (claimsTokenAddress: string): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const instance = this.instance.clone();
      instance.options.address = claimsTokenAddress;

      const response = await instance.methods.totalSupply().call();

      return new BigNumber(response);
    }
  });

  public balanceOf = (
    claimsTokenAddress: string, 
    tokenHolderAddress: string
  ): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const instance = this.instance.clone();
      instance.options.address = claimsTokenAddress;

      const response = await instance.methods.balanceOf(tokenHolderAddress).call();

      return new BigNumber(response);
    }
  });

  public transfer (
    claimsTokenAddress: string, 
    toAddress: string, 
    value: BigNumber
  ): TransactionObject {
    const instance = this.instance.clone();
    instance.options.address = claimsTokenAddress;

    return instance.methods.transfer(
      toAddress,
      numberToHex(value)
    );
  }

  public static async instantiate (web3: Web3): Promise<FundsDistributionToken> {
    const instance = new web3.eth.Contract(
      // @ts-ignore
      FundsDistributionTokenArtifact.abi,
    );

    return new FundsDistributionToken(instance);
  }
}
