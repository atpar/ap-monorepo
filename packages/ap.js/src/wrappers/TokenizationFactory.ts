import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract/types';

import { TransactionObject } from '../types/index';

import Deployments from '@atpar/ap-contracts/deployments.json';
import TokenizationFactoryArtifact from '@atpar/ap-contracts/artifacts/TokenizationFactory.min.json';


export class TokenizationFactory {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance;
  }

  public createERC20Distributor (
    name: string,
    symbol: string,
    initialSupply: BigNumber,
    token: string
  ): TransactionObject { 
    return this.instance.methods.createERC20Distributor(
      name,
      symbol,
      initialSupply.toFixed(),
      token
    );
  };

  public static async instantiate (web3: Web3, customAddress?: string): Promise<TokenizationFactory> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!customAddress && (!Deployments[netId] || !Deployments[netId].TokenizationFactory)) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const instance = new web3.eth.Contract(
      // @ts-ignore
      TokenizationFactoryArtifact.abi,
      // @ts-ignore
      customAddress || Deployments[netId].TokenizationFactory
    );

    return new TokenizationFactory(instance);
  }
}
