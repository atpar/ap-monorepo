import { AP } from "../";
import { OrderParams, OrderData, isOrderData } from "../types";


export class Order {

  private ap: AP;
  public orderData: OrderData;

  private constructor (ap: AP, orderData: OrderData) {
    this.ap = ap;
    this.orderData = orderData;
  }

  /**
   * signs the order either as the maker (creating an unfilled order) or as the taker (filling an order)
   * @dev this requires the users signature (metamask pop-up)
   * @returns {Promise<void>}
   */
  public async signOrder (): Promise<void> {
    if (this.orderData.ownership.creatorObligor === this.ap.signer.account) {
      this.orderData.creatorSignature = await this.ap.signer.signOrderAsMaker(this.orderData);
    } else if (this.orderData.ownership.counterpartyObligor === this.ap.signer.account) {
      this.orderData.counterpartySignature = await this.ap.signer.signOrderAsTaker(this.orderData);
    } else if (this.orderData.ownership.counterpartyObligor === null) {
      this.orderData.ownership.counterpartyObligor = this.ap.signer.account;
      this.orderData.ownership.counterpartyBeneficiary = this.ap.signer.account;
      this.orderData.counterpartySignature = await this.ap.signer.signOrderAsTaker(this.orderData);
    } else {
      throw(new Error(
        'EXECUTION_ERROR: Addresses of obligors do not match current account'
      ));
    }
  }
  
  /**
   * issues a new asset if the order is filled.
   */
  public async issueAssetFromOrder (): Promise<void> {
    if (!this.orderData.creatorSignature || !this.orderData.counterpartySignature) {
      throw(new Error('EXECUTION_ERROR: Can not issue asset from unfilled order. Signature is missing!'));
    }

    await this.ap.contracts.assetIssuer.methods.issueFromOrder(this.orderData).send({ from: this.ap.signer.account, gas: 5000000 });
  }

  /**
   * serializes the order as orderData which can be deserialized again via load()
   * @returns {OrderData}
   */
  public serializeOrder (): OrderData {
    return this.orderData;
  }
  
  /**
   * instantiates a new Order instance with the provided orderData
   * @param {AP} ap AP instance
   * @param {OrderData} orderData
   * @returns {Promise<Order>}
   */
  public static async load (ap: AP, orderData: OrderData): Promise<Order> {
    if (!isOrderData(orderData)) { 
      throw(new Error('EXECUTION_ERROR: Invalid OrderData!')); 
    }

    if (! (await ap.signer.validateSignatures(orderData))) {
      throw(new Error('EXECUTION_ERROR: Signatures are invalid.'));
    }

    return new Order(ap, orderData);
  }

  /**
   * creates a new Order instance from the provided orderParams
   * @param {AP} ap AP instance
   * @param {OrderParams} orderParams 
   * @returns {Order}
   */
  public static create (ap: AP, orderParams: OrderParams): Order {
    const orderData: OrderData = {
      termsHash: orderParams.termsHash,
      productId: orderParams.productId,
      customTerms: orderParams.customTerms,
      ownership: orderParams.ownership,
      expirationDate: orderParams.expirationDate,
      engine: orderParams.engine,
      actor: ap.contracts.assetActor.options.address,
      enhancementOrder_1: {
        termsHash: orderParams.enhancement_1.termsHash,
        productId: orderParams.enhancement_1.productId,
        customTerms: orderParams.enhancement_1.customTerms,
        ownership: orderParams.enhancement_1.ownership,
        engine: orderParams.enhancement_1.engine,
        creatorSignature: ap.utils.ZERO_BYTES,
        counterpartySignature: ap.utils.ZERO_BYTES,
        salt: Math.floor(Math.random() * 1000000)

      },
      enhancementOrder_2: {
        termsHash: orderParams.enhancement_2.termsHash,
        productId: orderParams.enhancement_2.productId,
        customTerms: orderParams.enhancement_2.customTerms,
        ownership: orderParams.enhancement_2.ownership,
        engine: orderParams.enhancement_2.engine,
        creatorSignature: ap.utils.ZERO_BYTES,
        counterpartySignature: ap.utils.ZERO_BYTES,
        salt: Math.floor(Math.random() * 1000000)
      },
      creatorSignature: ap.utils.ZERO_BYTES,
      counterpartySignature: ap.utils.ZERO_BYTES,
      salt: Math.floor(Math.random() * 1000000)
    }

    return new Order(ap, orderData);
  }

}
