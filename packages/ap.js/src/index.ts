import Web3 from 'web3';
import Deployments from '@atpar/ap-contracts/deployments.json';

import * as APTypes from './types';

import { Asset } from './Asset';
import { Order } from './Order';
import { Template } from './Template';
import { Contracts, Signer, Utils } from './apis';
import { AddressBook } from './types';


export class AP {

  public web3: Web3;
  
  public contracts: Contracts;
  public signer: Signer;
  public utils: Utils;

  private constructor (
    web3: Web3,
    contracts: Contracts,
    signer: Signer,
    utils: Utils
  ) {
    this.web3 = web3;

    this.contracts = contracts;
    this.signer = signer;
    this.utils = utils;
  }

  /**
   * Listen for new issued assets in which the default account is involved.
   * @param {(asset: Asset) => void} cb callback function to be called after 
   * a new asset in which the default account is involved is issued
   */
  public onNewAssetIssued (cb: (asset: Asset) => void): void {
    this.contracts.assetIssuer.events.IssuedAsset().on('data', async (event): Promise<void> => {
      if (
        !event 
        || !event.returnValues 
        || !event.returnValues.assetId 
        || !event.returnValues.creator 
        || !event.returnValues.counterparty
      ) { throw new Error('EXECUTION_ERROR: Malformed event returned.'); }

      if (
        event.returnValues.creator !== this.signer.account &&
        event.returnValues.counterparty !== this.signer.account
      ) { return; }
      
      try {
        const asset = await Asset.load(this, event.returnValues.assetId);
        cb(asset);
      } catch (error) { console.log(error); }
    });
  }

  /**
   * Returns an array of assetIds of assets in which the default account is involved.
   * @returns {Promise<string[]>}
   */
  public async getAssetIds (): Promise<string[]> {
    const issuances = await this.contracts.assetIssuer.getPastEvents('IssuedAsset');
    const assetIds = [];

    for (const issuance of issuances) {
      if (
        !issuance 
        || !issuance.returnValues 
        || !issuance.returnValues.assetId 
        || !issuance.returnValues.creator 
        || !issuance.returnValues.counterparty
      ) { throw new Error(''); }

      if (
        issuance.returnValues.creator === this.signer.account ||
        issuance.returnValues.counterparty === this.signer.account
      ) { assetIds.push(issuance.returnValues.assetId); }
    }

    return assetIds;
  }

  /**
   * Returns a new AP instance.
   * @param {Web3} web3 Web3 instance
   * @param {string} defaultAccount default account for signing contract updates and transactions
   * @param {AddressBook?} addressBook object containing custom addresses for ap-contracts (overwrites default addresses)
   * @returns {Promise<AP>} 
   */
  public static async init (
    web3: Web3, 
    defaultAccount: string,
    addressBook?: APTypes.AddressBook
  ): Promise<AP> {        
    if (!(await web3.eth.net.isListening())) { 
      throw(new Error('CONNECTION_ERROR: Could not establish connection.'));
    }

    if (!addressBook) {
      const netId = await web3.eth.net.getId();
      // @ts-ignore
      if (!Deployments[netId]) {
        throw new Error('INITIALIZATION_ERROR: Contracts are not deployed on current network.');
      }
      // @ts-ignore
      addressBook = Deployments[netId] as AddressBook;
    }

    const contracts = new Contracts(web3, addressBook);
    const signer = new Signer(web3, defaultAccount, addressBook.AssetIssuer);
    const utils = new Utils();

    return new AP(web3, contracts, signer, utils);
  }
}

export { Asset, Order, Template,APTypes }
