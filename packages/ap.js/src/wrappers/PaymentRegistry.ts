import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { toHex } from '../utils/Utils';
import { toPaidEvent } from './Conversions';
import { PaidEvent } from '../types';


// const PaymentRegistryArtifact: any = require('../../../ap-contracts/build/contracts/PaymentRegistry.json');
import PaymentRegistryArtifact from '../../../ap-contracts/build/contracts/PaymentRegistry.json';


export class PaymentRegistry {
  private paymentRegistry: Contract;

  private constructor (PaymentRegistryInstance: Contract) {
    this.paymentRegistry = PaymentRegistryInstance
  }

  public async getPayoffBalance (assetId: string, eventId: number): Promise<BigNumber> {
    const payoffBalanceAsString: string = await this.paymentRegistry.methods.getPayoffBalance(
      toHex(assetId),
      eventId
    ).call();

    return new BigNumber(payoffBalanceAsString);
  }

  public async getPayoff (
    assetId: string, 
    eventId: number
  ): Promise<{cashflowId: string, tokenAddress: string, payoffBalance: BigNumber}> {
    const { 
      0: cashflowId, 
      1: tokenAddress, 
      2: payoffBalanceAsString
    } : { 
      0: string, 
      1: string, 
      2: string 
    } = await this.paymentRegistry.methods.getPayoff(toHex(assetId), eventId).call();

    const payoffBalance = new BigNumber(payoffBalanceAsString)

    return { cashflowId, tokenAddress, payoffBalance}
  }

  public onPaidEvent (cb: (event: PaidEvent) => void): void {
    this.paymentRegistry.events.Paid().on('data', (event: EventLog) => {
      const paidEvent = toPaidEvent(event);
      cb(paidEvent);
    });
  }

  public static async instantiate (web3: Web3): Promise<PaymentRegistry> {
    const chainId = await web3.eth.net.getId();
    // @ts-ignore
    if (!PaymentRegistryArtifact.networks[chainId]) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const PaymentRegistryInstance = new web3.eth.Contract(
      // @ts-ignore
      PaymentRegistryArtifact.abi,
      // @ts-ignore
      PaymentRegistryArtifact.networks[chainId].address
    );

    return new PaymentRegistry(PaymentRegistryInstance);
  }
}