import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import { SendOptions } from 'web3-eth-contract/types';

import { PaymentRegistry } from "../wrappers/PaymentRegistry";
import { PaymentRouter } from "../wrappers/PaymentRouter";
import { Signer } from '../utils/Signer';
import { PaidEvent } from '../types';


export class PaymentAPI {

  // @ts-ignore
  private registry: PaymentRegistry;
  // @ts-ignore
  private router: PaymentRouter;
  // @ts-ignore
  private signer: Signer;
  
  private constructor (registry: PaymentRegistry, router: PaymentRouter, signer: Signer) {
    this.registry = registry;
    this.router = router;
    this.signer = signer;
  }

  /**
   * settles a payment identified by assetId, cashfowId and eventId and 
   * routes it to the beneficiary
   * @dev this requires the users signature (metamask pop-up)
   * @param {string} assetId 
   * @param {number} cashflowId 
   * @param {number} eventId 
   * @param {string} tokenAddress 
   * @param {BigNumber} amount
   * @param {SendOptions} txOptions
   * @return {Promise<void>}
   */
  public async settlePayment (
    assetId: string,
    cashflowId: number,
    eventId: number,
    tokenAddress: string,
    amount: BigNumber,
    txOptions: SendOptions
  ): Promise<void> {
    return this.router.settlePayment(
      assetId, 
      cashflowId, 
      eventId, 
      tokenAddress, 
      amount, 
      { ...txOptions, from: this.signer.account }
    );
  }

  /**
   * return the paid off amount for a given event
   * @param {string} assetId 
   * @param {number} eventId
   * @returns {Promise<BigNumber>}
   */
  public async getPayoffBalance (assetId: string, eventId: number): Promise<BigNumber> {
    return this.registry.getPayoffBalance(assetId, eventId);
  }

  /**
   * returns the amount settled from a given event to a given event for the record creator
   * to return the total amount settled fromEventId would be 1 and toEventId would be the last eventId
   * @param {string} assetId 
   * @param {number} fromEventId 
   * @param {number} toEventId 
   * @returns {Promise<BigNumber>}
   */
  public async getSettledAmountForRecordCreator (
    assetId: string, 
    fromEventId: number, 
    toEventId: number
  ): Promise<BigNumber> {
    let amountSettled = new BigNumber(0);
    for (let i = 0; i <= toEventId; i++) {
      const eventId = fromEventId + i;
      const { cashflowId,  payoffBalance } = await this.registry.getPayoff(assetId, eventId)
      if (Number(cashflowId) < 0) { amountSettled = amountSettled.plus(payoffBalance); }
    }
    return amountSettled;
  }

  /**
   * returns the amount settled from a given event to a given event for the counterparty
   * to return the total amount settled fromEventId would be 1 and toEventId would be the last eventId
   * @param {string} assetId 
   * @param {number} fromEventId 
   * @param {number} toEventId 
   * @returns {Promise<BigNumber>}
   */
  public async getSettledAmountForCounterparty (
    assetId: string, 
    fromEventId: number, 
    toEventId: number
  ): Promise<BigNumber> {
    let amountSettled = new BigNumber(0);
    for (let i = 0; i <= toEventId; i++) {
      const eventId = fromEventId + i;
      const { cashflowId,  payoffBalance } = await this.registry.getPayoff(assetId, eventId)
      if (Number(cashflowId) > 0) { amountSettled = amountSettled.plus(payoffBalance); }
    }
    return amountSettled;
  }

  /**
   * calls the provided callback function when a payment for an asset is made
   * @param {(event: PaidEvent) => void} cb callback function 
   */
  public onPayment (cb: (event: PaidEvent) => void): void {
    this.registry.onPaidEvent(cb);
  }

  /**
   * returns a new instance of the PaymentAPI class
   * @param {Web3} web3 web3 instance
   * @returns {Promise<PaymentAPI>}
   */
  public static async init (web3: Web3, signer: Signer): Promise<PaymentAPI> {
    const registry = await PaymentRegistry.instantiate(web3);
    const router = await PaymentRouter.instantiate(web3);

    return new PaymentAPI(registry, router, signer);
  }
}
