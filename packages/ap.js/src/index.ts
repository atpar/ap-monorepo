import Web3 from 'web3';

import { OrderData } from './types';

import * as APTypes from './types';

import { Asset } from './Asset';
import { Relayer } from './issuance/Relayer';
import { Order } from './issuance/Order';
import { Signer } from './utils/Signer';
import { Common } from './utils/Common';
import { 
  OwnershipAPI, 
  EconomicsAPI, 
  PaymentAPI, 
  LifecycleAPI, 
  TokenizationAPI, 
  IssuanceAPI, 
  ContractsAPI 
} from './apis';



export class AP {

  public web3: Web3;

  public ownership: OwnershipAPI;
  public economics: EconomicsAPI;
  public payment: PaymentAPI;
  public lifecycle: LifecycleAPI;
  public issuance: IssuanceAPI;
  public tokenization: TokenizationAPI;
  
  public contracts: ContractsAPI;
  public signer: Signer;
  public common: Common;

  public relayer: Relayer | null;

  constructor (
    web3: Web3, 
    ownership: OwnershipAPI, 
    economics: EconomicsAPI,
    payment: PaymentAPI,
    lifecycle: LifecycleAPI,
    issuance: IssuanceAPI,
    tokenization: TokenizationAPI,
    contracts: ContractsAPI,
    signer: Signer, 
    common: Common,
    relayer?: Relayer,
  ) {
    this.web3 = web3;
    
    this.ownership = ownership;
    this.economics = economics;
    this.payment = payment;
    this.lifecycle = lifecycle;
    this.issuance = issuance;
    this.tokenization = tokenization;

    this.contracts = contracts;
    this.signer = signer;
    this.common = common;

    this.relayer = relayer ? relayer : null;
  }

  /**
   * polls for new unfilled orders from the order relayer
   * @param {(order: Order) => void} cb callback function to be called
   * upon receiving a new unfilled order from the orderbook of the relayer
   */
  public onNewOrder (cb: (order: Order) => void): void {
    if (!this.relayer) { throw('FEATURE_NOT_AVAILABLE: Relayer is not enabled!'); }
    this.relayer.onNewOrder((orderData: OrderData) => {
      cb(Order.load(this, orderData));
    });
  }

  /**
   * look for new issued assets in which the default account is involved
   * @param {(asset: Asset) => void} cb callback function to be called
   * after a new asset in which the default account is involved is issued
   */
  public onNewAssetIssued (cb: (asset: Asset) => void): void {
    this.issuance.onAssetIssued(async (event) => {  
      if (
        event.recordCreatorAddress !== this.signer.account &&
        event.counterpartyAddress !== this.signer.account
      ) { 
        return; 
      }
      
      try {
        const asset = await Asset.load(this, event.assetId);
        cb(asset);
      } catch (error) { console.log(error); return; }
    });
  }

  /**
   * returns an array of assetIds of assets in which the default account is involved
   * @returns {Promise<string[]>}
   */
  public async getAssetIds (): Promise<string[]> {
    const issuances = await this.issuance.getAssetIssuances();
    const assetIds = [];

    for (const issuance of issuances) {
      if (
        issuance.recordCreatorAddress === this.signer.account ||
        issuance.counterpartyAddress === this.signer.account
      ) {
        assetIds.push(issuance.assetId);
      }
    }

    return assetIds;
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

    const contracts = await ContractsAPI.init(web3);
    const signer = new Signer(web3, defaultAccount);
    const common = new Common(web3);

    const ownership = new OwnershipAPI(contracts);
    const economics = new EconomicsAPI(contracts);
    const payment = new PaymentAPI(contracts);
    const lifecycle = new LifecycleAPI(contracts);
    const issuance = new IssuanceAPI(contracts);
    const tokenization = new TokenizationAPI(contracts);
    
    const relayer = (relayers.orderRelayer) ? Relayer.init(relayers.orderRelayer) : undefined;

    return new AP(
      web3, 
      ownership, 
      economics, 
      payment, 
      lifecycle, 
      issuance, 
      tokenization,
      contracts,
      signer, 
      common, 
      relayer,
    );
  }
}

export { Asset };
export { Order };
export { APTypes };
