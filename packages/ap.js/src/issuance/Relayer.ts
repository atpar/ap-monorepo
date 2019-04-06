import { OrderData } from '../types';
import { Provider, SocketProvider, HTTPProvider } from '../utils/Provider';


export class Relayer {

  private provider: Provider;

  private constructor (provider: Provider) {
    this.provider = provider;
  }

  /**
   * sends a signed order utilizing the provided method (http or websocket)
   * @param {OrderData} orderData order to send
   * @returns {Promise<void>} returns true if messages was successfully broadcasted
   */
  public async sendOrder (orderData: OrderData): Promise<void> {
    const message = JSON.stringify({ order: orderData });

    if (!(await this.provider.sendMessage(message))) { 
      throw(new Error('EXECUTION_ERROR: Could not send order'));
    }
  } 

  /**
   * registers a listener which calls the provided callback 
   * when a new order from the relayer is fetched
   * @param {(orderData: OrderData) => void} cb callback function which returns received OrderData
   */
  public onNewOrder (cb: (orderData: OrderData) => void): void {
    this.provider.listenForMessages('', (data: object) => {
      Object.values(data).forEach((orderData: OrderData) => {
        cb(orderData);
      });
    });
  }

  /**
   * returns a new Relayer instance that utilizes a websocket 
   * for communicating with a provided relayer endpoint
   * @param {string} url websocket url
   * @returns {Relayer}
   */
  public static websocket (url: string): Relayer {
    return new Relayer(new SocketProvider(url));
  }

  /**
   * returns a new Relayer instance that utilizes http 
   * for communicating with a provided relayer endpoint
   * @param {string} url http url
   * @returns {Relayer}
   */
  public static http (url: string): Relayer {
    const routes = { sendMessageRoute: '/api/orders', listenForMessagesRoute: '/api/orders?address=' };
    return new Relayer(new HTTPProvider(url, routes));
  }
}
