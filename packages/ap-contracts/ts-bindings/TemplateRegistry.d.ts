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

export class TemplateRegistry extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): TemplateRegistry;
  methods: {
    templates(arg0: string | number[]): TransactionObject<boolean>;

    ONE_POINT_ZERO(): TransactionObject<string>;

    PRECISION(): TransactionObject<string>;

    getTemplateTerms(
      templateId: string | number[]
    ): TransactionObject<{
      calendar: string;
      contractRole: string;
      dayCountConvention: string;
      businessDayConvention: string;
      endOfMonthConvention: string;
      scalingEffect: string;
      penaltyType: string;
      feeBasis: string;
      creditEventTypeCovered: string;
      currency: string;
      settlementCurrency: string;
      marketObjectCodeRateReset: string;
      statusDateOffset: string;
      maturityDateOffset: string;
      feeAccrued: string;
      accruedInterest: string;
      rateMultiplier: string;
      feeRate: string;
      nextResetRate: string;
      penaltyRate: string;
      priceAtPurchaseDate: string;
      nextPrincipalRedemptionPayment: string;
      gracePeriod: { i: string; p: string; isSet: boolean };
      delinquencyPeriod: { i: string; p: string; isSet: boolean };
      periodCap: string;
      periodFloor: string;
    }>;

    getEventAtIndex(
      templateId: string | number[],
      scheduleId: number | string,
      index: number | string
    ): TransactionObject<string>;

    getScheduleLength(
      templateId: string | number[],
      scheduleId: number | string
    ): TransactionObject<string>;

    getSchedule(
      templateId: string | number[],
      scheduleId: number | string
    ): TransactionObject<string[]>;

    registerTemplate(
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
      templateSchedules: {
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
    RegisteredTemplate: ContractEvent<string>;
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}
