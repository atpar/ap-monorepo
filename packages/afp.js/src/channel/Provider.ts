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
   * @param payload payload to send
   * @returns Promise to boolean
   */
  public async sendMessage (msg: string) {
    this.socket.emit('message', msg);
    return true;
  }

  /**
   * listens for new messages for a given identifier
   * executes the provided callback function upon receiving a new messages
   * @param identifier identifier to listen for
   * @param cb callback function
   */
  public listenForMessages (identifier: string, cb: { (data: string[]): any }) {
    this.socket.on(identifier, (data: string[]) => {
      cb(data);
    });
  }
}

export class HTTPProvider implements Provider {

  private host: string;

  constructor (host: string) {
    this.host = host;
  }
  
  /**
   * sends a message
   * @param payload payload to send
   * @returns Promise to boolean
   */
  public async sendMessage (payload: string) {
    const response = await fetch(this.host + '/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: payload
    });

    return response.status === 200;
  }

  /**
   * polls for new messages for a given identifier
   * executes the provided callback function upon receiving a new messages
   * @param identifier identifier to listen for
   * @param cb callback function
   */
  public listenForMessages (identifier: string, cb: { (data: string[]): any }) {
    setInterval(async () => {
      try {
        const response = await fetch(this.host + '/api/contracts?address=' + identifier, {})
        const json = await response.json();
        cb(json);
      } catch (error) { return; }
    }, 2000)
  }
}
