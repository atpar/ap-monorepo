import BigNumber from 'bignumber.js';
import { DeployTransactionResponse } from 'web3-eth-contract/types';

import { Signer } from '../utils/Signer';
import { TransactionObject } from '../types';
import { ContractsAPI } from './ContractsAPI';


export class TokenizationAPI {

  private contracts: ContractsAPI;
  private signer: Signer;

  public constructor (contracts: ContractsAPI, signer: Signer) {
    this.contracts = contracts;
    this.signer = signer;
  }

  public getAvailableFunds (
    claimsTokenAddress: string,
    tokenHolderAddress?: string
  ): Promise<BigNumber> {
    return this.contracts.claimsToken.availableFunds(
      claimsTokenAddress, 
      (tokenHolderAddress) ? tokenHolderAddress : this.signer.account
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
    tokenHolderAddress?: string
  ): Promise<BigNumber> {
    return this.contracts.claimsToken.balanceOf(
      claimsTokenAddress, 
      (tokenHolderAddress) ? tokenHolderAddress : this.signer.account
    ).call();
  }

  public transferTokens (
    claimsTokenAddress: string,
    toAddress: string,
    value: BigNumber
  ): TransactionObject {
    return this.contracts.claimsToken.transfer(claimsTokenAddress, toAddress, value); // gas: 100000
  }

  /**
   * deploys a new ClaimsToken contract
   * @returns {DeployTransactionResponse} address of ClaimsToken contract
   */
  public deployTokenContract (): DeployTransactionResponse {
    return this.contracts.claimsToken.deploy(this.signer.account) // gas: 2000000
  }
}
