import { AP } from '.';
import { OrderParams, OrderData, isOrderData, isOrderParams } from './types';
import { EMPTY_ENHANCEMENT_PARAMS, ZERO_ADDRESS } from './utils/Constants';


export class Order {

  private ap: AP;
  public orderData: OrderData;

  private constructor (ap: AP, orderData: OrderData) {
    this.ap = ap;
    this.orderData = orderData;
  }

  /**
   * Signs the order either as the creator (creating an unfilled order) or as the counterparty (filling an order).
   * @dev this requires the users signature (metamask pop-up)
   * @returns {Promise<void>}
   */
  public async signOrder (): Promise<void> {
    if (this.orderData.ownership.creatorObligor === this.ap.signer.account) {
      this.orderData.creatorSignature = await this.ap.signer.signOrderAsMaker(this.orderData);
    } else if (this.orderData.ownership.counterpartyObligor === this.ap.signer.account) {
      this.orderData.counterpartySignature = await this.ap.signer.signOrderAsTaker(this.orderData);
    } else if (this.orderData.ownership.counterpartyObligor === ZERO_ADDRESS) {
      this.orderData.ownership.counterpartyObligor = this.ap.signer.account;
      this.orderData.ownership.counterpartyBeneficiary = this.ap.signer.account;
      this.orderData.counterpartySignature = await this.ap.signer.signOrderAsTaker(this.orderData);
    } else {
      throw(new Error(
        'Addresses of obligors do not match current account.'
      ));
    }
  }
  
  /**
   * Issues a new asset if the order is filled.
   */
  public async issueAssetFromOrder (): Promise<void> {
    if (!this.orderData.creatorSignature || !this.orderData.counterpartySignature) {
      throw(new Error('Can not issue asset from unfilled order. Signature is missing.'));
    }

    await this.ap.contracts.assetIssuer.methods.issueFromOrder(this.orderData).send({ from: this.ap.signer.account, gas: 5000000 });
  }

  /**
   * Serializes the order as orderData which can be deserialized again via load().
   * @returns {OrderData}
   */
  public serializeOrder (): OrderData {
    return this.orderData;
  }
  
  /**
   * Instantiates a new Order instance with the provided orderData.
   * @param {AP} ap AP instance
   * @param {OrderData} orderData
   * @returns {Promise<Order>}
   */
  public static async load (ap: AP, orderData: OrderData): Promise<Order> {
    if (!isOrderData(orderData)) { 
      throw(new Error('Malformed orderData provided.')); 
    }

    if (!(ap.signer.validateSignatures(orderData))) {
      throw(new Error('Signatures are invalid.'));
    }

    return new Order(ap, orderData);
  }

  /**
   * Creates a new Order instance from the provided orderParams.
   * @param {AP} ap AP instance
   * @param {OrderParams} orderParams 
   * @returns {Order}
   */
  public static create (ap: AP, orderParams: OrderParams): Order {
    if (!isOrderParams(orderParams)) {
      throw new Error('Malformed orderParams provided.');
    }

    const enhancementOrder_1 = (orderParams.enhancement_1) ? {
      termsHash: orderParams.enhancement_1.termsHash,
      templateId: orderParams.enhancement_1.templateId,
      customTerms: orderParams.enhancement_1.customTerms,
      ownership: orderParams.enhancement_1.ownership,
      engine: orderParams.enhancement_1.engine,
      admin: orderParams.enhancement_1.admin,
      creatorSignature: ap.utils.constants.ZERO_BYTES,
      counterpartySignature: ap.utils.constants.ZERO_BYTES,
      salt: Math.floor(Math.random() * 1000000)
    } : EMPTY_ENHANCEMENT_PARAMS;

    const enhancementOrder_2 = (orderParams.enhancement_2) ? {
      termsHash: orderParams.enhancement_2.termsHash,
      templateId: orderParams.enhancement_2.templateId,
      customTerms: orderParams.enhancement_2.customTerms,
      ownership: orderParams.enhancement_2.ownership,
      engine: orderParams.enhancement_2.engine,
      admin: orderParams.enhancement_2.admin,
      creatorSignature: ap.utils.constants.ZERO_BYTES,
      counterpartySignature: ap.utils.constants.ZERO_BYTES,
      salt: Math.floor(Math.random() * 1000000)
    } : EMPTY_ENHANCEMENT_PARAMS;

    const orderData: OrderData = {
      termsHash: orderParams.termsHash,
      templateId: orderParams.templateId,
      customTerms: orderParams.customTerms,
      ownership: orderParams.ownership,
      expirationDate: orderParams.expirationDate,
      engine: orderParams.engine,
      admin: orderParams.admin,
      enhancementOrder_1,
      enhancementOrder_2,
      creatorSignature: ap.utils.constants.ZERO_BYTES,
      counterpartySignature: ap.utils.constants.ZERO_BYTES,
      salt: Math.floor(Math.random() * 1000000)
    }

    return new Order(ap, orderData);
  }
}
