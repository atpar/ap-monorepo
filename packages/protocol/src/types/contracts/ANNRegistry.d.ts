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

export class ANNRegistry extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): ANNRegistry;
  methods: {
    approveActor(actor: string): TransactionObject<void>;

    approvedActors(arg0: string): TransactionObject<boolean>;

    decodeEvent(
      _event: string | number[]
    ): TransactionObject<{
      0: string;
      1: string;
    }>;

    encodeEvent(
      eventType: number | string,
      scheduleTime: number | string
    ): TransactionObject<string>;

    getActor(assetId: string | number[]): TransactionObject<string>;

    getAddressValueForTermsAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<string>;

    getBytes32ValueForTermsAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<string>;

    getContractReferenceValueForTermsAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<{
      object: string;
      object2: string;
      _type: string;
      role: string;
    }>;

    getCycleValueForTermsAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<{ i: string; p: string; s: string; isSet: boolean }>;

    getEngine(assetId: string | number[]): TransactionObject<string>;

    getEnumValueForStateAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<string>;

    getEnumValueForTermsAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<string>;

    getEpochOffset(eventType: number | string): TransactionObject<string>;

    getEventAtIndex(
      assetId: string | number[],
      index: number | string
    ): TransactionObject<string>;

    getFinalizedState(
      assetId: string | number[]
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

    getIntValueForStateAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<string>;

    getIntValueForTermsAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<string>;

    getNextScheduleIndex(assetId: string | number[]): TransactionObject<string>;

    getNextScheduledEvent(
      assetId: string | number[]
    ): TransactionObject<string>;

    getNextUnderlyingEvent(
      assetId: string | number[]
    ): TransactionObject<string>;

    getOwnership(
      assetId: string | number[]
    ): TransactionObject<{
      creatorObligor: string;
      creatorBeneficiary: string;
      counterpartyObligor: string;
      counterpartyBeneficiary: string;
    }>;

    getPendingEvent(assetId: string | number[]): TransactionObject<string>;

    getPeriodValueForTermsAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<{ i: string; p: string; isSet: boolean }>;

    getSchedule(assetId: string | number[]): TransactionObject<string[]>;

    getScheduleLength(assetId: string | number[]): TransactionObject<string>;

    getState(
      assetId: string | number[]
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

    getTerms(
      assetId: string | number[]
    ): TransactionObject<{
      contractType: string;
      calendar: string;
      contractRole: string;
      dayCountConvention: string;
      businessDayConvention: string;
      endOfMonthConvention: string;
      scalingEffect: string;
      feeBasis: string;
      currency: string;
      settlementCurrency: string;
      marketObjectCodeRateReset: string;
      contractDealDate: string;
      statusDate: string;
      initialExchangeDate: string;
      maturityDate: string;
      issueDate: string;
      purchaseDate: string;
      capitalizationEndDate: string;
      cycleAnchorDateOfInterestPayment: string;
      cycleAnchorDateOfRateReset: string;
      cycleAnchorDateOfScalingIndex: string;
      cycleAnchorDateOfFee: string;
      cycleAnchorDateOfPrincipalRedemption: string;
      notionalPrincipal: string;
      nominalInterestRate: string;
      accruedInterest: string;
      rateMultiplier: string;
      rateSpread: string;
      nextResetRate: string;
      feeRate: string;
      feeAccrued: string;
      delinquencyRate: string;
      premiumDiscountAtIED: string;
      priceAtPurchaseDate: string;
      priceAtTerminationDate: string;
      nextPrincipalRedemptionPayment: string;
      lifeCap: string;
      lifeFloor: string;
      periodCap: string;
      periodFloor: string;
      gracePeriod: { i: string; p: string; isSet: boolean };
      delinquencyPeriod: { i: string; p: string; isSet: boolean };
      cycleOfInterestPayment: {
        i: string;
        p: string;
        s: string;
        isSet: boolean;
      };
      cycleOfRateReset: { i: string; p: string; s: string; isSet: boolean };
      cycleOfScalingIndex: { i: string; p: string; s: string; isSet: boolean };
      cycleOfFee: { i: string; p: string; s: string; isSet: boolean };
      cycleOfPrincipalRedemption: {
        i: string;
        p: string;
        s: string;
        isSet: boolean;
      };
    }>;

    getUIntValueForTermsAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<string>;

    getUintValueForStateAttribute(
      assetId: string | number[],
      attribute: string | number[]
    ): TransactionObject<string>;

    grantAccess(
      assetId: string | number[],
      methodSignature: string | number[],
      account: string
    ): TransactionObject<void>;

    hasAccess(
      assetId: string | number[],
      methodSignature: string | number[],
      account: string
    ): TransactionObject<boolean>;

    hasRootAccess(
      assetId: string | number[],
      account: string
    ): TransactionObject<boolean>;

    isEventSettled(
      assetId: string | number[],
      _event: string | number[]
    ): TransactionObject<{
      0: boolean;
      1: string;
    }>;

    isRegistered(assetId: string | number[]): TransactionObject<boolean>;

    markEventAsSettled(
      assetId: string | number[],
      _event: string | number[],
      _payoff: number | string
    ): TransactionObject<void>;

    owner(): TransactionObject<string>;

    popNextScheduledEvent(
      assetId: string | number[]
    ): TransactionObject<string>;

    popPendingEvent(assetId: string | number[]): TransactionObject<string>;

    pushPendingEvent(
      assetId: string | number[],
      pendingEvent: string | number[]
    ): TransactionObject<void>;

    registerAsset(
      assetId: string | number[],
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        scalingEffect: number | string;
        feeBasis: number | string;
        currency: string;
        settlementCurrency: string;
        marketObjectCodeRateReset: string | number[];
        contractDealDate: number | string;
        statusDate: number | string;
        initialExchangeDate: number | string;
        maturityDate: number | string;
        issueDate: number | string;
        purchaseDate: number | string;
        capitalizationEndDate: number | string;
        cycleAnchorDateOfInterestPayment: number | string;
        cycleAnchorDateOfRateReset: number | string;
        cycleAnchorDateOfScalingIndex: number | string;
        cycleAnchorDateOfFee: number | string;
        cycleAnchorDateOfPrincipalRedemption: number | string;
        notionalPrincipal: number | string;
        nominalInterestRate: number | string;
        accruedInterest: number | string;
        rateMultiplier: number | string;
        rateSpread: number | string;
        nextResetRate: number | string;
        feeRate: number | string;
        feeAccrued: number | string;
        delinquencyRate: number | string;
        premiumDiscountAtIED: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        nextPrincipalRedemptionPayment: number | string;
        lifeCap: number | string;
        lifeFloor: number | string;
        periodCap: number | string;
        periodFloor: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfInterestPayment: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        cycleOfRateReset: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        cycleOfScalingIndex: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        cycleOfPrincipalRedemption: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
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
      schedule: (string | number[])[],
      ownership: {
        creatorObligor: string;
        creatorBeneficiary: string;
        counterpartyObligor: string;
        counterpartyBeneficiary: string;
      },
      engine: string,
      actor: string,
      admin: string
    ): TransactionObject<void>;

    renounceOwnership(): TransactionObject<void>;

    revokeAccess(
      assetId: string | number[],
      methodSignature: string | number[],
      account: string
    ): TransactionObject<void>;

    setActor(
      assetId: string | number[],
      actor: string
    ): TransactionObject<void>;

    setCounterpartyBeneficiary(
      assetId: string | number[],
      newCounterpartyBeneficiary: string
    ): TransactionObject<void>;

    setCounterpartyObligor(
      assetId: string | number[],
      newCounterpartyObligor: string
    ): TransactionObject<void>;

    setCreatorBeneficiary(
      assetId: string | number[],
      newCreatorBeneficiary: string
    ): TransactionObject<void>;

    setCreatorObligor(
      assetId: string | number[],
      newCreatorObligor: string
    ): TransactionObject<void>;

    setEngine(
      assetId: string | number[],
      engine: string
    ): TransactionObject<void>;

    setFinalizedState(
      assetId: string | number[],
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
      }
    ): TransactionObject<void>;

    setState(
      assetId: string | number[],
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
      }
    ): TransactionObject<void>;

    setTerms(
      assetId: string | number[],
      terms: {
        contractType: number | string;
        calendar: number | string;
        contractRole: number | string;
        dayCountConvention: number | string;
        businessDayConvention: number | string;
        endOfMonthConvention: number | string;
        scalingEffect: number | string;
        feeBasis: number | string;
        currency: string;
        settlementCurrency: string;
        marketObjectCodeRateReset: string | number[];
        contractDealDate: number | string;
        statusDate: number | string;
        initialExchangeDate: number | string;
        maturityDate: number | string;
        issueDate: number | string;
        purchaseDate: number | string;
        capitalizationEndDate: number | string;
        cycleAnchorDateOfInterestPayment: number | string;
        cycleAnchorDateOfRateReset: number | string;
        cycleAnchorDateOfScalingIndex: number | string;
        cycleAnchorDateOfFee: number | string;
        cycleAnchorDateOfPrincipalRedemption: number | string;
        notionalPrincipal: number | string;
        nominalInterestRate: number | string;
        accruedInterest: number | string;
        rateMultiplier: number | string;
        rateSpread: number | string;
        nextResetRate: number | string;
        feeRate: number | string;
        feeAccrued: number | string;
        delinquencyRate: number | string;
        premiumDiscountAtIED: number | string;
        priceAtPurchaseDate: number | string;
        priceAtTerminationDate: number | string;
        nextPrincipalRedemptionPayment: number | string;
        lifeCap: number | string;
        lifeFloor: number | string;
        periodCap: number | string;
        periodFloor: number | string;
        gracePeriod: { i: number | string; p: number | string; isSet: boolean };
        delinquencyPeriod: {
          i: number | string;
          p: number | string;
          isSet: boolean;
        };
        cycleOfInterestPayment: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        cycleOfRateReset: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        cycleOfScalingIndex: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        cycleOfFee: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
        cycleOfPrincipalRedemption: {
          i: number | string;
          p: number | string;
          s: number | string;
          isSet: boolean;
        };
      }
    ): TransactionObject<void>;

    transferOwnership(newOwner: string): TransactionObject<void>;
  };
  events: {
    GrantedAccess: ContractEvent<{
      assetId: string;
      account: string;
      methodSignature: string;
      0: string;
      1: string;
      2: string;
    }>;
    OwnershipTransferred: ContractEvent<{
      previousOwner: string;
      newOwner: string;
      0: string;
      1: string;
    }>;
    RegisteredAsset: ContractEvent<string>;
    RevokedAccess: ContractEvent<{
      assetId: string;
      account: string;
      methodSignature: string;
      0: string;
      1: string;
      2: string;
    }>;
    UpdatedActor: ContractEvent<{
      assetId: string;
      prevActor: string;
      newActor: string;
      0: string;
      1: string;
      2: string;
    }>;
    UpdatedBeneficiary: ContractEvent<{
      assetId: string;
      prevBeneficiary: string;
      newBeneficiary: string;
      0: string;
      1: string;
      2: string;
    }>;
    UpdatedEngine: ContractEvent<{
      assetId: string;
      prevEngine: string;
      newEngine: string;
      0: string;
      1: string;
      2: string;
    }>;
    UpdatedFinalizedState: ContractEvent<{
      assetId: string;
      statusDate: string;
      0: string;
      1: string;
    }>;
    UpdatedObligor: ContractEvent<{
      assetId: string;
      prevObligor: string;
      newObligor: string;
      0: string;
      1: string;
      2: string;
    }>;
    UpdatedState: ContractEvent<{
      assetId: string;
      statusDate: string;
      0: string;
      1: string;
    }>;
    UpdatedTerms: ContractEvent<string>;
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}
