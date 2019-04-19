import BigNumber from 'bignumber.js';

import { PaidEvent, TransactionObject } from '../types';
import { ContractsAPI } from './ContractsAPI';


export class PaymentAPI {

  private contracts: ContractsAPI;
  
  public constructor (contracts: ContractsAPI) {
    this. contracts = contracts;
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
   * @return {TransactionObject}
   */
  public settlePayment (
    assetId: string,
    cashflowId: number,
    eventId: number,
    tokenAddress: string,
    amount: BigNumber
  ): TransactionObject {
    return this.contracts.paymentRouter.settlePayment(
      assetId, 
      cashflowId, 
      eventId, 
      tokenAddress, 
      amount
    );
  }

  /**
   * return the paid off amount for a given event
   * @param {string} assetId 
   * @param {number} eventId
   * @returns {Promise<BigNumber>}
   */
  public getPayoffBalance (assetId: string, eventId: number): Promise<BigNumber> {
    return this.contracts.paymentRegistry.getPayoffBalance(assetId, eventId).call();
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
      const { 
        cashflowId, 
        payoffBalance 
      } = await this.contracts.paymentRegistry.getPayoff(assetId, eventId).call();

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
      const { 
        cashflowId, 
        payoffBalance 
      } = await this.contracts.paymentRegistry.getPayoff(assetId, eventId).call();
      
      if (Number(cashflowId) > 0) { amountSettled = amountSettled.plus(payoffBalance); }
    }
    return amountSettled;
  }

  /**
   * calls the provided callback function when a payment for an asset is made
   * @param {(event: PaidEvent) => void} cb callback function 
   */
  public onPayment (cb: (event: PaidEvent) => void): void {
    this.contracts.paymentRegistry.onPaidEvent(cb);
  }
}
