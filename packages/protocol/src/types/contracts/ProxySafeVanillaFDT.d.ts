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

export class ProxySafeVanillaFDT extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): ProxySafeVanillaFDT;
  methods: {
    accumulativeFundsOf(_owner: string): TransactionObject<string>;

    allowance(owner: string, spender: string): TransactionObject<string>;

    approve(
      spender: string,
      amount: number | string
    ): TransactionObject<boolean>;

    balanceOf(account: string): TransactionObject<string>;

    burn(account: string, amount: number | string): TransactionObject<boolean>;

    decimals(): TransactionObject<string>;

    decreaseAllowance(
      spender: string,
      subtractedValue: number | string
    ): TransactionObject<boolean>;

    fundsToken(): TransactionObject<string>;

    fundsTokenBalance(): TransactionObject<string>;

    increaseAllowance(
      spender: string,
      addedValue: number | string
    ): TransactionObject<boolean>;

    initialize(
      name: string,
      symbol: string,
      _fundsToken: string,
      owner: string,
      initialAmount: number | string
    ): TransactionObject<void>;

    mint(account: string, amount: number | string): TransactionObject<boolean>;

    name(): TransactionObject<string>;

    owner(): TransactionObject<string>;

    pushFunds(owners: string[]): TransactionObject<void>;

    renounceOwnership(): TransactionObject<void>;

    symbol(): TransactionObject<string>;

    totalSupply(): TransactionObject<string>;

    transfer(to: string, value: number | string): TransactionObject<boolean>;

    transferFrom(
      from: string,
      to: string,
      value: number | string
    ): TransactionObject<boolean>;

    transferOwnership(newOwner: string): TransactionObject<void>;

    updateFundsReceived(): TransactionObject<void>;

    withdrawFunds(): TransactionObject<void>;

    withdrawableFundsOf(_owner: string): TransactionObject<string>;

    withdrawnFundsOf(_owner: string): TransactionObject<string>;
  };
  events: {
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
    OwnershipTransferred: ContractEvent<{
      previousOwner: string;
      newOwner: string;
      0: string;
      1: string;
    }>;
    Transfer: ContractEvent<{
      from: string;
      to: string;
      value: string;
      0: string;
      1: string;
      2: string;
    }>;
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}