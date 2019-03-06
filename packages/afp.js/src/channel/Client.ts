import { Provider, SocketProvider, HTTPProvider } from './Provider';
import { SignedContractUpdate } from '../types';


export class Client {

  private provider: Provider;
  private contractListenerRegistry: Map<string, (signedContractUpdate: SignedContractUpdate) => void>;
  private fallbackListener: null | ((signedContractUpdate: SignedContractUpdate) => void);

  private constructor (receiver: string, provider: Provider) {
    this.provider = provider;
    this.contractListenerRegistry = new Map<string, (signedContractUpdate: SignedContractUpdate) => void>();
    this.fallbackListener = null;

    this._receiveContractUpdates(receiver);
  }

  /**
   * sends a signed contract update utilizing the provided method (http or websocket)
   * @param signedContractUpdate signed contract update to send
   * @returns true if messages was successfully broadcasted
   */
  public async sendContractUpdate (signedContractUpdate: object): Promise<boolean> {
    const message = JSON.stringify({ signedContractUpdate: signedContractUpdate });
    return this.provider.sendMessage(message);
  } 

  private async _receiveContractUpdates (receiver: string): Promise<void> {
    this.provider.listenForMessages(receiver, (data: object) => {
      // try  { signedContractUpdate = JSON.parse(obj); } catch (error) { return; }
      Object.values(data).forEach((obj) => {
        const signedContractUpdate: SignedContractUpdate = obj; 
        const contractId = signedContractUpdate.contractUpdate.contractId;
        const contractListener = this.contractListenerRegistry.get(contractId);
        if (contractListener) { return contractListener(signedContractUpdate); }
        if (this.fallbackListener) { return this.fallbackListener(signedContractUpdate); }
      });
    });
  }

  /**
   * registers a contract listener which calls the provided callback function
   * upon receiving a new signed contract update
   * @param contractId contract id
   * @param cb callback
   */
  public registerContractListener (
    contractId: string, 
    cb: (signedContractUpdate: SignedContractUpdate) => void
  ): void {
    this.contractListenerRegistry.set(contractId, cb);
  }

  /**
   * removes a contract listener from the contract listener registry
   * @param contractId contract id
   */
  public removeContractListener (contractId: string): void {
    this.contractListenerRegistry.delete(contractId);
  }

  /**
   * registers a listener which calls the provided callback 
   * when a signed contract update of a unregistered contract is fetched
   * @param cb 
   */
  public onNewContractUpdate (cb: (signedContractUpdate: SignedContractUpdate) => void): void {
    this.fallbackListener = cb;
  }

  /**
   * create a new Client instance that utilizes a websocket 
   * for communicating with a provided relayer endpoint
   * @param receiver address of the receiver
   * @param url websocket url
   * @returns Client
   */
  public static websocket (receiver: string, url: string): Client {
    return new Client(receiver, new SocketProvider(url));
  }

  /**
   * create a new Client instance that utilizes http 
   * for communicating with a provided relayer endpoint
   * @param receiver address of the receiver 
   * @param url http url
   * @returns Client
   */
  public static http (receiver: string, url: string): Client {
    return new Client(receiver,  new HTTPProvider(url));
  }
}
