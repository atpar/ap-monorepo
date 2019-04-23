import BigNumber from 'bignumber.js';
import { DeployTransactionResponse } from 'web3-eth-contract/types';

import { TransactionObject } from '../types';
import { ContractsAPI } from './ContractsAPI';


export class TokenizationAPI {

  private contracts: ContractsAPI;

  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
  }

  public getAvailableFunds (
    claimsTokenAddress: string,
    tokenHolderAddress: string
  ): Promise<BigNumber> {
    return this.contracts.claimsToken.availableFunds(
      claimsTokenAddress, 
      tokenHolderAddress
    ).call(); 
  };

  public withdrawFunds (claimsTokenAddress: string): TransactionObject {
    return this.contracts.claimsToken.withdrawFunds(claimsTokenAddress); // gas: 100000
  }

  public getTotalTokenSupply (claimsTokenAddress: string): Promise<BigNumber> {
    return this.contracts.claimsToken.totalSupply(claimsTokenAddress).call(); 
  };

  public getTokenBalance (
    claimsTokenAddress: string, 
    tokenHolderAddress: string
  ): Promise<BigNumber> {
    return this.contracts.claimsToken.balanceOf(
      claimsTokenAddress, 
      tokenHolderAddress
    ).call();
  }

  public transferTokens (
    claimsTokenAddress: string,
    toAddress: string,
    value: BigNumber
  ): TransactionObject {
    return this.contracts.claimsToken.transfer(
      claimsTokenAddress, 
      toAddress, 
      value
    ); // gas: 100000
  }

  /**
   * deploys a new ClaimsToken contract
   * @param {string} ownerAddress
   * @returns {DeployTransactionResponse} address of ClaimsToken contract
   */
  public deployTokenContract (ownerAddress: string): DeployTransactionResponse {
    return this.contracts.claimsToken.deploy(ownerAddress) // gas: 2000000
  }
}
