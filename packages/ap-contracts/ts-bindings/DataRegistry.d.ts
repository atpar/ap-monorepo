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

export class DataRegistry extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): DataRegistry;
  methods: {
    owner(): TransactionObject<string>;

    renounceOwnership(): TransactionObject<void>;

    transferOwnership(newOwner: string): TransactionObject<void>;

    isRegistered(setId: string | number[]): TransactionObject<boolean>;

    getDataPoint(
      setId: string | number[],
      timestamp: number | string
    ): TransactionObject<{
      0: string;
      1: boolean;
    }>;

    getLastUpdatedTimestamp(
      setId: string | number[]
    ): TransactionObject<string>;

    getDataProvider(setId: string | number[]): TransactionObject<string>;

    setDataProvider(
      setId: string | number[],
      provider: string
    ): TransactionObject<void>;

    publishDataPoint(
      setId: string | number[],
      timestamp: number | string,
      dataPoint: number | string
    ): TransactionObject<void>;
  };
  events: {
    OwnershipTransferred: ContractEvent<{
      previousOwner: string;
      newOwner: string;
      0: string;
      1: string;
    }>;
    PublishedDataPoint: ContractEvent<{
      setId: string;
      dataPoint: string;
      timestamp: string;
      0: string;
      1: string;
      2: string;
    }>;
    UpdatedDataProvider: ContractEvent<{
      setId: string;
      provider: string;
      0: string;
      1: string;
    }>;
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}