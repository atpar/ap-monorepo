import Web3 from 'web3';
import { Contract } from 'web3-eth-contract/types';
import BigNumber from 'bignumber.js';

import { TransactionObject, CallObject } from '../types';
import { numberToHex } from '../utils/Utils';

import ClaimsTokenArtifact from '@atpar/ap-contracts/artifacts/ClaimsToken.min.json';


export class ClaimsToken {

  private claimsToken: Contract;

  private constructor (claimsTokenInstance: Contract) {
    this.claimsToken = claimsTokenInstance;
  }

  public availableFunds = (
    claimsTokenAddress: string, 
    tokenHolderAddress: string
  ): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const claimsTokenInstance = this.claimsToken.clone();
      claimsTokenInstance.options.address = claimsTokenAddress;

      const response = await claimsTokenInstance.methods.availableFunds(tokenHolderAddress).call();

      return new BigNumber(response);
    }
  });

  public withdrawFunds (claimsTokenAddress: string): TransactionObject {
    const claimsTokenInstance = this.claimsToken.clone();
    claimsTokenInstance.options.address = claimsTokenAddress;

    return claimsTokenInstance.methods.withdrawFunds();
  }

  public totalSupply = (claimsTokenAddress: string): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const claimsTokenInstance = this.claimsToken.clone();
      claimsTokenInstance.options.address = claimsTokenAddress;

      const response = await claimsTokenInstance.methods.totalSupply().call();

      return new BigNumber(response);
    }
  });

  public balanceOf = (
    claimsTokenAddress: string, 
    tokenHolderAddress: string
  ): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const claimsTokenInstance = this.claimsToken.clone();
      claimsTokenInstance.options.address = claimsTokenAddress;

      const response = await claimsTokenInstance.methods.balanceOf(tokenHolderAddress).call();

      return new BigNumber(response);
    }
  });

  public transfer (
    claimsTokenAddress: string, 
    toAddress: string, 
    value: BigNumber
  ): TransactionObject {
    const claimsTokenInstance = this.claimsToken.clone();
    claimsTokenInstance.options.address = claimsTokenAddress;

    return claimsTokenInstance.methods.transfer(
      toAddress,
      numberToHex(value)
    );
  }

  public static async instantiate (web3: Web3): Promise<ClaimsToken> {
    const claimsTokenInstance = new web3.eth.Contract(
      // @ts-ignore
      ClaimsTokenArtifact.abi,
    );

    return new ClaimsToken(claimsTokenInstance);
  }
}
