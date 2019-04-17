import { AP } from "../";
import { OrderData, OrderParams } from "../types";
import { SendOptions } from "web3-eth-contract/types";


export class Order {

  private ap: AP;
  public orderData: OrderData;

  constructor (ap: AP, orderData: OrderData) {
    this.ap = ap;
    this.orderData = orderData;
  }

  /**
   * signs and send the order to the order relayer
   * @dev this requires the users signature (metamask pop-up)
   * @returns {Promise<void>}
   */
  public async signAndSendOrder (): Promise<void> {
    if (!this.ap.relayer)  {
      throw(new Error('FEATURE_NOT_AVAILABLE: Relayer is not enabled!')); 
    }

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

    await this.ap.relayer.sendOrder(this.orderData);
  }
  
  /**
   * issues a new asset if the order is filled.
   * @param {SendOptions} txOptions web3 transaction options
   */
  public async issueAssetFromOrder (txOptions: SendOptions): Promise<void> {
    if (!this.orderData.signatures.makerSignature || !this.orderData.signatures.takerSignature) {
      throw(new Error('EXECUTION_ERROR: Can not issue asset from unfilled order. Signature is missing!'));
    }

    await this.ap.issuance.fillOrder(this.orderData).send(txOptions);
  }
  
  /**
   * instantiates a new Order instance with the provided orderData
   * @param {AP} ap AP instance
   * @param {OrderData} orderData
   * @returns {Order}
   */
  public static load (ap: AP, orderData: OrderData): Order {
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
      actorAddress: ap.lifecycle.getActorAddress(),
      signatures: {
        makerSignature: null,
        takerSignature: null
      },
      salt: Math.floor(Math.random() * 1000000)
    }

    return new Order(ap,  orderData);
  }

}