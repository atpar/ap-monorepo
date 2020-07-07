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

export class SimpleRestrictedUpgradeSafeFDT extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): SimpleRestrictedUpgradeSafeFDT;
  methods: {
    FAILURE_NON_WHITELIST(): TransactionObject<string>;

    FAILURE_NON_WHITELIST_MESSAGE(): TransactionObject<string>;

    SUCCESS_CODE(): TransactionObject<string>;

    SUCCESS_MESSAGE(): TransactionObject<string>;

    UNKNOWN_ERROR(): TransactionObject<string>;

    accumulativeFundsOf(_owner: string): TransactionObject<string>;

    addAdmin(adminToAdd: string): TransactionObject<void>;

    addToWhitelist(
      addressToAdd: string,
      whitelist: number | string
    ): TransactionObject<void>;

    addressWhitelists(arg0: string): TransactionObject<string>;

    administrators(arg0: string): TransactionObject<boolean>;

    allowance(owner: string, spender: string): TransactionObject<string>;

    approve(
      spender: string,
      amount: number | string
    ): TransactionObject<boolean>;

    balanceOf(account: string): TransactionObject<string>;

    checkWhitelistAllowed(
      sender: string,
      receiver: string
    ): TransactionObject<boolean>;

    decimals(): TransactionObject<string>;

    decreaseAllowance(
      spender: string,
      subtractedValue: number | string
    ): TransactionObject<boolean>;

    disableRestrictions(): TransactionObject<void>;

    fundsToken(): TransactionObject<string>;

    fundsTokenBalance(): TransactionObject<string>;

    increaseAllowance(
      spender: string,
      addedValue: number | string
    ): TransactionObject<boolean>;

    isAdministrator(addressToTest: string): TransactionObject<boolean>;

    isRestrictionEnabled(): TransactionObject<boolean>;

    name(): TransactionObject<string>;

    outboundWhitelistsEnabled(
      arg0: number | string,
      arg1: number | string
    ): TransactionObject<boolean>;

    owner(): TransactionObject<string>;

    removeAdmin(adminToRemove: string): TransactionObject<void>;

    removeFromWhitelist(addressToRemove: string): TransactionObject<void>;

    renounceOwnership(): TransactionObject<void>;

    symbol(): TransactionObject<string>;

    totalSupply(): TransactionObject<string>;

    transferOwnership(newOwner: string): TransactionObject<void>;

    updateOutboundWhitelistEnabled(
      sourceWhitelist: number | string,
      destinationWhitelist: number | string,
      newEnabledValue: boolean
    ): TransactionObject<void>;

    withdrawableFundsOf(_owner: string): TransactionObject<string>;

    withdrawnFundsOf(_owner: string): TransactionObject<string>;

    withdrawFunds(): TransactionObject<void>;

    updateFundsReceived(): TransactionObject<void>;

    initialize(
      name: string,
      symbol: string,
      _fundsToken: string,
      owner: string,
      initialAmount: number | string
    ): TransactionObject<void>;

    pushFunds(owners: string[]): TransactionObject<void>;

    transfer(to: string, value: number | string): TransactionObject<boolean>;

    transferFrom(
      from: string,
      to: string,
      value: number | string
    ): TransactionObject<boolean>;

    mint(account: string, amount: number | string): TransactionObject<boolean>;

    burn(account: string, amount: number | string): TransactionObject<boolean>;

    detectTransferRestriction(
      from: string,
      to: string,
      arg2: number | string
    ): TransactionObject<string>;

    messageForTransferRestriction(
      restrictionCode: number | string
    ): TransactionObject<string>;
  };
  events: {
    AddressAddedToWhitelist: ContractEvent<{
      addedAddress: string;
      whitelist: string;
      addedBy: string;
      0: string;
      1: string;
      2: string;
    }>;
    AddressRemovedFromWhitelist: ContractEvent<{
      removedAddress: string;
      whitelist: string;
      removedBy: string;
      0: string;
      1: string;
      2: string;
    }>;
    AdminAdded: ContractEvent<{
      addedAdmin: string;
      addedBy: string;
      0: string;
      1: string;
    }>;
    AdminRemoved: ContractEvent<{
      removedAdmin: string;
      removedBy: string;
      0: string;
      1: string;
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
    OutboundWhitelistUpdated: ContractEvent<{
      updatedBy: string;
      sourceWhitelist: string;
      destinationWhitelist: string;
      from: boolean;
      to: boolean;
      0: string;
      1: string;
      2: string;
      3: boolean;
      4: boolean;
    }>;
    OwnershipTransferred: ContractEvent<{
      previousOwner: string;
      newOwner: string;
      0: string;
      1: string;
    }>;
    RestrictionsDisabled: ContractEvent<string>;
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
