import Web3 from 'web3';

import { Client } from './channel/Client';
import { Signer } from './utils/Signer';
import { ContractChannel } from './channel/ContractChannel';
import { SignedContractUpdate } from './types';
import { Common } from './utils/Common';
import { OwnershipAPI, EconomicsAPI, PaymentAPI } from './apis';


export class AFP {

  public web3: Web3;

  public ownership: OwnershipAPI;
  public economics: EconomicsAPI;
  public payment: PaymentAPI;

  public signer: Signer;
  public common: Common;
  public client: Client | null;

  constructor (
    web3: Web3, 
    ownership: OwnershipAPI, 
    economics: EconomicsAPI,
    payment: PaymentAPI,
    signer: Signer, 
    common: Common, 
    client?: Client
  ) {
    this.web3 = web3;
    
    this.ownership = ownership;
    this.economics = economics;
    this.payment = payment;

    this.signer = signer;
    this.common = common;

    this.client = client ? client : null;
  }

  /**
   * polls for / subscribes to new uninstantiated contracts
   * @param cb callback function to be called upon receiving a new contract
   * @returns Promise to Contract
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

  /**
   * returns a new AFP instance
   * @param web3 Web3 instance
   * @param defaultAccount default account for signing contract updates and transactions
   * @param host the url for the contract update relayer (support for http and websocket)
   * @returns AFP
   */
  public static async init (web3: Web3, defaultAccount: string, host: string): Promise<AFP> {        
    if (!(await web3.eth.net.isListening())) { 
      throw(new Error('CONNECTION_ERROR: could not establish connection to node!'));
    } 

    const ownership = await OwnershipAPI.init(web3);
    const economics = await EconomicsAPI.init(web3);
    const payment = await PaymentAPI.init(web3);

    const signer = new Signer(web3, defaultAccount);
    const common = new Common(web3);
  
    let client: Client | undefined = undefined;

    if (host != null) {
      if (host.startsWith('http')) {
        client = Client.http(signer.account, host);
      } else if (host.startsWith('ws')) {
        client = Client.websocket(signer.account, host);
      } else {
        throw(new Error('NOT_IMPLEMENTED_ERROR: only supporting http and websocket!'));
      }
    } else { 
      // throw(new Error('NOT_DEFINED_ERROR: host address is not defined!')); 
    }

    return new AFP(web3, ownership, economics, payment, signer, common, client);
  }
}

export { Contract } from './Contract';
