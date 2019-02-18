import Web3 from 'web3';

import { Client } from './channel/Client';
import { Signer } from './utils/Signer';
import { Contract } from './Contract';
import { SignedContractUpdate } from './types';
import { Common } from './utils/Common';


export class AFP {

  public web3: Web3;
  public client: Client;
  public signer: Signer;
  public common: Common;

  constructor (web3: Web3, client: Client, signer: Signer, common: Common) {
    this.web3 = web3;
    this.client = client;
    this.signer = signer;
    this.common = common;
  }

  /**
   * polls for / subscribes to new uninstantiated contracts
   * @param cb callback function to be called upon receiving a new contract
   * @returns Promise to Contract
   */
  public async onNewContract (cb: (contract: Contract) => void) {
    this.client.onNewContractUpdate(async (signedContractUpdate: SignedContractUpdate) => {
      try {
        const contract = await Contract.fromSignedContractUpdate(this, signedContractUpdate);
        cb(contract);
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
  public static async init (web3: Web3, defaultAccount: string, host: string) {        
    if (!(await web3.eth.net.isListening())) { 
      throw(new Error('CONNECTION_ERROR: could not establish connection to node!'));
    } 

    const signer = new Signer(web3, defaultAccount);
    const common = new Common(web3);
  
    let client: Client;

    if (host != null) {
      if (host.startsWith('http')) {
        client = Client.http(signer.account, host);
      } else if (host.startsWith('ws')) {
        client = Client.websocket(signer.account, host);
      } else {
        throw(new Error('NOT_IMPLEMENTED_ERROR: only supporting http and websocket!'));
      }
    } else { throw(new Error('NOT_DEFINED_ERROR: host address is not defined!')); }

    return new AFP(web3, client, signer, common);
  }
}

export { Contract } from './Contract';
