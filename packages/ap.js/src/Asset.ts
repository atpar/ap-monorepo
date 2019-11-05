import { BigNumber } from 'bignumber.js';

import { ContractTerms, AssetOwnership, ContractState, EvaluatedEventSchedule } from './types';
import { AP } from './index';
import { sha3 } from './utils/Utils';


/**
 * class which provides methods for managing an ACTUS asset 
 * exposes methods for ownership management, settlement of payoffs and 
 * economic lifecycle management for an ACTUS asset
 */
export class Asset {
  
  private ap: AP;
  public assetId: string;

  private constructor (
    ap: AP,
    assetId: string
  ) {
    this.ap = ap;
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
   * returns the address of the ACTUS engine used for the asset
   * @returns {Promise<string>}
   */
  public async getEngineAddress (): Promise<string> {
    return this.ap.economics.getEngineAddress(this.assetId);
  }

  /**
   * returns the last EventId of the asset
   * @returns {Promise<number>}
   */
  public async getEventId (): Promise<number> {
    return this.ap.economics.getEventId(this.assetId);
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
    const terms = await this.getTerms();
    const engineAddress = await this.getEngineAddress();

    return await this.ap.economics.engine(
      terms.contractType, 
      engineAddress
    ).computeEvaluatedInitialSchedule(terms);
  }

  /**
   * returns the pending schedule derived from the terms and the current state of the asset
   * (contains all events between the last state and the specified timestamp)
   * @param {number} timestamp current timestamp
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getPendingSchedule (timestamp: number): Promise<EvaluatedEventSchedule> {
    const terms = await this.getTerms();
    const state = await this.getState();
    const engineAddress = await this.getEngineAddress();

    return await this.ap.economics.engine(
      terms.contractType, 
      engineAddress
    ).computeEvaluatedPendingSchedule(
      terms,
      state,
      timestamp
    );
  }

  /**
   * returns the total amount paid off to date (sum of all processed events + paid off pendings events)
   * @param {number} timestamp current timestamp
   * @returns {Promise<BigNumber>}
   */
  public async getTotalPaidOff (timestamp: number): Promise<BigNumber> {
    const { recordCreatorObligor, counterpartyObligor } = await this.getOwnership();
    const numberOfPendingEvents: number = (await this.getPendingSchedule(timestamp)).length;
    const lastEventId = await this.getEventId();

    if (this.ap.signer.account === recordCreatorObligor) {
      const amountSettled = await this.ap.payment.getSettledAmountForRecordCreator(
        this.assetId, 
        0, 
        lastEventId + numberOfPendingEvents
      );
      return amountSettled;
    } else if (this.ap.signer.account === counterpartyObligor) {
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
    const { recordCreatorObligor, counterpartyObligor } = await this.getOwnership();
    const numberOfPendingEvents: number = (await this.getPendingSchedule(timestamp)).length;
    const lastEventId = await this.getEventId();
    const engineAddress = await this.getEngineAddress();

    if (this.ap.signer.account === recordCreatorObligor) {
      const amountSettled = await this.ap.payment.getSettledAmountForRecordCreator(
        this.assetId, 
        lastEventId + 1, 
        lastEventId + numberOfPendingEvents
      );

      const terms = await this.getTerms();
      const state = await this.getState();

      const amountDue = await this.ap.economics.engine(
        terms.contractType, 
        engineAddress
      ).computeDuePayoffForRecordCreator(
        terms, 
        state, 
        timestamp
      );
      return amountDue.minus(amountSettled)
    } else if (this.ap.signer.account === counterpartyObligor) {
      const amountSettled = await this.ap.payment.getSettledAmountForCounterparty(
        this.assetId, 
        lastEventId + 1, 
        lastEventId + numberOfPendingEvents
      );

      const terms = await this.getTerms();
      const state = await this.getState();

      const amountDue = await this.ap.economics.engine(
        terms.contractType,
        engineAddress
      ).computeDuePayoffForCounterparty(
        terms, 
        state, 
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
    const { recordCreatorObligor, counterpartyObligor } = await this.getOwnership();
    const pendingSchedule = await this.getPendingSchedule(timestamp);
    const lastEventId = await this.getEventId();

    for (let i = 0; i < pendingSchedule.length; i++) {
      const payoff = pendingSchedule[i].event.payoff;
      
      // skip counterparty payoffs
      if (this.ap.signer.account === recordCreatorObligor && payoff.isGreaterThan(0)) {
        continue;
      }

      // skip record creator payoffs
      if (this.ap.signer.account === counterpartyObligor && payoff.isLessThan(0)) {
        continue;
      }

      const eventId = lastEventId + i + 1;
      const settledPayoff = await this.ap.payment.getPayoffBalance(this.assetId, eventId);
      const duePayoff = payoff.abs();
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
   * @param  {BigNumber} value amount to settle
   * @returns {Promise<void>}
   */
  public async settleNextObligation (timestamp: number, amount: BigNumber): Promise<void> {
    const { recordCreatorObligor, counterpartyObligor } = await this.getOwnership();
    const pendingSchedule = await this.getPendingSchedule(timestamp);
    const lastEventId = await this.getEventId();

    for (let i = 0; i < pendingSchedule.length; i++) {
      const payoff = pendingSchedule[i].event.payoff;

      // skip counterparty payoffs
      if (this.ap.signer.account === recordCreatorObligor && payoff.isGreaterThan(0)) {
        continue;
      }

      // skip record creator payoffs
      if (this.ap.signer.account === counterpartyObligor && payoff.isLessThan(0)) {
        continue;
      }

      const eventId = lastEventId + i + 1;
      const settledPayoff = await this.ap.payment.getPayoffBalance(this.assetId, eventId);
      const duePayoff = payoff.abs();
      const outstanding = duePayoff.minus(settledPayoff);

      if (outstanding.isGreaterThan(0)) { 
        const tokenAddress = pendingSchedule[i].event.currency;
        const cashflowId = (pendingSchedule[i].event.payoff.isGreaterThan(0))? 
          (Number(pendingSchedule[i].event.eventType) + 1) : -(Number(pendingSchedule[i].event.eventType) + 1);

        await this.ap.payment.settlePayment(
          this.assetId, 
          cashflowId, 
          eventId, 
          tokenAddress, 
          amount,
        ).send({ from: this.ap.signer.account, gas: 150000 });
        break; 
      }
    }
  }

  /**
   * derives obligations by computing the next state of the asset and 
   * stores the new state if all obligation where fulfilled
   * @return {Promise<void>}
   */
  public async progress (): Promise<void> {
    await this.ap.lifecycle.progress(this.assetId).send(
      { from: this.ap.signer.account, gas: 750000 }
    );
  }

  /**
   * tokenizes beneficiary 
   * depending on if the default account is the record creator or counterparty beneficiary
   * @dev deploys new FundsDistributionToken contract and 
   * sets contract address as the beneficiary in the OwnershipRegistry
   * @todo implement for cashflow beneficiaries
   * @param {string} name name of the FDT
   * @param {string} symbol symbol of the FDT
   * @param {SendOptions} txOptions 
   * @returns {Promise<string>} address of deployed FDT contract
   */
  public async tokenizeBeneficiary (name: string, symbol: string, initialSupply: BigNumber): Promise<string> {
    const { recordCreatorBeneficiary, counterpartyBeneficiary } = await this.getOwnership();
    
    if (![recordCreatorBeneficiary, counterpartyBeneficiary].includes(this.ap.signer.account)) {
      throw(new Error('EXECUTION_ERROR: The default account needs to be a beneficiary!'));
    }

    const { currency } = await this.getTerms();

    if (currency === '0x0000000000000000000000000000000000000000') { 
      throw new Error('EXECUTION_ERROR: Invalid address for currency attribute');
    }
    
    const tx = await this.ap.tokenization.createERC20Distributor(name, symbol, initialSupply, currency).send(
      { from: this.ap.signer.account, gas: 2000000}
    );
    const address = tx.events.DeployedDistributor.returnValues.distributor;

    if (this.ap.signer.account === recordCreatorBeneficiary) {
      await this.ap.ownership.setRecordCreatorBeneficiary(this.assetId, address).send(
        { from: this.ap.signer.account, gas: 100000 }
      );
    } else if (this.ap.signer.account === counterpartyBeneficiary) {
      await this.ap.ownership.setCounterpartyBeneficiary(this.assetId, address).send(
        { from: this.ap.signer.account, gas: 100000 }
      );
    }

    return address;
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
      ownership.recordCreatorObligor, 
      ownership.counterpartyObligor, 
      String(Math.floor(Math.random() * 1000000))
    );

    const engineAddress = ap.contracts.engineContract(terms.contractType).instance.options.address;

    await ap.lifecycle.initialize(assetId, ownership, terms, engineAddress).send(
      { from: ap.signer.account, gas: 6000000 }
    );

    return new Asset(ap, assetId);
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

    if (statusDate == 0) { throw('NOT_FOUND_ERROR: No contract found for given AssetId!'); }
      
    return new Asset(ap, assetId);
  }
}
