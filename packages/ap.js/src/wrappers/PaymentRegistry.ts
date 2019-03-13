import Web3 from 'web3';

import { Contract } from 'web3-eth-contract/types';
import { toHex } from '../utils/Utils';

const PaymentRegistryArtifact: any = require('../../../ap-contracts/build/contracts/PaymentRegistry.json');

export class PaymentRegistry {
  private paymentRegistry: Contract;

  private constructor (PaymentRegistryInstance: Contract) {
    this.paymentRegistry = PaymentRegistryInstance
  }

  public async getPayoffBalance (contractId: string, eventId: number): Promise<number> {
    const payoffBalance: number = await this.paymentRegistry.methods.getPayoffBalance(
      toHex(contractId),
      eventId
    ).call();

    return payoffBalance;
  }

  public async getPayoff (
    contractId: string, 
    eventId: number
  ): Promise<{cashflowId: string, tokenAddress: string, payoffBalance: number}> {
    const { 
      0: cashflowId, 
      1: tokenAddress, 
      2: payoffBalance 
    } : { 
      0: string, 
      1: string, 
      2: number 
    } = await this.paymentRegistry.methods.getPayoff(toHex(contractId), eventId).call();

    return { cashflowId, tokenAddress, payoffBalance }
  }


  public static async instantiate (web3: Web3): Promise<PaymentRegistry> {
    const chainId = await web3.eth.net.getId();
    const PaymentRegistryInstance = new web3.eth.Contract(
      PaymentRegistryArtifact.abi,
      PaymentRegistryArtifact.networks[chainId].address
    );

    return new PaymentRegistry(PaymentRegistryInstance);
  }
}