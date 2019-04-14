import Web3 from 'web3';
import BigNumber from 'bignumber.js';

import { Contract, SendOptions } from 'web3-eth-contract/types';
import { toHex } from '../utils/Utils';

import PaymentRouterArtifact from '@atpar/ap-contracts/build/contracts/PaymentRouter.json';


export class PaymentRouter {
  private paymentRouter: Contract;

  private constructor (PaymentRouterInstance: Contract) {
    this.paymentRouter = PaymentRouterInstance
  }

  public async settlePayment (
    assetId: string, 
    cashflowId: number,
    eventId: number,
    tokenAddress: string,
    amount: BigNumber,
    txOptions: SendOptions
  ): Promise<void> {
    await this.paymentRouter.methods.settlePayment(
      toHex(assetId),
      cashflowId,
      eventId,
      tokenAddress,
      toHex(amount)
    ).send({ ...txOptions });  
  }

  public static async instantiate (web3: Web3): Promise<PaymentRouter> {
    const chainId = await web3.eth.net.getId();
    // @ts-ignore
    if (!PaymentRouterArtifact.networks[chainId]) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const PaymentRouterInstance = new web3.eth.Contract(
      // @ts-ignore
      PaymentRouterArtifact.abi,
      // @ts-ignore
      PaymentRouterArtifact.networks[chainId].address
    );

    return new PaymentRouter(PaymentRouterInstance);
  }
}