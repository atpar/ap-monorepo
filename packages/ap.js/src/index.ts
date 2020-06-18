import Web3 from 'web3';
import Deployments from '@atpar/ap-contracts/deployments.json';

import * as APTypes from './types';

import { Contracts, Utils } from './apis';
import { AddressBook } from './types';


export class AP {

  public web3: Web3;
  
  public contracts: Contracts;
  public utils = Utils;

  private constructor (
    web3: Web3,
    contracts: Contracts
  ) {
    this.web3 = web3;

    this.contracts = contracts;
  }

  /**
   * Returns a new AP instance.
   * @param {Web3} web3 Web3 instance
   * @param {AddressBook?} addressBook object containing custom addresses for ap-contracts (overwrites default addresses)
   * @returns {Promise<AP>} 
   */
  public static async init (
    web3: Web3, 
    addressBook?: APTypes.AddressBook
  ): Promise<AP> {        
    if (!(await web3.eth.net.isListening())) { 
      throw(new Error('Could not establish connection to Ethereum node.'));
    }

    if (addressBook == undefined) {
      const netId = await web3.eth.net.getId();
      // @ts-ignore
      if (Deployments[netId] == undefined) {
        throw new Error('Contracts are not deployed on current network.');
      }
      // @ts-ignore
      addressBook = Deployments[netId] as AddressBook;
    }

    const contracts = new Contracts(web3, addressBook);

    return new AP(web3, contracts);
  }
}

export { Utils, APTypes }
