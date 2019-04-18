import Web3 from 'web3';
import { DeployTransactionResponse } from 'web3-eth-contract/types';
import BigNumber from 'bignumber.js';

import { ClaimsToken } from '../wrappers/ClaimsToken';
import { Signer } from '../utils/Signer';
import { TransactionObject } from '../types';


export class TokenizationAPI {

  private token: ClaimsToken;
  private signer: Signer;

  private constructor (token: ClaimsToken, signer: Signer) {
    this.token = token;
    this.signer = signer;
  }

  public getAvailableFunds (
    claimsTokenAddress: string,
    tokenHolderAddress?: string
  ): Promise<BigNumber> {
    return this.token.availableFunds(
      claimsTokenAddress, 
      (tokenHolderAddress) ? tokenHolderAddress : this.signer.account
    ).call(); 
  };

  public withdrawFunds (claimsTokenAddress: string): TransactionObject {
    return this.token.withdrawFunds(claimsTokenAddress); // gas: 100000
  }

  public getTotalTokenSupply (claimsTokenAddress: string): Promise<BigNumber> {
    return this.token.totalSupply(claimsTokenAddress).call(); 
  };

  public getTokenBalance (
    claimsTokenAddress: string, 
    tokenHolderAddress?: string
  ): Promise<BigNumber> {
    return this.token.balanceOf(
      claimsTokenAddress, 
      (tokenHolderAddress) ? tokenHolderAddress : this.signer.account
    ).call();
  }

  public transferTokens (
    claimsTokenAddress: string,
    toAddress: string,
    value: BigNumber
  ): TransactionObject {
    return this.token.transfer(claimsTokenAddress, toAddress, value); // gas: 100000
  }

  /**
   * deploys a new ClaimsToken contract
   * @returns {DeployTransactionResponse} address of ClaimsToken contract
   */
  public deployTokenContract (): DeployTransactionResponse {
    return this.token.deploy(this.signer.account) // gas: 2000000
  }

  /**
   * return a new instance of the TokenizationAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<TokenizationAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<TokenizationAPI> {
    const token = await ClaimsToken.instantiate(web3);
    return new TokenizationAPI(token, signer);
  }
}
  
