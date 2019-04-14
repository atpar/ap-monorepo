import Web3 from 'web3';
import { SendOptions } from 'web3-eth-contract/types';
import BigNumber from 'bignumber.js';

import { ClaimsToken } from '../wrappers/ClaimsToken';
import { Signer } from '../utils/Signer';
import { } from '../types';


export class TokenizationAPI {

  private token: ClaimsToken;
  private signer: Signer;

  private constructor (token: ClaimsToken, signer: Signer) {
    this.token = token;
    this.signer = signer;
  }

  public async getAvailableFunds (
    claimsTokenAddress: string,
    tokenHolderAddress?: string
  ): Promise<BigNumber> {
    return this.token.availableFunds(
      claimsTokenAddress, 
      (tokenHolderAddress) ? tokenHolderAddress : this.signer.account
    );
  }

  public async withdrawFunds (
    claimsTokenAddress: string,
    txOptions?: SendOptions
  ): Promise<void> {
    return this.token.withdrawFunds(
      claimsTokenAddress, 
      { ...txOptions, from: this.signer.account, gas: 100000 }
    );
  }

  public async getTotalTokenSupply (
    claimsTokenAddress: string
  ): Promise<BigNumber> {
    return this.token.totalSupply(claimsTokenAddress);
  }

  public async getTokenBalance (
    claimsTokenAddress: string,
    tokenHolderAddress?: string
  ): Promise<BigNumber> {
    return this.token.balanceOf(
      claimsTokenAddress, 
      (tokenHolderAddress) ? tokenHolderAddress : this.signer.account
    );
  }

  public async transferTokens (
    claimsTokenAddress: string,
    toAddress: string,
    value: BigNumber,
    txOptions?: SendOptions
  ): Promise<void> {
    await this.token.transfer(
      claimsTokenAddress, 
      toAddress, 
      value, 
      { ...txOptions, from: this.signer.account, gas: 100000 }
    );
  }

  /**
   * deploys a new ClaimsToken contract
   * @param {SendOptions} txOptions web3 transaction options
   * @returns {string} address of ClaimsToken contract
   */
  public async deployTokenContract (txOptions?: SendOptions): Promise<string> {
    return await this.token.deploy(
      this.signer.account,
      { ...txOptions, from: this.signer.account, gas: 2000000 }
    );
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
  