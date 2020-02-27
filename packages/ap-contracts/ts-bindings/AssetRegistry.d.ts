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

export class AssetRegistry extends Contract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  );
  clone(): AssetRegistry;
  methods: {
    getState(
      assetId: string | number[]
    ): TransactionObject<{
      contractPerformance: string;
      statusDate: string;
      nonPerformingDate: string;
      maturityDate: string;
      executionDate: string;
      notionalPrincipal: string;
      accruedInterest: string;
      feeAccrued: string;
      nominalInterestRate: string;
      interestScalingMultiplier: string;
      notionalScalingMultiplier: string;
      nextPrincipalRedemptionPayment: string;
      executionAmount: string;
    }>;

    getTemplateId(assetId: string | number[]): TransactionObject<string>;

    setState(
      assetId: string | number[],
      state: {
        contractPerformance: number | string;
        statusDate: number | string;
        nonPerformingDate: number | string;
        maturityDate: number | string;
        executionDate: number | string;
        notionalPrincipal: number | string;
        accruedInterest: number | string;
        feeAccrued: number | string;
        nominalInterestRate: number | string;
        interestScalingMultiplier: number | string;
        notionalScalingMultiplier: number | string;
        nextPrincipalRedemptionPayment: number | string;
        executionAmount: number | string;
      }
    ): TransactionObject<void>;

    setFinalizedState(
      assetId: string | number[],
      state: {
        contractPerformance: number | string;
        statusDate: number | string;
        nonPerformingDate: number | string;
        maturityDate: number | string;
        executionDate: number | string;
        notionalPrincipal: number | string;
        accruedInterest: number | string;
        feeAccrued: number | string;
        nominalInterestRate: number | string;
        interestScalingMultiplier: number | string;
        notionalScalingMultiplier: number | string;
        nextPrincipalRedemptionPayment: number | string;
        executionAmount: number | string;
      }
    ): TransactionObject<void>;

    setCounterpartyBeneficiary(
      assetId: string | number[],
      newCounterpartyBeneficiary: string
    ): TransactionObject<void>;

    deriveLifecycleTermsFromCustomTermsAndTemplateTerms(
      templateTerms: {
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
        notionalPrincipal: number | string;
        nominalInterestRate: number | string;
        feeAccrued: number | string;
        accruedInterest: number | string;
        rateMultiplier: number | string;
        rateSpread: number | string;
        feeRate: number | string;
        nextResetRate: number | string;
        penaltyRate: number | string;
        premiumDiscountAtIED: number | string;
        priceAtPurchaseDate: number | string;
        nextPrincipalRedemptionPayment: number | string;
        coverageOfCreditEnhancement: number | string;
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
      },
      terms: {
        anchorDate: number | string;
        overwrittenAttributesMap: number | string;
        overwrittenTerms: {
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
          statusDate: number | string;
          maturityDate: number | string;
          notionalPrincipal: number | string;
          nominalInterestRate: number | string;
          feeAccrued: number | string;
          accruedInterest: number | string;
          rateMultiplier: number | string;
          rateSpread: number | string;
          feeRate: number | string;
          nextResetRate: number | string;
          penaltyRate: number | string;
          premiumDiscountAtIED: number | string;
          priceAtPurchaseDate: number | string;
          nextPrincipalRedemptionPayment: number | string;
          coverageOfCreditEnhancement: number | string;
          lifeCap: number | string;
          lifeFloor: number | string;
          periodCap: number | string;
          periodFloor: number | string;
          gracePeriod: {
            i: number | string;
            p: number | string;
            isSet: boolean;
          };
          delinquencyPeriod: {
            i: number | string;
            p: number | string;
            isSet: boolean;
          };
          contractReference_1: {
            object: string | number[];
            contractReferenceType: number | string;
            contractReferenceRole: number | string;
          };
          contractReference_2: {
            object: string | number[];
            contractReferenceType: number | string;
            contractReferenceRole: number | string;
          };
        };
      }
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
      statusDate: string;
      maturityDate: string;
      notionalPrincipal: string;
      nominalInterestRate: string;
      feeAccrued: string;
      accruedInterest: string;
      rateMultiplier: string;
      rateSpread: string;
      feeRate: string;
      nextResetRate: string;
      penaltyRate: string;
      premiumDiscountAtIED: string;
      priceAtPurchaseDate: string;
      nextPrincipalRedemptionPayment: string;
      coverageOfCreditEnhancement: string;
      lifeCap: string;
      lifeFloor: string;
      periodCap: string;
      periodFloor: string;
      gracePeriod: { i: string; p: string; isSet: boolean };
      delinquencyPeriod: { i: string; p: string; isSet: boolean };
      contractReference_1: {
        object: string;
        contractReferenceType: string;
        contractReferenceRole: string;
      };
      contractReference_2: {
        object: string;
        contractReferenceType: string;
        contractReferenceRole: string;
      };
    }>;

    getFinalizedState(
      assetId: string | number[]
    ): TransactionObject<{
      contractPerformance: string;
      statusDate: string;
      nonPerformingDate: string;
      maturityDate: string;
      executionDate: string;
      notionalPrincipal: string;
      accruedInterest: string;
      feeAccrued: string;
      nominalInterestRate: string;
      interestScalingMultiplier: string;
      notionalScalingMultiplier: string;
      nextPrincipalRedemptionPayment: string;
      executionAmount: string;
    }>;

    incrementScheduleIndex(assetId: string | number[]): TransactionObject<void>;

    getActorAddress(assetId: string | number[]): TransactionObject<string>;

    getNextEvent(assetId: string | number[]): TransactionObject<string>;

    setCreatorBeneficiary(
      assetId: string | number[],
      newCreatorBeneficiary: string
    ): TransactionObject<void>;

    getAnchorDate(assetId: string | number[]): TransactionObject<string>;

    decodeCollateralObject(
      object: string | number[]
    ): TransactionObject<{
      0: string;
      1: string;
    }>;

    encodeCollateralAsObject(
      collateralToken: string,
      collateralAmount: number | string
    ): TransactionObject<string>;

    getTerms(
      assetId: string | number[]
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
      statusDate: string;
      maturityDate: string;
      notionalPrincipal: string;
      nominalInterestRate: string;
      feeAccrued: string;
      accruedInterest: string;
      rateMultiplier: string;
      rateSpread: string;
      feeRate: string;
      nextResetRate: string;
      penaltyRate: string;
      premiumDiscountAtIED: string;
      priceAtPurchaseDate: string;
      nextPrincipalRedemptionPayment: string;
      coverageOfCreditEnhancement: string;
      lifeCap: string;
      lifeFloor: string;
      periodCap: string;
      periodFloor: string;
      gracePeriod: { i: string; p: string; isSet: boolean };
      delinquencyPeriod: { i: string; p: string; isSet: boolean };
      contractReference_1: {
        object: string;
        contractReferenceType: string;
        contractReferenceRole: string;
      };
      contractReference_2: {
        object: string;
        contractReferenceType: string;
        contractReferenceRole: string;
      };
    }>;

    ONE_POINT_ZERO(): TransactionObject<string>;

    decodeEvent(
      _event: string | number[]
    ): TransactionObject<{
      0: string;
      1: string;
    }>;

    getEpochOffset(eventType: number | string): TransactionObject<string>;

    setBeneficiaryForCashflowId(
      assetId: string | number[],
      cashflowId: number | string,
      beneficiary: string
    ): TransactionObject<void>;

    computeEventTimeForEvent(
      _event: string | number[],
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
        statusDate: number | string;
        maturityDate: number | string;
        notionalPrincipal: number | string;
        nominalInterestRate: number | string;
        feeAccrued: number | string;
        accruedInterest: number | string;
        rateMultiplier: number | string;
        rateSpread: number | string;
        feeRate: number | string;
        nextResetRate: number | string;
        penaltyRate: number | string;
        premiumDiscountAtIED: number | string;
        priceAtPurchaseDate: number | string;
        nextPrincipalRedemptionPayment: number | string;
        coverageOfCreditEnhancement: number | string;
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
        contractReference_1: {
          object: string | number[];
          contractReferenceType: number | string;
          contractReferenceRole: number | string;
        };
        contractReference_2: {
          object: string | number[];
          contractReferenceType: number | string;
          contractReferenceRole: number | string;
        };
      }
    ): TransactionObject<string>;

    templateRegistry(): TransactionObject<string>;

    PRECISION(): TransactionObject<string>;

    getScheduleIndex(assetId: string | number[]): TransactionObject<string>;

    encodeEvent(
      eventType: number | string,
      scheduleTime: number | string
    ): TransactionObject<string>;

    getOwnership(
      assetId: string | number[]
    ): TransactionObject<{
      creatorObligor: string;
      creatorBeneficiary: string;
      counterpartyObligor: string;
      counterpartyBeneficiary: string;
    }>;

    getCashflowBeneficiary(
      assetId: string | number[],
      cashflowId: number | string
    ): TransactionObject<string>;

    getEngineAddress(assetId: string | number[]): TransactionObject<string>;

    registerAsset(
      assetId: string | number[],
      ownership: {
        creatorObligor: string;
        creatorBeneficiary: string;
        counterpartyObligor: string;
        counterpartyBeneficiary: string;
      },
      templateId: string | number[],
      customTerms: {
        anchorDate: number | string;
        overwrittenAttributesMap: number | string;
        overwrittenTerms: {
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
          statusDate: number | string;
          maturityDate: number | string;
          notionalPrincipal: number | string;
          nominalInterestRate: number | string;
          feeAccrued: number | string;
          accruedInterest: number | string;
          rateMultiplier: number | string;
          rateSpread: number | string;
          feeRate: number | string;
          nextResetRate: number | string;
          penaltyRate: number | string;
          premiumDiscountAtIED: number | string;
          priceAtPurchaseDate: number | string;
          nextPrincipalRedemptionPayment: number | string;
          coverageOfCreditEnhancement: number | string;
          lifeCap: number | string;
          lifeFloor: number | string;
          periodCap: number | string;
          periodFloor: number | string;
          gracePeriod: {
            i: number | string;
            p: number | string;
            isSet: boolean;
          };
          delinquencyPeriod: {
            i: number | string;
            p: number | string;
            isSet: boolean;
          };
          contractReference_1: {
            object: string | number[];
            contractReferenceType: number | string;
            contractReferenceRole: number | string;
          };
          contractReference_2: {
            object: string | number[];
            contractReferenceType: number | string;
            contractReferenceRole: number | string;
          };
        };
      },
      state: {
        contractPerformance: number | string;
        statusDate: number | string;
        nonPerformingDate: number | string;
        maturityDate: number | string;
        executionDate: number | string;
        notionalPrincipal: number | string;
        accruedInterest: number | string;
        feeAccrued: number | string;
        nominalInterestRate: number | string;
        interestScalingMultiplier: number | string;
        notionalScalingMultiplier: number | string;
        nextPrincipalRedemptionPayment: number | string;
        executionAmount: number | string;
      },
      engine: string,
      actor: string
    ): TransactionObject<void>;
  };
  events: {
    RegisteredAsset: ContractEvent<string>;
    UpdatedBeneficiary: ContractEvent<{
      assetId: string;
      oldBeneficiary: string;
      newBeneficiary: string;
      0: string;
      1: string;
      2: string;
    }>;
    UpdatedCashflowBeneficiary: ContractEvent<{
      assetId: string;
      cashflowId: string;
      oldBeneficiary: string;
      newBeneficiary: string;
      0: string;
      1: string;
      2: string;
      3: string;
    }>;
    IncrementedScheduleIndex: ContractEvent<{
      assetId: string;
      scheduleIndex: string;
      0: string;
      1: string;
    }>;
    UpdatedState: ContractEvent<{
      assetId: string;
      statusDate: string;
      0: string;
      1: string;
    }>;
    UpdatedFinalizedState: ContractEvent<{
      assetId: string;
      statusDate: string;
      0: string;
      1: string;
    }>;
    allEvents: (
      options?: EventOptions,
      cb?: Callback<EventLog>
    ) => EventEmitter;
  };
}
