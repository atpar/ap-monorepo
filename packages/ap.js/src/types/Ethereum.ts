import { Contract, SendOptions } from 'web3-eth-contract';
import { PromiEvent } from 'web3-core';


export interface TransactionObject {
  send(options: SendOptions, callback?: (err: Error, contracts: Contract) => void): PromiEvent<Contract>;
  estimateGas(): Promise<number>;
  encodeABI(): string;
}

export interface CallObject<T> {
  call(): Promise<T>;
}
