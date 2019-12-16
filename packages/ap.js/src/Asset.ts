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
   * @returns {Promise<Terms>}
   */
  public async getTerms () { 
    return this.ap.contracts.assetRegistry.methods.getTerms(this.assetId).call(); 
  }

  /**
   * returns the current state of the asset
   * @returns {Promise<State>}
   */
  public async getState () { 
    return this.ap.contracts.assetRegistry.methods.getState(this.assetId).call(); 
  }

  /**
   * returns the finalized state of the asset
   * @returns {Promise<Staete>}
   */
  public async getFinalizedState () { 
    return this.ap.contracts.assetRegistry.methods.getFinalizedState(this.assetId).call(); 
  }

  /**
   * returns the address of the actor which is allowed to update the state of the asset
   * @returns {Promise<string>}
   */
  public async getActorAddress (): Promise<string> {
    return this.ap.contracts.assetRegistry.methods.getActorAddress(this.assetId).call();
  }

  /**
   * returns the address of the ACTUS engine used for the asset
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
   * return the id of the product which this asset is based on
   * @returns {Promise<string>}
   */
  public async getProductId (): Promise<string> {
    return this.ap.contracts.assetRegistry.methods.getProductId(this.assetId).call();
  }
 
  /**
   * returns the schedule derived from the terms of the asset
   * @returns {Promise<string[]>}
   */
  public async getSchedule (): Promise<string[]> {
    const productId = await this.getProductId();
    const anchorDate = (await this.ap.contracts.assetRegistry.methods.getAnchorDate(this.assetId).call()).toString();
    const schedule = [];

    // try to use convenience method first
    try {
      const events = [];
      events.push(...(await this.ap.contracts.productRegistry.methods.getSchedule(productId, NON_CYLIC_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.productRegistry.methods.getSchedule(productId, IP_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.productRegistry.methods.getSchedule(productId, PR_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.productRegistry.methods.getSchedule(productId, SC_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.productRegistry.methods.getSchedule(productId, RR_SCHEDULE_ID).call()));
      events.push(...(await this.ap.contracts.productRegistry.methods.getSchedule(productId, PY_SCHEDULE_ID).call()));
      schedule.push(...events);
    } catch (error) {
      const nonCyclicScheduleLength = await this.ap.contracts.productRegistry.methods.getScheduleLength(
        productId, NON_CYLIC_SCHEDULE_ID
      ).call()
      const ipScheduleLength = await this.ap.contracts.productRegistry.methods.getScheduleLength(
        productId, IP_SCHEDULE_ID
      ).call();
      const prScheduleLength = await this.ap.contracts.productRegistry.methods.getScheduleLength(
        productId, PR_SCHEDULE_ID
      ).call();
      const scScheduleLength = await this.ap.contracts.productRegistry.methods.getScheduleLength(
        productId,
        SC_SCHEDULE_ID
      ).call();
      const rrScheduleLength = await this.ap.contracts.productRegistry.methods.getScheduleLength(
        productId, RR_SCHEDULE_ID
      ).call();
      const pyScheduleLength = await this.ap.contracts.productRegistry.methods.getScheduleLength(
        productId, PY_SCHEDULE_ID
      ).call();
  
      for (let i = 0; i < Number(nonCyclicScheduleLength); i++) {
        schedule.push(await this.ap.contracts.productRegistry.methods.getEventAtIndex(productId, NON_CYLIC_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(ipScheduleLength); i++) {
        schedule.push(await this.ap.contracts.productRegistry.methods.getEventAtIndex(productId, IP_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(prScheduleLength); i++) {
        schedule.push(await this.ap.contracts.productRegistry.methods.getEventAtIndex(productId, PR_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(scScheduleLength); i++) {
        schedule.push(await this.ap.contracts.productRegistry.methods.getEventAtIndex(productId, SC_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(rrScheduleLength); i++) {
        schedule.push(await this.ap.contracts.productRegistry.methods.getEventAtIndex(productId, RR_SCHEDULE_ID, i).call());
      }
      for (let i = 0; i < Number(pyScheduleLength); i++) {
        schedule.push(await this.ap.contracts.productRegistry.methods.getEventAtIndex(productId, PY_SCHEDULE_ID, i).call());
      }
    }

    return this.ap.utils.schedule.applyAnchorDateToSchedule(
      this.ap.utils.schedule.sortEvents(this.ap.utils.schedule.removeNullEvents(schedule)),
      anchorDate
    );
  }

  public async getNextEvent (): Promise<string> {
    return await this.ap.contracts.assetRegistry.methods.getNextEvent(this.assetId).call();
  }

  public async getNextPayment (): Promise<{ amount: string; token: string; payer: string; payee: string}> {
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
   * derives obligations by computing the next state of the asset and 
   * stores the new state if all obligation where fulfilled
   * @return {Promise<void>}
   */
  public async progress (): Promise<any> {
    return await this.ap.contracts.assetActor.methods.progress(this.assetId).send(
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
   * loads an already registered asset and returns a new Asset instance from a provided AssetId
   * @param {AP} ap AP instance
   * @param {string} assetId 
   * @returns {Promise<Asset>}
   */
  public static async load (
    ap: AP,
    assetId: string
  ): Promise<Asset> {
    return new Asset(ap, assetId);
  }
}
