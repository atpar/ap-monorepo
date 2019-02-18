import Web3 from 'web3';


export class Common {
  private web3: Web3;

  constructor (web3: Web3) {
    this.web3 = web3;
  }

  public async isConnected () {
    return this.web3.eth.net.isListening();
  }
}
