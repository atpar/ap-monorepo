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

export class ICEGEngine extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): ICEGEngine;
  methods: {
    computeCyclicScheduleSegment(
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        feeBasis: number | string;
        creditEventTypeCovered: number | string;
        currency: string;
        settlementCurrency: string;
        contractDealDate: number | string;
        statusDate: number | string;
        maturityDate: number | string;
        purchaseDate: number | string;
        cycleAnchorDateOfFee: number | string;
        notionalPrincipal: number | string;
        delinquencyRate: number | string;
        feeAccrued: number | string;
        feeRate: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        coverageOfCreditEnhancement: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        contractReference_1: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
        contractReference_2: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
      },
      segmentStart: number | string,
      segmentEnd: number | string,
      eventType: number | string
    ): TransactionObject<string[]>;

    computeInitialState(terms: {
      contractType: number | string;
      calendar: number | string;
      contractRole: number | string;
      dayCountConvention: number | string;
      businessDayConvention: number | string;
      endOfMonthConvention: number | string;
      feeBasis: number | string;
      creditEventTypeCovered: number | string;
      currency: string;
      settlementCurrency: string;
      contractDealDate: number | string;
      statusDate: number | string;
      maturityDate: number | string;
      purchaseDate: number | string;
      cycleAnchorDateOfFee: number | string;
      notionalPrincipal: number | string;
      delinquencyRate: number | string;
      feeAccrued: number | string;
      feeRate: number | string;
      priceAtPurchaseDate: number | string;
      priceAtTerminationDate: number | string;
      coverageOfCreditEnhancement: number | string;
      gracePeriod: { i: number | string; p: number | string; isSet: boolean };
      delinquencyPeriod: {
        i: number | string;
        p: number | string;
        isSet: boolean;
      };
      cycleOfFee: {
        i: number | string;
        p: number | string;
        s: number | string;
        isSet: boolean;
      };
      contractReference_1: {
        object: string | number[];
        object2: string | number[];
        _type: number | string;
        role: number | string;
      };
      contractReference_2: {
        object: string | number[];
        object2: string | number[];
        _type: number | string;
        role: number | string;
      };
    }): TransactionObject<{
      contractPerformance: string;
      statusDate: string;
      nonPerformingDate: string;
      maturityDate: string;
      exerciseDate: string;
      terminationDate: string;
      lastCouponFixingDate: string;
      lastDividendFixingDate: string;
      notionalPrincipal: string;
      accruedInterest: string;
      feeAccrued: string;
      nominalInterestRate: string;
      interestScalingMultiplier: string;
      notionalScalingMultiplier: string;
      nextPrincipalRedemptionPayment: string;
      exerciseAmount: string;
      exerciseQuantity: string;
      quantity: string;
      couponAmountFixed: string;
      marginFactor: string;
      adjustmentFactor: string;
      dividendPaymentAmount: string;
      splitRatio: string;
    }>;

    computeNextCyclicEvent(
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        feeBasis: number | string;
        creditEventTypeCovered: number | string;
        currency: string;
        settlementCurrency: string;
        contractDealDate: number | string;
        statusDate: number | string;
        maturityDate: number | string;
        purchaseDate: number | string;
        cycleAnchorDateOfFee: number | string;
        notionalPrincipal: number | string;
        delinquencyRate: number | string;
        feeAccrued: number | string;
        feeRate: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        coverageOfCreditEnhancement: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        contractReference_1: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
        contractReference_2: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
      },
      lastScheduleTime: number | string,
      eventType: number | string
    ): TransactionObject<string>;

    computeNextNonCyclicEvent(
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        feeBasis: number | string;
        creditEventTypeCovered: number | string;
        currency: string;
        settlementCurrency: string;
        contractDealDate: number | string;
        statusDate: number | string;
        maturityDate: number | string;
        purchaseDate: number | string;
        cycleAnchorDateOfFee: number | string;
        notionalPrincipal: number | string;
        delinquencyRate: number | string;
        feeAccrued: number | string;
        feeRate: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        coverageOfCreditEnhancement: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        contractReference_1: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
        contractReference_2: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
      },
      lastNonCyclicEvent: string | number[]
    ): TransactionObject<string>;

    computeNonCyclicScheduleSegment(
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        feeBasis: number | string;
        creditEventTypeCovered: number | string;
        currency: string;
        settlementCurrency: string;
        contractDealDate: number | string;
        statusDate: number | string;
        maturityDate: number | string;
        purchaseDate: number | string;
        cycleAnchorDateOfFee: number | string;
        notionalPrincipal: number | string;
        delinquencyRate: number | string;
        feeAccrued: number | string;
        feeRate: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        coverageOfCreditEnhancement: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        contractReference_1: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
        contractReference_2: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
      },
      segmentStart: number | string,
      segmentEnd: number | string
    ): TransactionObject<string[]>;

    computePayoffForEvent(
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        feeBasis: number | string;
        creditEventTypeCovered: number | string;
        currency: string;
        settlementCurrency: string;
        contractDealDate: number | string;
        statusDate: number | string;
        maturityDate: number | string;
        purchaseDate: number | string;
        cycleAnchorDateOfFee: number | string;
        notionalPrincipal: number | string;
        delinquencyRate: number | string;
        feeAccrued: number | string;
        feeRate: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        coverageOfCreditEnhancement: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        contractReference_1: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
        contractReference_2: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
      },
      state: {
        contractPerformance: number | string;
        statusDate: number | string;
        nonPerformingDate: number | string;
        maturityDate: number | string;
        exerciseDate: number | string;
        terminationDate: number | string;
        lastCouponFixingDate: number | string;
        lastDividendFixingDate: number | string;
        notionalPrincipal: number | string;
        accruedInterest: number | string;
        feeAccrued: number | string;
        nominalInterestRate: number | string;
        interestScalingMultiplier: number | string;
        notionalScalingMultiplier: number | string;
        nextPrincipalRedemptionPayment: number | string;
        exerciseAmount: number | string;
        exerciseQuantity: number | string;
        quantity: number | string;
        couponAmountFixed: number | string;
        marginFactor: number | string;
        adjustmentFactor: number | string;
        dividendPaymentAmount: number | string;
        splitRatio: number | string;
      },
      _event: string | number[],
      externalData: string | number[]
    ): TransactionObject<string>;

    computeStateForEvent(
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        feeBasis: number | string;
        creditEventTypeCovered: number | string;
        currency: string;
        settlementCurrency: string;
        contractDealDate: number | string;
        statusDate: number | string;
        maturityDate: number | string;
        purchaseDate: number | string;
        cycleAnchorDateOfFee: number | string;
        notionalPrincipal: number | string;
        delinquencyRate: number | string;
        feeAccrued: number | string;
        feeRate: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        coverageOfCreditEnhancement: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        contractReference_1: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
        contractReference_2: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
      },
      state: {
        contractPerformance: number | string;
        statusDate: number | string;
        nonPerformingDate: number | string;
        maturityDate: number | string;
        exerciseDate: number | string;
        terminationDate: number | string;
        lastCouponFixingDate: number | string;
        lastDividendFixingDate: number | string;
        notionalPrincipal: number | string;
        accruedInterest: number | string;
        feeAccrued: number | string;
        nominalInterestRate: number | string;
        interestScalingMultiplier: number | string;
        notionalScalingMultiplier: number | string;
        nextPrincipalRedemptionPayment: number | string;
        exerciseAmount: number | string;
        exerciseQuantity: number | string;
        quantity: number | string;
        couponAmountFixed: number | string;
        marginFactor: number | string;
        adjustmentFactor: number | string;
        dividendPaymentAmount: number | string;
        splitRatio: number | string;
      },
      _event: string | number[],
      externalData: string | number[]
    ): TransactionObject<{
      contractPerformance: string;
      statusDate: string;
      nonPerformingDate: string;
      maturityDate: string;
      exerciseDate: string;
      terminationDate: string;
      lastCouponFixingDate: string;
      lastDividendFixingDate: string;
      notionalPrincipal: string;
      accruedInterest: string;
      feeAccrued: string;
      nominalInterestRate: string;
      interestScalingMultiplier: string;
      notionalScalingMultiplier: string;
      nextPrincipalRedemptionPayment: string;
      exerciseAmount: string;
      exerciseQuantity: string;
      quantity: string;
      couponAmountFixed: string;
      marginFactor: string;
      adjustmentFactor: string;
      dividendPaymentAmount: string;
      splitRatio: string;
    }>;

    contractType(): TransactionObject<string>;

    isEventScheduled(
      _event: string | number[],
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        feeBasis: number | string;
        creditEventTypeCovered: number | string;
        currency: string;
        settlementCurrency: string;
        contractDealDate: number | string;
        statusDate: number | string;
        maturityDate: number | string;
        purchaseDate: number | string;
        cycleAnchorDateOfFee: number | string;
        notionalPrincipal: number | string;
        delinquencyRate: number | string;
        feeAccrued: number | string;
        feeRate: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        coverageOfCreditEnhancement: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        contractReference_1: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
        contractReference_2: {
          object: string | number[];
          object2: string | number[];
          _type: number | string;
          role: number | string;
        };
      },
      state: {
        contractPerformance: number | string;
        statusDate: number | string;
        nonPerformingDate: number | string;
        maturityDate: number | string;
        exerciseDate: number | string;
        terminationDate: number | string;
        lastCouponFixingDate: number | string;
        lastDividendFixingDate: number | string;
        notionalPrincipal: number | string;
        accruedInterest: number | string;
        feeAccrued: number | string;
        nominalInterestRate: number | string;
        interestScalingMultiplier: number | string;
        notionalScalingMultiplier: number | string;
        nextPrincipalRedemptionPayment: number | string;
        exerciseAmount: number | string;
        exerciseQuantity: number | string;
        quantity: number | string;
        couponAmountFixed: number | string;
        marginFactor: number | string;
        adjustmentFactor: number | string;
        dividendPaymentAmount: number | string;
        splitRatio: number | string;
      },
      hasUnderlying: boolean,
      underlyingState: {
        contractPerformance: number | string;
        statusDate: number | string;
        nonPerformingDate: number | string;
        maturityDate: number | string;
        exerciseDate: number | string;
        terminationDate: number | string;
        lastCouponFixingDate: number | string;
        lastDividendFixingDate: number | string;
        notionalPrincipal: number | string;
        accruedInterest: number | string;
        feeAccrued: number | string;
        nominalInterestRate: number | string;
        interestScalingMultiplier: number | string;
        notionalScalingMultiplier: number | string;
        nextPrincipalRedemptionPayment: number | string;
        exerciseAmount: number | string;
        exerciseQuantity: number | string;
        quantity: number | string;
        couponAmountFixed: number | string;
        marginFactor: number | string;
        adjustmentFactor: number | string;
        dividendPaymentAmount: number | string;
        splitRatio: number | string;
      }
    ): TransactionObject<boolean>;
  };
  events: {
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}
