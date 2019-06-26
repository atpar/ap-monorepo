import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract/types';

import { toHex, numberToHex } from '../utils/Utils';
import { TransactionObject } from '../types';

import Deployments from '@atpar/ap-contracts/deployments.json';
import PaymentRouterArtifact from '@atpar/ap-contracts/artifacts/PaymentRouter.min.json';


export class PaymentRouter {
  private paymentRouter: Contract;

  private constructor (PaymentRouterInstance: Contract) {
    this.paymentRouter = PaymentRouterInstance
  }

  public getAddress (): string {
    return this.paymentRouter.options.address;
  }

  public settlePayment (
    assetId: string, 
    cashflowId: number,
    eventId: number,
    tokenAddress: string,
    amount: BigNumber
  ): TransactionObject {
    return this.paymentRouter.methods.settlePayment(
      toHex(assetId),
      cashflowId,
      eventId,
      tokenAddress,
      numberToHex(amount)
    );  
  }

  public static async instantiate (web3: Web3): Promise<PaymentRouter> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!Deployments[netId] || !Deployments[netId].PaymentRouter) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const PaymentRouterInstance = new web3.eth.Contract(
      // @ts-ignore
      PaymentRouterArtifact.abi,
      // @ts-ignore
      Deployments[netId].PaymentRouter
    );

    return new PaymentRouter(PaymentRouterInstance);
  }
}
