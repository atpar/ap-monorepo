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

  public updateFundsReceived (claimsTokenAddress: string): TransactionObject {
    return this.contracts.claimsTokenERC20Extension.updateFundsReceived(
      claimsTokenAddress
    );
  }

  /**
   * deploys a new ClaimsToken contract for funds in Ether
   * @param {string} ownerAddress
   * @returns {DeployTransactionResponse} address of ClaimsToken contract
   */
  public deployETHClaimsToken (ownerAddress: string): DeployTransactionResponse {
    return this.contracts.claimsTokenETHExtension.deploy(ownerAddress) // gas: 2000000
  }

  /**
   * deploys a new ClaimsToken contract for funds in ERC20 tokens
   * @param {string} ownerAddress
   * @param {string} fundsToken
   * @returns {DeployTransactionResponse} address of ClaimsToken contract
   */
  public deployERC20ClaimsToken (ownerAddress: string, fundsToken: string): DeployTransactionResponse {
    return this.contracts.claimsTokenERC20Extension.deploy(ownerAddress, fundsToken) // gas: 2000000
  }
}
