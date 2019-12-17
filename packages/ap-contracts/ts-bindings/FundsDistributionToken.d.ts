/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import BN from "bn.js";
import { Contract, ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import { ContractEvent, Callback, TransactionObject, BlockType } from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export class FundsDistributionToken extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): FundsDistributionToken;
  methods: {
    name(): TransactionObject<string>;

    approve(
      spender: string,
      amount: number | string
    ): TransactionObject<boolean>;

    totalSupply(): TransactionObject<string>;

    transferFrom(
      sender: string,
      recipient: string,
      amount: number | string
    ): TransactionObject<boolean>;

    withdrawFunds(): TransactionObject<void>;

    decimals(): TransactionObject<string>;

    increaseAllowance(
      spender: string,
      addedValue: number | string
    ): TransactionObject<boolean>;

    mint(account: string, amount: number | string): TransactionObject<boolean>;

    balanceOf(account: string): TransactionObject<string>;

    symbol(): TransactionObject<string>;

    addMinter(account: string): TransactionObject<void>;

    renounceMinter(): TransactionObject<void>;

    decreaseAllowance(
      spender: string,
      subtractedValue: number | string
    ): TransactionObject<boolean>;

    transfer(
      recipient: string,
      amount: number | string
    ): TransactionObject<boolean>;

    isMinter(account: string): TransactionObject<boolean>;

    allowance(owner: string, spender: string): TransactionObject<string>;

    withdrawableFundsOf(_owner: string): TransactionObject<string>;

    withdrawnFundsOf(_owner: string): TransactionObject<string>;

    accumulativeFundsOf(_owner: string): TransactionObject<string>;
  };
  events: {
    MinterAdded: ContractEvent<string>;
    MinterRemoved: ContractEvent<string>;
    Transfer: ContractEvent<{
      from: string;
      to: string;
      value: string;
      0: string;
      1: string;
      2: string;
    }>;
    Approval: ContractEvent<{
      owner: string;
      spender: string;
      value: string;
      0: string;
      1: string;
      2: string;
    }>;
    FundsDistributed: ContractEvent<{
      by: string;
      fundsDistributed: string;
      0: string;
      1: string;
    }>;
    FundsWithdrawn: ContractEvent<{
      by: string;
      fundsWithdrawn: string;
      0: string;
      1: string;
    }>;
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}
