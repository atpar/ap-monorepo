import { Contract, SendOptions } from 'web3-eth-contract';
import { TransactionReceipt } from 'web3-core';
import { PromiEvent } from 'web3-core';


export interface TransactionObject {
  send(
    options: SendOptions, 
    callback?: (err: Error, contracts: Contract) => void
  ): PromiEvent<TransactionReceipt>;
  estimateGas(): Promise<number>;
  encodeABI(): string;
}

export interface CallObject<T> {
  call(): Promise<T>;
}
