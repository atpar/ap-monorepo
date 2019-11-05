import BigNumber from 'bignumber.js';

import { TransactionObject } from '../types';
import { ContractsAPI } from './ContractsAPI';


export class TokenizationAPI {

  private contracts: ContractsAPI;

  public constructor (contracts: ContractsAPI) {
    this.contracts = contracts;
  }

  public getWithdrawableFunds (
    claimsTokenAddress: string,
    tokenHolderAddress: string
  ): Promise<BigNumber> {
    return this.contracts.fundsDistributionToken.withdrawableFundsOf(
      claimsTokenAddress, 
      tokenHolderAddress
    ).call(); 
  };

  public withdrawFunds (claimsTokenAddress: string): TransactionObject {
    return this.contracts.fundsDistributionToken.withdrawFunds(claimsTokenAddress); // gas: 100000
  }

  public getTotalTokenSupply (claimsTokenAddress: string): Promise<BigNumber> {
    return this.contracts.fundsDistributionToken.totalSupply(claimsTokenAddress).call(); 
  };

  public getTokenBalance (
    claimsTokenAddress: string, 
    tokenHolderAddress: string
  ): Promise<BigNumber> {
    return this.contracts.fundsDistributionToken.balanceOf(
      claimsTokenAddress, 
      tokenHolderAddress
    ).call();
  }

  public transferTokens (
    claimsTokenAddress: string,
    toAddress: string,
    value: BigNumber
  ): TransactionObject {
    return this.contracts.fundsDistributionToken.transfer(
      claimsTokenAddress, 
      toAddress, 
      value
    ); // gas: 100000
  }

  public updateFundsReceived (claimsTokenAddress: string): TransactionObject {
    return this.contracts.fundsDistributionTokenERC20Extension.updateFundsReceived(
      claimsTokenAddress
    );
  }

  /**
   * deploys a new FDT contract for funds in ERC20 tokens
   * @param {string} name name of the FDT
   * @param {string} symbol ticker symbol of the FDT
   * @param {BigNumber} initialSupply initial FD-Token supply
   * @param {string} fundsToken address of token to be distributed
   * @returns {DeployTransactionResponse} address of FDT contract
   */
  public createERC20Distributor (
    name: string, 
    symbol: string, 
    initialSupply: BigNumber, 
    fundsToken: string
  ): TransactionObject {
    return this.contracts.tokenizationFactory.createERC20Distributor(
      name, 
      symbol, 
      initialSupply, 
      fundsToken
    ); // gas: 2000000
  }
}
