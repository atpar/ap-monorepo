import Web3 from 'web3';
import { Contract, SendOptions } from 'web3-eth-contract/types';
import BigNumber from 'bignumber.js';

import ClaimsTokenArtifact from '@atpar/ap-contracts/build/contracts/ClaimsTokenETHExtension.json';
import { numberToHex } from '../utils/Utils';


export class ClaimsToken {

  private claimsToken: Contract;

  private constructor (claimsTokenInstance: Contract) {
    this.claimsToken = claimsTokenInstance;
  }

  public async availableFunds (
    claimsTokenAddress: string,
    tokenHolderAddress: string
  ): Promise<BigNumber> {
    const claimsTokenInstance = this.claimsToken.clone();
    claimsTokenInstance.options.address = claimsTokenAddress;

    const response = await claimsTokenInstance.methods.availableFunds(tokenHolderAddress).call();

    return new BigNumber(response);
  }

  public async withdrawFunds (
    claimsTokenAddress: string,
    txOptions: SendOptions
  ): Promise<void> {
    const claimsTokenInstance = this.claimsToken.clone();
    claimsTokenInstance.options.address = claimsTokenAddress;

    await claimsTokenInstance.methods.withdrawFunds().send(txOptions);
  }

  public async totalSupply (
    claimsTokenAddress: string
  ): Promise<BigNumber> {
    const claimsTokenInstance = this.claimsToken.clone();
    claimsTokenInstance.options.address = claimsTokenAddress;

    const response = await claimsTokenInstance.methods.totalSupply().call();

    return new BigNumber(response);
  }

  public async balanceOf (
    claimsTokenAddress: string,
    tokenHolderAddress: string
  ): Promise<BigNumber> {
    const claimsTokenInstance = this.claimsToken.clone();
    claimsTokenInstance.options.address = claimsTokenAddress;

    const response = await claimsTokenInstance.methods.balanceOf(tokenHolderAddress).call();

    return new BigNumber(response);
  }

  public async transfer (
    claimsTokenAddress: string,
    toAddress: string,
    value: BigNumber,
    txOptions: SendOptions
  ): Promise<void> {
    const claimsTokenInstance = this.claimsToken.clone();
    claimsTokenInstance.options.address = claimsTokenAddress;

    await claimsTokenInstance.methods.transfer(
      toAddress,
      numberToHex(value)
    ).send(txOptions);
  }

  public async deploy (ownerAddress: string, txOptions: SendOptions): Promise<string> {
    const claimsTokenInstance = this.claimsToken.clone();

    await claimsTokenInstance.deploy(
      { data: ClaimsTokenArtifact.bytecode, arguments: [ownerAddress] }
    ).send(txOptions);

    return claimsTokenInstance.options.address;
  }
    
  public static async instantiate (web3: Web3): Promise<ClaimsToken> {
    const claimsTokenInstance = new web3.eth.Contract(
      // @ts-ignore
      ClaimsTokenArtifact.abi,
    );

    return new ClaimsToken(claimsTokenInstance);
  }
}