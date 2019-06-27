import * as io from 'socket.io-client';
// import 'whatwg-fetch';
import 'cross-fetch/polyfill';
 

export interface Provider {
  sendMessage(payload: string): Promise<boolean>;
  receiveMessage(identifier: string): Promise<object>;
  listenForMessages(identifier: string, cb: { (data: object): any }): void;
}

export class SocketProvider implements Provider {

  private socket: SocketIOClient.Socket;
  
  public constructor (url: string) {
    this.socket = io.connect(url);
  }
  
  /**
   * sends a message
   * @param {string} payload payload to send
   * @returns {Promise<boolean>}
   */
  public async sendMessage (payload: string): Promise<boolean> {
    this.socket.emit('message', payload);
    return true;
  }

  /**
   * listens for new messages for a given identifier once
   * returns new received message
   * @param {string} identifier identifier to listen for
   * @returns {Promise<object>}
   */
  public async receiveMessage (identifier: string): Promise<object> {
    return new Promise((resolve) => {
      this.socket.once(identifier, (data: object): void => {
        resolve(data);
      });
    });
  }

  /**
   * listens for new messages for a given identifier
   * executes the provided callback function upon receiving new messages
   * @param {string} identifier identifier to listen for
   * @param {(data: object) => any} cb callback function which returns an array of messages
   */
  public listenForMessages (identifier: string, cb: { (data: object): any }): void {
    this.socket.on(identifier, (data: object): void => {
      cb(data);
    });
  }
}

export class HTTPProvider implements Provider {

  private host: string;

  private sendMessageRoute: string;
  private listenForMessagesRoute: string;

  public constructor (host: string, routes: { sendMessageRoute: string; listenForMessagesRoute: string }) {
    this.host = host;
    this.sendMessageRoute = routes.sendMessageRoute;
    this.listenForMessagesRoute = routes.listenForMessagesRoute;
  }
  
  /**
   * sends a message
   * @param {string} payload payload to send
   * @returns {Promise<boolean>}
   */
  public async sendMessage (payload: string): Promise<boolean> {
    const response = await fetch(this.host + this.sendMessageRoute, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: payload
    });

    return response.status === 200;
  }

  /**
   * fetches for message for a given identifier
   * returns after message is fetched
   * @param {string} identifier identifier of the message
   * @returns {Promise<object>}
   */
  public async receiveMessage (identifier: string): Promise<object> {
    const response = await fetch(this.host + this.listenForMessagesRoute + identifier, {});
    const json = await response.json();
    return json;
  }

  /**
   * polls for new messages for a given identifier
   * executes the provided callback function upon receiving a new messages
   * @param {string} identifier identifier to listen for
   * @param {(data: object) => any} cb callback function which returns an array of messages
   */
  public listenForMessages (identifier: string, cb: { (data: object): any }): void {
    setInterval(async (): Promise<void> => {
      try {
        const response = await fetch(this.host + this.listenForMessagesRoute + identifier, {});
        const json = await response.json();
        cb(json);
      } catch (error) { return; }
    }, 2000);
  }
}
