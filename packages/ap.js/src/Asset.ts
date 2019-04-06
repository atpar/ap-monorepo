import { BigNumber } from 'bignumber.js';
import { SendOptions } from 'web3-eth-contract/types';

import { ContractTerms, ContractType, AssetOwnership, ContractState, EvaluatedEventSchedule } from './types';
import { ContractEngine, PAM } from './engines';
import { AP } from './index';
import { sha3 } from './utils/Utils';


/**
 * class which provides methods for managing an ACTUS asset 
 * exposes methods for ownership management, settlement of payoffs and 
 * economic lifecycle management for an ACTUS asset
 */
export class Asset {
  
  private ap: AP;
  private contractEngine: ContractEngine;
  
  public assetId: string;

  private constructor (
    ap: AP,
    contractEngine: ContractEngine,
    assetId: string
  ) {
    this.ap = ap;
    this.contractEngine = contractEngine;

    this.assetId = assetId;
  }

  /**
   * return the terms of the asset
   * @returns {Promise<ContractTerms>}
   */
  public async getTerms (): Promise<ContractTerms> { 
    return this.ap.economics.getTerms(this.assetId); 
  }

  /**
   * returns the current state of the asset
   * @returns {Promise<ContractState>}
   */
  public async getState (): Promise<ContractState> { 
    return this.ap.economics.getState(this.assetId); 
  }

  /**
   * returns the current ownership of the asset
   * @returns {Promise<AssetOwnership>}
   */
  public async getOwnership (): Promise<AssetOwnership> {
    return this.ap.ownership.getOwnership(this.assetId);
  }
 
  /**
   * returns the schedule derived from the terms of the asset
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getExpectedSchedule (): Promise<EvaluatedEventSchedule> {
    return await this.contractEngine.computeEvaluatedInitialSchedule(await this.getTerms());
  }

  /**
   * returns the pending schedule derived from the terms and the current state of the asset
   * (contains all events between the last state and the specified timestamp)
   * @param {number} timestamp current timestamp
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getPendingSchedule (timestamp: number): Promise<EvaluatedEventSchedule> {
    return await this.contractEngine.computeEvaluatedPendingSchedule(
      await this.getTerms(),
      await this.getState(),
      timestamp
    );
  }

  /**
   * returns the total amount paid off to date (sum of all processed events + paid off pendings events)
   * @param {number} timestamp current timestamp
   * @returns {Promise<BigNumber>}
   */
  public async getTotalPaidOff (timestamp: number): Promise<BigNumber> {
    const { recordCreatorObligorAddress, counterpartyObligorAddress } = await this.getOwnership();
    const numberOfPendingEvents: number = (await this.getPendingSchedule(timestamp)).length;
    const lastEventId = await this.ap.economics.getEventId(this.assetId);

    if (this.ap.signer.account === recordCreatorObligorAddress) {
      const amountSettled = await this.ap.payment.getSettledAmountForRecordCreator(
        this.assetId, 
        0, 
        lastEventId + numberOfPendingEvents
      );
      return amountSettled;
    } else if (this.ap.signer.account === counterpartyObligorAddress) {
      const amountSettled = await this.ap.payment.getSettledAmountForCounterparty(
        this.assetId, 
        0, 
        lastEventId + numberOfPendingEvents
      );
      return amountSettled;
    }

    return new BigNumber(0);
  }

  /**
   * returns the amount due to date
   * absolute value of the sum of only positive or only negative payoffs of all pending events 
   * (depending on the accounts role)
   * @param {number} timestamp current timestamp
   * @returns {Promise<BigNumber>}
   */
  public async getAmountOutstanding (timestamp: number): Promise<BigNumber> {
    const { recordCreatorObligorAddress, counterpartyObligorAddress } = await this.getOwnership();
    const numberOfPendingEvents: number = (await this.getPendingSchedule(timestamp)).length;
    const lastEventId = await this.ap.economics.getEventId(this.assetId);

    if (this.ap.signer.account === recordCreatorObligorAddress) {
      const amountSettled = await this.ap.payment.getSettledAmountForRecordCreator(
        this.assetId, 
        lastEventId + 1, 
        lastEventId + numberOfPendingEvents
      );
      const amountDue = await this.contractEngine.computeDuePayoffForRecordCreator(
        await this.getTerms(), 
        await this.getState(), 
        timestamp
      );
      return amountDue.minus(amountSettled)
    } else if (this.ap.signer.account === counterpartyObligorAddress) {
      const amountSettled = await this.ap.payment.getSettledAmountForCounterparty(
        this.assetId, 
        lastEventId + 1, 
        lastEventId + numberOfPendingEvents
      );
      const amountDue = await this.contractEngine.computeDuePayoffForCounterparty(
        await this.getTerms(), 
        await this.getState(), 
        timestamp
      );
      return amountDue.minus(amountSettled)
    }

    return new BigNumber(0);
  }

  /**
   * returns the amount outstanding for the next payment oligation of a pending event
   * (depending on the accounts role)
   * @param {number} timestamp current timestamp
   * @returns {Promise<BigNumber>}
   */
  public async getAmountOutstandingForNextObligation (timestamp: number): Promise<BigNumber> {
    const pendingSchedule = await this.getPendingSchedule(timestamp);
    const lastEventId = await this.ap.economics.getEventId(this.assetId);

    for (let i = 0; i < pendingSchedule.length; i++) {
      const eventId = lastEventId + i + 1;
      const settledPayoff = await this.ap.payment.getPayoffBalance(this.assetId, eventId);
      const duePayoff = pendingSchedule[i].event.payoff.abs();
      const outstanding = duePayoff.minus(settledPayoff);

      if (outstanding.isGreaterThan(0)) { return outstanding; }
    }

    return new BigNumber(0);
  }

  /**
   * settles the next payment obligation of a pending event (depending on the accounts role)
   * can be paid partially (has to be specified in the value field in txOptions)
   * @dev this requires the users signature (metamask pop-up)
   * @param {number} timestamp current timestamp
   * @param {SendOptions} txOptions web3 transaction options
   * @returns {Promise<void>}
   */
  public async settleNextObligation (timestamp: number, txOptions: SendOptions): Promise<void> {
    const pendingSchedule = await this.getPendingSchedule(timestamp);
    const lastEventId = await this.ap.economics.getEventId(this.assetId);

    for (let i = 0; i < pendingSchedule.length; i++) {
      const eventId = lastEventId + i + 1;
      const settledPayoff = await this.ap.payment.getPayoffBalance(this.assetId, eventId);
      const duePayoff = pendingSchedule[i].event.payoff.abs();
      const outstanding = duePayoff.minus(settledPayoff);

      if (outstanding.isGreaterThan(0)) { 
        const cashflowId = (pendingSchedule[i].event.payoff.isGreaterThan(0))? 
          (Number(pendingSchedule[i].event.eventType) + 1) : -(Number(pendingSchedule[i].event.eventType) + 1);
        const tokenAddress = '0x0000000000000000000000000000000000000000'; // pendingSchedule[i].event.currency
        await this.ap.payment.settlePayment(
          this.assetId, 
          cashflowId, 
          eventId, 
          tokenAddress, 
          outstanding,
          txOptions
        );
        break; 
      }
    }
  }

  /**
   * derives obligations by computing the next state of the asset and 
   * stores the new state if all obligation where fulfilled
   * @param {number} timestamp
   * @param {SendOptions} txOptions web3 transaction options
   * @return {Promise<void>}
   */
  public async progress (timestamp: number, txOptions: SendOptions): Promise<void> {
    await this.ap.lifecycle.progress(this.assetId, timestamp, txOptions);
  }


  /**
   * calls the provided callback function when the state of the asset is updated
   * @param {cb: () => void} cb callback function
   */
  public onProgress (cb: () => void): void {
    this.ap.lifecycle.registerAssetListener(this.assetId, () => {
      cb();
    });
  }

  /**
   * registers the terms, the initial state and the ownership of an asset 
   * and returns a new Asset instance.
   * computes the initial state of the asset,
   * stores it together with the terms of the EconomicsRegistry,
   * stores the ownership of the asset in the OwnershipRegistry and sends it
   * @param {AP} ap AP instance
   * @param {ContractTerms} terms terms of the asset
   * @param {AssetOwnership} ownership ownership of the asset
   * @returns {Promise<Asset>}
   */
  public static async create (
    ap: AP,
    terms: ContractTerms,
    ownership: AssetOwnership
  ): Promise<Asset> {
    const assetId = sha3(
      ownership.recordCreatorObligorAddress, 
      ownership.counterpartyObligorAddress, 
      String(Math.floor(Math.random() * 1000000))
    );

    let contractEngine;
    switch (terms.contractType) {
      case ContractType.PAM:
        contractEngine = await PAM.init(ap.web3);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const initialContractState = await contractEngine.computeInitialState(terms);

    await ap.ownership.registerOwnership(assetId, ownership);
    await ap.economics.registerEconomics(
      assetId, 
      terms, 
      initialContractState,
      ap.lifecycle.getActorAddress()
    );

    return new Asset(ap, contractEngine, assetId);
  }

  /**
   * loads an already registered asset and returns a new Asset instance from a provided AssetId
   * @param {AP} ap AP instance
   * @param {string} assetId 
   * @returns {Promise<Asset>}
   */
  public static async load (
    ap: AP,
    assetId: string
  ): Promise<Asset> {
    // @ts-ignore
    const { contractType, statusDate } = await ap.economics.getTerms(assetId);

    if (statusDate == 0) { throw('NOT_FOUND_ERROR: no contract found for given AssetId!'); }

    let contractEngine;
    // switch (contractType) {
    //   case ContractType.PAM:
    //     contractEngine = await PAM.init(ap.web3);
    //     break;
    //   default:
    //     throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    // }
    contractEngine = await PAM.init(ap.web3);
      
    
    
    return new Asset(ap, contractEngine, assetId);
  }
}
