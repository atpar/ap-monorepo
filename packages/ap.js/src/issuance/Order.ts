import { AP } from "../";
import { OrderData, OrderParams, isOrderData } from "../types";


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
    if (this.orderData.makerAddress === this.ap.signer.account) {
      this.orderData.signatures.makerSignature = await this.ap.signer.signOrderAsMaker(this.orderData);
    } else if (this.orderData.takerAddress === null) {
      this.orderData.takerAddress = this.ap.signer.account;
      this.orderData.takerCreditEnhancementAddress = '0x0000000000000000000000000000000000000000';
      this.orderData.signatures.takerSignature = await this.ap.signer.signOrderAsTaker(this.orderData);
    } else {
      throw(new Error(
        'EXECUTION_ERROR: makerAddress does not match or takerAddress is already set.'
      ));
    }
  }
  
  /**
   * issues a new asset if the order is filled.
   */
  public async issueAssetFromOrder (): Promise<void> {
    if (!this.orderData.signatures.makerSignature || !this.orderData.signatures.takerSignature) {
      throw(new Error('EXECUTION_ERROR: Can not issue asset from unfilled order. Signature is missing!'));
    }

    await this.ap.issuance.fillOrder(this.orderData).send({ from: this.ap.signer.account, gas: 5000000 });
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

    if (! (await ap.signer.validateOrderDataSignatures(orderData))) {
      throw(new Error('EXECUTION_ERROR: Signatures are invalid.'));
    }

    return new Order(ap, orderData);
  }

  /**
   * creates a new Order instance from the provided orderParams
   * @param {AP} ap AP instance
   * @param orderParams 
   * @returns {Order}
   */
  public static create (ap: AP, orderParams: OrderParams): Order {
    const orderData: OrderData = { 
      ...orderParams,
      takerAddress: null,
      takerCreditEnhancementAddress: null,
      actorAddress: ap.contracts.assetActor.instance.options.address,
      signatures: {
        makerSignature: null,
        takerSignature: null
      },
      salt: Math.floor(Math.random() * 1000000)
    }

    return new Order(ap,  orderData);
  }

}
