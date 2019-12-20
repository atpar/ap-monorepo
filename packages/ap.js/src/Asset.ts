import { 
  AssetOwnership,
  NON_CYLIC_SCHEDULE_ID,
  IP_SCHEDULE_ID,
  SC_SCHEDULE_ID,
  PR_SCHEDULE_ID,
  RR_SCHEDULE_ID,
  PY_SCHEDULE_ID 
} from './types';

import { AP } from './index';

import BN from 'bn.js';


/**
 * Class which provides methods for managing an ACTUS asset.
 * Exposes methods for ownership management (incl. tokenization), settlement of payoffs and 
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
   * Returns the terms of the asset.
   * @returns {Promise<Terms>}
   */
  public async getTerms () {
    return this.ap.contracts.assetRegistry.methods.getTerms(this.assetId).call();
  }

  /**
   * Eeturns the current state of the asset.
   * @returns {Promise<State>}
   */
  public async getState () {
    return this.ap.contracts.assetRegistry.methods.getState(this.assetId).call();
  }

  /**
   * Returns the finalized state of the asset.
   * @returns {Promise<State>}
   */
  public async getFinalizedState () {
    return this.ap.contracts.assetRegistry.methods.getFinalizedState(this.assetId).call();
  }

  /**
   * Returns the address of the actor which is allowed to update the state of the asset.
   * @returns {Promise<string>}
   */
  public async getActorAddress (): Promise<string> {
    return this.ap.contracts.assetRegistry.methods.getActorAddress(this.assetId).call();
  }

  /**
   * Returns the address of the ACTUS engine used for the asset.
   * @returns {Promise<string>}
   */
  public async getEngineAddress (): Promise<string> {
    return this.ap.contracts.assetRegistry.methods.getEngineAddress(this.assetId).call();
  }

  /**
   * returns the current ownership of the asset
   * @returns {Promise<AssetOwnership>}
   */
  public async getOwnership (): Promise<AssetOwnership> {
    return this.ap.contracts.assetRegistry.methods.getOwnership(this.assetId).call();
  }

  /**
   * Return the id of the template which this asset is based on.
   * @returns {Promise<string>}
   */
  public async getTemplateId (): Promise<string> {
    return this.ap.contracts.assetRegistry.methods.getTemplateId(this.assetId).call();
  }
 
  /**
   * Returns the schedule derived from the terms of the asset.
   * @returns {Promise<string[]>}
   */
  public async getSchedule (): Promise<string[]> {
    const templateId = await this.getTemplateId();
    const anchorDate = (await this.ap.contracts.assetRegistry.methods.getAnchorDate(this.assetId).call()).toString();
    const schedule = [];

    // try to use convenience method first
    try {
      const events = [];
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(templateId, NON_CYLIC_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(templateId, IP_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(templateId, PR_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(templateId, SC_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(templateId, RR_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.templateRegistry.methods.getSchedule(templateId, PY_SCHEDULE_ID).call()));
      schedule.push(...events);
    } catch (error) {
      const nonCyclicScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        templateId, NON_CYLIC_SCHEDULE_ID
      ).call()
      const ipScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        templateId, IP_SCHEDULE_ID
      ).call();
      const prScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        templateId, PR_SCHEDULE_ID
      ).call();
      const scScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        templateId,
        SC_SCHEDULE_ID
      ).call();
      const rrScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        templateId, RR_SCHEDULE_ID
      ).call();
      const pyScheduleLength = await this.ap.contracts.templateRegistry.methods.getScheduleLength(
        templateId, PY_SCHEDULE_ID
      ).call();
  
      for (let i = 0; i < Number(nonCyclicScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(templateId, NON_CYLIC_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(ipScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(templateId, IP_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(prScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(templateId, PR_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(scScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(templateId, SC_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(rrScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(templateId, RR_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(pyScheduleLength); i++) {
        schedule.push(await this.ap.contracts.templateRegistry.methods.getEventAtIndex(templateId, PY_SCHEDULE_ID, i).call());
      }
    }

    return this.ap.utils.schedule.applyAnchorDateToSchedule(
      this.ap.utils.schedule.sortEvents(this.ap.utils.schedule.removeNullEvents(schedule)),
      anchorDate
    );
  }

  /**
   * Returns the next event to be processed of the asset
   * @returns {Promise<string>} Promise yielding the next event
   */
  public async getNextEvent (): Promise<string> {
    return await this.ap.contracts.assetRegistry.methods.getNextEvent(this.assetId).call();
  }

  /**
   * Returns payment information for the next event
   * @returns {Promise<{amount: string; token: string; payer: string; payee: string}>} Promise yielding payment info.
   */
  public async getNextPayment (): Promise<{amount: string; token: string; payer: string; payee: string}> {
    const terms = await this.getTerms();
    const state = await this.getState();
    const ownership = await this.getOwnership();
    const engine = await this.getEngineAddress();
    const event = await this.getNextEvent();

    const payoff = await this.ap.contracts.engine(engine).methods.computePayoffForEvent(
      // @ts-ignore
      terms,
      state,
      event,
      this.ap.utils.constants.ZERO_BYTES32
    ).call();

    const payoffAsBN = new BN(payoff);

    return {
      amount: payoffAsBN.abs().toString(),
      token: terms.currency,
      payer: (payoffAsBN.isNeg()) ? ownership.creatorObligor : ownership.counterpartyObligor,
      payee: (payoffAsBN.isNeg()) ? ownership.counterpartyBeneficiary : ownership.creatorBeneficiary
    };
  }

  /**
   * Derives obligations by computing the next state of the asset and
   * stores the new state if all obligation where fulfilled.
   * @return {Promise<any>}
   */
  public async progress (): Promise<any> {
    return await this.ap.contracts.assetActor.methods.progress(this.assetId).send(
      { from: this.ap.signer.account, gas: 750000 }
    );
  }

  /**
   * Sets sufficient allowance for the AssetActor to transfer the next payment on the users behalf
   * @return {Promise<any>}
   */
  public async approveNextPayment (): Promise<any> {
    const actor = await this.getActorAddress();
    const payment = await this.getNextPayment();

    if (payment.payer !== this.ap.signer.account) { return; }

    const erc20 = this.ap.contracts.erc20(payment.token);
    return await erc20.methods.approve(actor, payment.amount).send({ from: this.ap.signer.account });
  }

  /**
   * Tokenizes a beneficiary depending on if the default account is the creator or the counterparty beneficiary.
   * @dev deploys new FundsDistributionToken contract and 
   * sets contract address as the beneficiary in the OwnershipRegistry
   * @todo implement for cashflow beneficiaries
   * @param {string} name name of the FDT
   * @param {string} symbol symbol of the FDT
   * @param {string} initialSupply initial supply of FDTs
   * @returns {Promise<string>} address of deployed FDT contract
   */
  public async tokenizeBeneficiary (name: string, symbol: string, initialSupply: string): Promise<string> {
    const { creatorBeneficiary, counterpartyBeneficiary } = await this.getOwnership();
    
    if (![creatorBeneficiary, counterpartyBeneficiary].includes(this.ap.signer.account)) {
      throw(new Error('EXECUTION_ERROR: The default account needs to be a beneficiary!'));
    }
    
    const { currency } = await this.getTerms();

    const tx = await this.ap.contracts.tokenizationFactory.methods.createERC20Distributor(name, symbol, initialSupply, currency).send(
      { from: this.ap.signer.account, gas: 2000000}
    );

    const address = tx.events.DeployedDistributor.returnValues.distributor;

    if (this.ap.signer.account === creatorBeneficiary) {
      await this.ap.contracts.assetRegistry.methods.setCreatorBeneficiary(this.assetId, address).send(
        { from: this.ap.signer.account, gas: 100000 }
      );
    } else if (this.ap.signer.account === counterpartyBeneficiary) {
      await this.ap.contracts.assetRegistry.methods.setCounterpartyBeneficiary(this.assetId, address).send(
        { from: this.ap.signer.account, gas: 100000 }
      );
    }

    return address;
  }

  /**
   * Loads an already registered asset and returns a new Asset instance from a provided AssetId.
   * @param {AP} ap AP instance
   * @param {string} assetId id of the asset to instantiate
   * @returns {Promise<Asset>} Promise yielding an instance of Asset
   */
  public static async load (
    ap: AP,
    assetId: string
  ): Promise<Asset> {
    return new Asset(ap, assetId);
  }
}
