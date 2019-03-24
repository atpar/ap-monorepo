import { Provider, SocketProvider, HTTPProvider } from '../utils/Provider';

import { SignedContractUpdate } from '../types';


export class Client {

  private provider: Provider;
  private contractUpdateListenerRegistry: Map<string, (signedContractUpdate: SignedContractUpdate) => void>;
  private fallbackListener: null | ((signedContractUpdate: SignedContractUpdate) => void);

  private constructor (receiver: string, provider: Provider) {
    this.provider = provider;
    this.contractUpdateListenerRegistry = new Map<string, (signedContractUpdate: SignedContractUpdate) => void>();
    this.fallbackListener = null;

    this._receiveContractUpdates(receiver);
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

  private async _receiveContractUpdates (receiver: string): Promise<void> {
    this.provider.listenForMessages(receiver, (data: object) => {
      // try  { signedContractUpdate = JSON.parse(obj); } catch (error) { return; }
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
   * @param assetId
   * @param {(signedContractUpdate: SignedContractUpdate) => void} cb callback function which returns SignedContractUpdate
   */
  public registerContractUpdateListener (
    assetId: string, 
    cb: (signedContractUpdate: SignedContractUpdate) => void
  ): void {
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
   * @param {(signedContractUpdate: SignedContractUpdate) => void} cb callback function which returns SignedContractUpdate
   */
  public onNewContractUpdate (cb: (signedContractUpdate: SignedContractUpdate) => void): void {
    this.fallbackListener = cb;
  }

  /**
   * returns a new Client instance that utilizes a websocket 
   * for communicating with a provided relayer endpoint
   * @param {string} receiver address of the receiver
   * @param {string} url websocket url
   * @returns {Client}
   */
  public static websocket (receiver: string, url: string): Client {
    return new Client(receiver, new SocketProvider(url));
  }

  /**
   * returns a new Client instance that utilizes http 
   * for communicating with a provided relayer endpoint
   * @param {string} receiver address of the receiver 
   * @param {string} url http url
   * @returns {Client}
   */
  public static http (receiver: string, url: string): Client {
    const routes = { sendMessageRoute: '/api/contracts', listenForMessagesRoute: '/api/contracts?address=' };
    return new Client(receiver,  new HTTPProvider(url, routes));
  }
}
