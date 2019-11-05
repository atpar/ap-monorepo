import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract/types';

import { toHex, numberToHex } from '../utils/Utils';
import { TransactionObject } from '../types';

import Deployments from '@atpar/ap-contracts/deployments.json';
import PaymentRouterArtifact from '@atpar/ap-contracts/artifacts/PaymentRouter.min.json';


export class PaymentRouter {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance
  }

  public settlePayment (
    assetId: string, 
    cashflowId: number,
    eventId: string,
    tokenAddress: string,
    amount: BigNumber
  ): TransactionObject {
    return this.instance.methods.settlePayment(
      toHex(assetId),
      cashflowId,
      eventId,
      tokenAddress,
      numberToHex(amount)
    );  
  }

  public static async instantiate (web3: Web3, customAddress?: string): Promise<PaymentRouter> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!customAddress && (!Deployments[netId] || !Deployments[netId].PaymentRouter)) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const instance = new web3.eth.Contract(
      // @ts-ignore
      PaymentRouterArtifact.abi,
      // @ts-ignore
      customAddress || Deployments[netId].PaymentRouter
    );

    return new PaymentRouter(instance);
  }
}
