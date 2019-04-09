import { Provider, SocketProvider, HTTPProvider } from '../utils/Provider';

import { SignedContractUpdate } from '../types';


export class Client {

  private provider: Provider;
  private contractUpdateListenerRegistry: Map<string, (signedContractUpdate: SignedContractUpdate) => void>;
  private fallbackListener: null | ((signedContractUpdate: SignedContractUpdate) => void);

  private constructor (provider: Provider) {
    this.provider = provider;
    this.contractUpdateListenerRegistry = new Map<string, (signedContractUpdate: SignedContractUpdate) => void>();
    this.fallbackListener = null;
  }

  /**
   * sends a signed contract update utilizing the provided method (http or websocket)
   * @param {SignedContractUpdate} signedContractUpdate signed contract update to send
   * @returns {Promise<void>} returns true if messages was successfully broadcasted
   */
  public async sendContractUpdate (signedContractUpdate: SignedContractUpdate): Promise<void> {
    const message = JSON.stringify({ signedContractUpdate: signedContractUpdate });

    if (!(await this.provider.sendMessage(message))) { 
      throw(new Error('EXECUTION_ERROR: Could not send contract update!'));
    }
  } 

  private _receiveContractUpdate (receiverAddress: string): void {
    if (!(this.contractUpdateListenerRegistry.size === 0 && this.fallbackListener === null)) { 
      throw(new Error('INITIALIZATION_ERROR: Listener already setup!')); 
    }

    this.provider.listenForMessages(receiverAddress, (data: object) => {
      Object.values(data).forEach((obj) => {
        const signedContractUpdate: SignedContractUpdate = obj; 
        const assetId = signedContractUpdate.contractUpdate.assetId;
        const contractListener = this.contractUpdateListenerRegistry.get(assetId);
        if (contractListener) { return contractListener(signedContractUpdate); }
        if (this.fallbackListener) { return this.fallbackListener(signedContractUpdate); }
      });
    });
  }

  /**
   * registers a contract update listener which calls the provided callback function
   * upon receiving a new signed contract update for AssetChannel
   * @param {string} receiverAddress address of the receiver 
   * @param assetId
   * @param {(signedContractUpdate: SignedContractUpdate) => void} cb callback function which returns SignedContractUpdate
   */
  public registerContractUpdateListener (
    receiverAddress: string,
    assetId: string, 
    cb: (signedContractUpdate: SignedContractUpdate) => void
  ): void {
    if (this.contractUpdateListenerRegistry.size === 0 && this.fallbackListener === null) {
      this._receiveContractUpdate(receiverAddress);
    }

    this.contractUpdateListenerRegistry.set(assetId, cb);
  }

  /**
   * removes a contract update listener from the contract update listener registry
   * @param {string} assetId
   */
  public removeContractUpdateListener (assetId: string): void {
    this.contractUpdateListenerRegistry.delete(assetId);
  }

  /**
   * registers a listener which calls the provided callback 
   * when a signed contract update of an unregistered AssetChannel is fetched
   * @param {string} receiverAddress address of the receiver 
   * @param {(signedContractUpdate: SignedContractUpdate) => void} cb callback function which returns SignedContractUpdate
   */
  public onNewContractUpdate (
    receiverAddress: string,
    cb: (signedContractUpdate: SignedContractUpdate) => void
  ): void {
    if (this.contractUpdateListenerRegistry.size === 0 && this.fallbackListener === null) {
      this._receiveContractUpdate(receiverAddress);
    }

    this.fallbackListener = cb;
  }

  private static _websocket (url: string): Client {
    return new Client(new SocketProvider(url));
  }

  private static _http (url: string): Client {
    const routes = { sendMessageRoute: '/api/contracts', listenForMessagesRoute: '/api/contracts?address=' };
    return new Client(new HTTPProvider(url, routes));
  }

  /**
   * returns a new Client instance for communicating with 
   * a provided relayer endpoint
   * @param {string} url url of the channel-relayer
   * @returns {Client}
   */
  public static init (url: string): Client {
    if (url.startsWith('http')) {
      return Client._http(url);
    } else if (url.startsWith('ws')) {
      return Client._websocket(url);
    } else {
      throw(new Error('NOT_IMPLEMENTED_ERROR: only supporting http and websocket!'));
    }
  }
}
