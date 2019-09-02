import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { Contract } from 'web3-eth-contract/types';
import { EventLog } from 'web3-core/types';

import { toHex } from '../utils/Utils';
import { toPaidEvent } from './Conversions';
import { PaidEvent, CallObject } from '../types';

import Deployments from '@atpar/ap-contracts/deployments.json';
import PaymentRegistryArtifact from '@atpar/ap-contracts/artifacts/PaymentRegistry.min.json';


export class PaymentRegistry {
  public instance: Contract;

  private constructor (instance: Contract) {
    this.instance = instance
  }

  public getPayoffBalance = (assetId: string, eventId: number): CallObject<BigNumber> => ({
    call: async (): Promise<BigNumber> => {
      const payoffBalanceAsString: string = await this.instance.methods.getPayoffBalance(
        toHex(assetId),
        eventId
      ).call();

      return new BigNumber(payoffBalanceAsString);
    }
  });

  public getPayoff = (
    assetId: string, 
    eventId: number
  ): CallObject<{cashflowId: string; tokenAddress: string; payoffBalance: BigNumber}> => ({
    call: async(): Promise<{cashflowId: string; tokenAddress: string; payoffBalance: BigNumber}> => {
      const { 
        0: cashflowId, 
        1: tokenAddress, 
        2: payoffBalanceAsString
      }: { 
        0: string; 
        1: string; 
        2: string; 
      } = await this.instance.methods.getPayoff(toHex(assetId), eventId).call();

      const payoffBalance = new BigNumber(payoffBalanceAsString)

      return { cashflowId, tokenAddress, payoffBalance}
    }
  });

  public onPaidEvent (cb: (event: PaidEvent) => void): void {
    this.instance.events.Paid().on('data', (event: EventLog): void => {
      const paidEvent = toPaidEvent(event);
      cb(paidEvent);
    });
  }

  public static async instantiate (web3: Web3): Promise<PaymentRegistry> {
    const netId = await web3.eth.net.getId();
    // @ts-ignore
    if (!Deployments[netId] || !Deployments[netId].PaymentRegistry) { 
      throw(new Error('INITIALIZATION_ERROR: Contract not deployed on Network!'));
    }
    const instance = new web3.eth.Contract(
      // @ts-ignore
      PaymentRegistryArtifact.abi,
      // @ts-ignore
      Deployments[netId].PaymentRegistry
    );

    return new PaymentRegistry(instance);
  }
}
