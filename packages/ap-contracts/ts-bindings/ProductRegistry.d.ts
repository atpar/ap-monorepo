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

export class ProductRegistry extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): ProductRegistry;
  methods: {
    decodeCollateralObject(
      object: string | number[]
    ): TransactionObject<{
      0: string;
      1: BN;
    }>;

    encodeCollateralAsObject(
      collateralToken: string,
      collateralAmount: number | string
    ): TransactionObject<string>;

    ONE_POINT_ZERO(): TransactionObject<BN>;

    PRECISION(): TransactionObject<BN>;

    getProductTerms(
      productId: string | number[]
    ): TransactionObject<{
      calendar: BN;
      contractRole: BN;
      dayCountConvention: BN;
      businessDayConvention: BN;
      endOfMonthConvention: BN;
      scalingEffect: BN;
      penaltyType: BN;
      feeBasis: BN;
      creditEventTypeCovered: BN;
      currency: string;
      settlementCurrency: string;
      marketObjectCodeRateReset: string;
      statusDateOffset: BN;
      maturityDateOffset: BN;
      feeAccrued: BN;
      accruedInterest: BN;
      rateMultiplier: BN;
      feeRate: BN;
      nextResetRate: BN;
      penaltyRate: BN;
      priceAtPurchaseDate: BN;
      nextPrincipalRedemptionPayment: BN;
      gracePeriod: { i: BN; p: BN; isSet: boolean };
      delinquencyPeriod: { i: BN; p: BN; isSet: boolean };
      periodCap: BN;
      periodFloor: BN;
    }>;

    getEventAtIndex(
      productId: string | number[],
      scheduleId: number | string,
      index: number | string
    ): TransactionObject<string>;

    getScheduleLength(
      productId: string | number[],
      scheduleId: number | string
    ): TransactionObject<BN>;

    getSchedule(
      productId: string | number[],
      scheduleId: number | string
    ): TransactionObject<string[]>;

    registerProduct(
      terms: {
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        scalingEffect: number | string;
        penaltyType: number | string;
        feeBasis: number | string;
        creditEventTypeCovered: number | string;
        currency: string;
        settlementCurrency: string;
        marketObjectCodeRateReset: string | number[];
        statusDateOffset: number | string;
        maturityDateOffset: number | string;
        feeAccrued: number | string;
        accruedInterest: number | string;
        rateMultiplier: number | string;
        feeRate: number | string;
        nextResetRate: number | string;
        penaltyRate: number | string;
        priceAtPurchaseDate: number | string;
        nextPrincipalRedemptionPayment: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        periodCap: number | string;
        periodFloor: number | string;
      },
      productSchedules: {
        nonCyclicSchedule: (string | number[])[];
        cyclicIPSchedule: (string | number[])[];
        cyclicPRSchedule: (string | number[])[];
        cyclicRRSchedule: (string | number[])[];
        cyclicPYSchedule: (string | number[])[];
        cyclicSCSchedule: (string | number[])[];
        cyclicFPSchedule: (string | number[])[];
      }
    ): TransactionObject<void>;
  };
  events: {
    RegisteredProduct: ContractEvent<string>;
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}
