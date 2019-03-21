import Web3 from 'web3';

import { SignedContractUpdate, OrderData } from './types';

import { ContractChannel } from './channel/ContractChannel';
import { OwnershipAPI, EconomicsAPI, PaymentAPI, LifecycleAPI } from './apis';
import { Relayer } from './trading/Relayer';
import { Order } from './trading/Order';
import { Client } from './channel/Client';
import { Signer } from './utils/Signer';
import { Common } from './utils/Common';


export class AP {

  public web3: Web3;

  public ownership: OwnershipAPI;
  public economics: EconomicsAPI;
  public payment: PaymentAPI;
  public lifecycle: LifecycleAPI;

  public signer: Signer;
  public common: Common;

  public relayer: Relayer | null;
  public client: Client | null;

  constructor (
    web3: Web3, 
    ownership: OwnershipAPI, 
    economics: EconomicsAPI,
    payment: PaymentAPI,
    lifecycle: LifecycleAPI,
    signer: Signer, 
    common: Common,
    relayer?: Relayer,
    client?: Client
  ) {
    this.web3 = web3;
    
    this.ownership = ownership;
    this.economics = economics;
    this.payment = payment;
    this.lifecycle = lifecycle;

    this.signer = signer;
    this.common = common;

    this.relayer = relayer ? relayer : null;
    this.client = client ? client : null;
  }

  /**
   * polls for / subscribes to new uninstantiated contracts
   * @param {(contractChannel: ContractChannel) => void} cb callback function to be called 
   * upon receiving a signed contract update of an uninstantiated ContractChannel
   */
  public onNewContractChannel (cb: (contractChannel: ContractChannel) => void): void {
    if (!this.client) { throw('FEATURE_NOT_AVAILABLE: Client is not enabled!'); }
    this.client.onNewContractUpdate(async (signedContractUpdate: SignedContractUpdate) => {
      try {
        const contractChannel = await ContractChannel.fromSignedContractUpdate(this, signedContractUpdate);
        cb(contractChannel);
      } catch (error) { return; }
    });
  }

  public onNewOrder (cb: (order: Order) => void): void {
    if (!this.relayer) { throw('FEATURE_NOT_AVAILABLE: Relayer is not enabled!'); }
    this.relayer.onNewOrder((orderData: OrderData) => {
      cb(Order.load(this, orderData));
    });
  }

  /**
   * returns a new AP instance
   * @param {Web3} web3 Web3 instance
   * @param {string} defaultAccount default account for signing contract updates and transactions
   * @param {{orderRelayer?: string, channelRelayer?: string}} relayers the urls for the orderRelayer and the channelRelayer
   * @returns {Promise<AP>} 
   */
  public static async init (
    web3: Web3, 
    defaultAccount: string, 
    relayers: {orderRelayer?: string, channelRelayer?: string}
  ): Promise<AP> {        
    if (!(await web3.eth.net.isListening())) { 
      throw(new Error('CONNECTION_ERROR: could not establish connection to node!'));
    }

    const signer = new Signer(web3, defaultAccount);
    const common = new Common(web3);

    const ownership = await OwnershipAPI.init(web3, signer);
    const economics = await EconomicsAPI.init(web3, signer);
    const payment = await PaymentAPI.init(web3, signer);
    const lifecycle = await LifecycleAPI.init(web3, signer);
    
    let relayer: Relayer | undefined = undefined;
    let client: Client | undefined = undefined;

    if (relayers.orderRelayer != null) {
      if (relayers.orderRelayer.startsWith('http')) {
        relayer = Relayer.http(relayers.orderRelayer);
      } else if (relayers.orderRelayer.startsWith('ws')) {
        relayer = Relayer.websocket(relayers.orderRelayer);
      } else {
        throw(new Error('NOT_IMPLEMENTED_ERROR: only supporting http and websocket!'));
      }
    } else { 
      // throw(new Error('NOT_DEFINED_ERROR: host address is not defined!')); 
    }

    if (relayers.channelRelayer != null) {
      if (relayers.channelRelayer.startsWith('http')) {
      client = Client.http(signer.account, relayers.channelRelayer);
      } else if (relayers.channelRelayer.startsWith('ws')) {
        client = Client.websocket(signer.account, relayers.channelRelayer);
      } else {
        throw(new Error('NOT_IMPLEMENTED_ERROR: only supporting http and websocket!'));
      }
    } else { 
      // throw(new Error('NOT_DEFINED_ERROR: host address is not defined!')); 
    }

    return new AP(web3, ownership, economics, payment, lifecycle, signer, common, relayer, client);
  }
}

export { Contract } from './Contract';
export { ContractChannel } from './channel/ContractChannel';
export { Order } from './trading/Order';
