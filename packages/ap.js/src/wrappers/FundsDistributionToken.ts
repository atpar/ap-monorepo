import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';
import BigNumber from 'bignumber.js';

import { TransactionObject, CallObject } from '../types';
import { numberToHex } from '../utils/Utils';

import FundsDistributionTokenArtifact from '@atpar/ap-contracts/artifacts/FundsDistributionToken.min.json';


export class FundsDistributionToken {

  private fundsDistributionToken: Contract;

  private constructor (fundsDistributionTokenInstance: Contract) {
    this.fundsDistributionToken = fundsDistributionTokenInstance;
  }

  public withdrawableFundsOf = (
    claimsTokenAddress: string, 
    tokenHolderAddress: string
  ): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const fundsDistributionTokenInstance = this.fundsDistributionToken.clone();
      fundsDistributionTokenInstance.options.address = claimsTokenAddress;

      const response = await fundsDistributionTokenInstance.methods.withdrawableFundsOf(tokenHolderAddress).call();

      return new BigNumber(response);
    }
  });

  public withdrawFunds (claimsTokenAddress: string): TransactionObject {
    const fundsDistributionTokenInstance = this.fundsDistributionToken.clone();
    fundsDistributionTokenInstance.options.address = claimsTokenAddress;

    return fundsDistributionTokenInstance.methods.withdrawFunds();
  }

  public totalSupply = (claimsTokenAddress: string): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const fundsDistributionTokenInstance = this.fundsDistributionToken.clone();
      fundsDistributionTokenInstance.options.address = claimsTokenAddress;

      const response = await fundsDistributionTokenInstance.methods.totalSupply().call();

      return new BigNumber(response);
    }
  });

  public balanceOf = (
    claimsTokenAddress: string, 
    tokenHolderAddress: string
  ): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const fundsDistributionTokenInstance = this.fundsDistributionToken.clone();
      fundsDistributionTokenInstance.options.address = claimsTokenAddress;

      const response = await fundsDistributionTokenInstance.methods.balanceOf(tokenHolderAddress).call();

      return new BigNumber(response);
    }
  });

  public transfer (
    claimsTokenAddress: string, 
    toAddress: string, 
    value: BigNumber
  ): TransactionObject {
    const fundsDistributionTokenInstance = this.fundsDistributionToken.clone();
    fundsDistributionTokenInstance.options.address = claimsTokenAddress;

    return fundsDistributionTokenInstance.methods.transfer(
      toAddress,
      numberToHex(value)
    );
  }

  public static async instantiate (web3: Web3): Promise<FundsDistributionToken> {
    const fundsDistributionTokenInstance = new web3.eth.Contract(
      // @ts-ignore
      FundsDistributionTokenArtifact.abi,
    );

    return new FundsDistributionToken(fundsDistributionTokenInstance);
  }
}
