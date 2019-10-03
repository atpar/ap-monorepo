import BigNumber from 'bignumber.js';

import { PaidEvent, TransactionObject, EvaluatedEventSchedule } from '../types';
import { ContractsAPI } from './ContractsAPI';
import { computeEventId } from '../utils/Utils';


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
   * @param {string} eventId 
   * @param {string} tokenAddress 
   * @param {BigNumber} amount
   * @return {TransactionObject}
   */
  public settlePayment (
    assetId: string,
    cashflowId: number,
    eventId: string,
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
   * @param {string} eventId
   * @returns {Promise<BigNumber>}
   */
  public getPayoffBalance (assetId: string, eventId: string): Promise<BigNumber> {
    return this.contracts.paymentRegistry.getPayoffBalance(assetId, eventId).call();
  }

  /**
   * returns the amount settled for a given evaluated schedule for the record creator
   * @param {string} assetId 
   * @param {EvaluatedEventSchedule} schedule
   * @returns {Promise<BigNumber>}
   */
  public async getSettledAmountForRecordCreator (
    assetId: string,
    schedule: EvaluatedEventSchedule,
  ): Promise<BigNumber> {
    let amountSettled = new BigNumber(0);

    for (let i = 0; i < schedule.length; i++) {
      const { event } = schedule[i];
      const eventId = computeEventId(event);

      if (event.payoff.isLessThan(0)) {
        const { payoffBalance } = await this.contracts.paymentRegistry.getPayoff(assetId, eventId).call();
        amountSettled = amountSettled.plus(payoffBalance);
      }
    }

    return amountSettled;
  }

  /**
   * returns the amount settled for a given evaluated schedule for the counter party
   * @param {string} assetId 
   * @param {EvaluatedEventSchedule} schedule
   * @returns {Promise<BigNumber>}
   */
  public async getSettledAmountForCounterparty (
    assetId: string,
    schedule: EvaluatedEventSchedule,
  ): Promise<BigNumber> {
    let amountSettled = new BigNumber(0);

    for (let i = 0; i < schedule.length; i++) {
      const { event } = schedule[i];
      const eventId = computeEventId(event);

      if (event.payoff.isGreaterThan(0)) { 
        const { payoffBalance } = await this.contracts.paymentRegistry.getPayoff(assetId, eventId).call();
        amountSettled = amountSettled.plus(payoffBalance);  
      }
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
