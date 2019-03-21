import * as io from 'socket.io-client';
import 'isomorphic-fetch';


export interface Provider {
  sendMessage(payload: string): Promise<boolean>;
  listenForMessages(identifier: string, cb: { (data: string[]): any }): void;
}

export class SocketProvider implements Provider {

  private socket: SocketIOClient.Socket;
  
  constructor (url: string) {
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
   * listens for new messages for a given identifier
   * executes the provided callback function upon receiving new messages
   * @param {string} identifier identifier to listen for
   * @param {(data: string[]) => any} cb callback function which returns an array of messages
   */
  public listenForMessages (identifier: string, cb: { (data: string[]): any }): void {
    this.socket.on(identifier, (data: string[]) => {
      cb(data);
    });
  }
}

export class HTTPProvider implements Provider {

  private host: string;

  private sendMessageRoute: string;
  private listenForMessagesRoute: string;

  constructor (host: string, routes: { sendMessageRoute: string, listenForMessagesRoute: string }) {
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
   * polls for new messages for a given identifier
   * executes the provided callback function upon receiving a new messages
   * @param {string} identifier identifier to listen for
   * @param {(data: string[]) => any} cb callback function which returns an array of messages
   */
  public listenForMessages (identifier: string, cb: { (data: string[]): any }): void {
    setInterval(async () => {
      try {
        const response = await fetch(this.host + this.listenForMessagesRoute + identifier, {});
        const json = await response.json();
        cb(json);
      } catch (error) { return; }
    }, 2000);
  }
}
