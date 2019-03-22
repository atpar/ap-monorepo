import { AP } from "../";
import { OrderData, OrderParams } from "../types";


export class Order {

  private ap: AP;
  public orderData: OrderData;

  constructor (ap: AP, orderData: OrderData) {
    this.ap = ap;
    this.orderData = orderData;
  }

  public async signAndSendOrder (): Promise<void> {
    if (!this.ap.relayer)  {
      throw(new Error('FEATURE_NOT_AVAILABLE: Relayer is not enabled!')); 
    }

    const signature = await this.ap.signer.signOrder(this.orderData);
    const signer = this.ap.signer.account;

    if (signer === this.orderData.makerAddress) {
      this.orderData.signatures.makerSignature = signature;
    } else if (signer === this.orderData.takerAddress) {
      this.orderData.signatures.takerSignature = signature;
    } else {
      throw(new Error(
        'EXECUTION_ERROR: Addresses do not match. Address of signer has to be equal to makerAddress or takerAddress.'
      ));
    }

    await this.ap.relayer.sendOrder(this.orderData);
  }
  
  public static load (ap: AP, orderData: OrderData): Order {
    return new Order(ap, orderData);
  }

  public static create (ap: AP, orderParams: OrderParams): Order {
    const orderData: OrderData = { 
      ...orderParams, 
      signatures: {
        makerSignature: null,
        takerSignature: null
      },
      salt: Math.floor(Math.random() * 1000000)
    }

    return new Order(ap,  orderData);
  }

}