import * as web3Utils from 'web3-utils';
import BN from 'bn.js';

import { Terms, State, CustomTerms, TemplateTerms, LifecycleTerms, GeneratingTerms } from '../types';


export const toHex = (mixed: any): any => (
  (String(mixed).startsWith('0x')) ? mixed : web3Utils.toHex(mixed)
);

export const hexToUtf8 = (hex: string): any => (
  web3Utils.hexToAscii(hex)
);

export const toChecksumAddress = (address: string): string => (
  web3Utils.toChecksumAddress(address)
);

export const toPrecision = (number: number | string | BN): string => (
  web3Utils.toWei((typeof number === 'string') ? number : number.toString())
);

export const fromPrecision = (number: number | string | BN): string => (
  web3Utils.fromWei((typeof number === 'string') ? number : number.toString())
);

export const encodeAsBytes32 = (externalData: number | string): string => (
  web3Utils.padLeft(web3Utils.toHex(externalData), 64)
);

export const decodeBytes32AsNumber = (bytes32Data: string): string => (
  web3Utils.hexToNumberString(bytes32Data)
);

export const web3ResponseToLifecycleTerms = (web3Response: [any]): LifecycleTerms => (
  associativeArrayToObject(web3Response) as LifecycleTerms
);

export const web3ResponseToState = (web3Response: [any]): State => (
  associativeArrayToObject(web3Response) as State
);

export const deriveLifecycleTerms = (terms: Terms): LifecycleTerms => ({
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  scalingEffect: terms.scalingEffect,
  penaltyType: terms.penaltyType,
  feeBasis: terms.feeBasis,
  creditEventTypeCovered: terms.creditEventTypeCovered,

  contractReference_1: terms.contractReference_1,
  contractReference_2: terms.contractReference_2,

  currency: terms.currency,
  settlementCurrency: terms.settlementCurrency,

  marketObjectCodeRateReset: terms.marketObjectCodeRateReset,

  statusDate: terms.statusDate,
  maturityDate: terms.maturityDate,

  notionalPrincipal: terms.notionalPrincipal,
  nominalInterestRate: terms.nominalInterestRate,
  feeAccrued: terms.feeAccrued,
  accruedInterest: terms.accruedInterest,
  rateMultiplier: terms.rateMultiplier,
  rateSpread: terms.rateSpread,
  feeRate: terms.feeRate,
  nextResetRate: terms.nextResetRate,
  penaltyRate: terms.penaltyRate,
  premiumDiscountAtIED: terms.premiumDiscountAtIED,
  priceAtPurchaseDate: terms.priceAtPurchaseDate,
  nextPrincipalRedemptionPayment: terms.nextPrincipalRedemptionPayment,
  coverageOfCreditEnhancement: terms.coverageOfCreditEnhancement,

  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,

  lifeCap: terms.lifeCap,
  lifeFloor: terms.lifeFloor,
  periodCap: terms.periodCap,
  periodFloor: terms.periodFloor
});

export function deriveGeneratingTerms (terms: Terms): GeneratingTerms {
  const normalizedTerms = convertDatesToOffsets(terms);

  return {
    scalingEffect: normalizedTerms.scalingEffect,
  
    contractDealDate: normalizedTerms.contractDealDate,
    statusDate: normalizedTerms.statusDate,
    initialExchangeDate: normalizedTerms.initialExchangeDate,
    maturityDate: normalizedTerms.maturityDate,
    terminationDate: normalizedTerms.terminationDate,
    purchaseDate: normalizedTerms.purchaseDate,
    capitalizationEndDate: normalizedTerms.capitalizationEndDate,
    cycleAnchorDateOfInterestPayment: normalizedTerms.cycleAnchorDateOfInterestPayment,
    cycleAnchorDateOfRateReset: normalizedTerms.cycleAnchorDateOfRateReset,
    cycleAnchorDateOfScalingIndex: normalizedTerms.cycleAnchorDateOfScalingIndex,
    cycleAnchorDateOfFee: normalizedTerms.cycleAnchorDateOfFee,
    cycleAnchorDateOfPrincipalRedemption: normalizedTerms.cycleAnchorDateOfPrincipalRedemption,
  
    nominalInterestRate: normalizedTerms.nominalInterestRate,
  
    cycleOfInterestPayment: normalizedTerms.cycleOfInterestPayment,
    cycleOfRateReset: normalizedTerms.cycleOfRateReset,
    cycleOfScalingIndex: normalizedTerms.cycleOfScalingIndex,
    cycleOfFee: normalizedTerms.cycleOfFee,
    cycleOfPrincipalRedemption: normalizedTerms.cycleOfPrincipalRedemption,
  
    gracePeriod: normalizedTerms.gracePeriod,
    delinquencyPeriod: normalizedTerms.delinquencyPeriod
  };
}

export const deriveTemplateTerms = (terms: Terms): TemplateTerms => ({
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  scalingEffect: terms.scalingEffect,
  penaltyType: terms.penaltyType,
  feeBasis: terms.feeBasis,
  creditEventTypeCovered: terms.creditEventTypeCovered,
  
  currency: terms.currency,
  settlementCurrency: terms.settlementCurrency,
  
  marketObjectCodeRateReset: terms.marketObjectCodeRateReset,
  
  statusDateOffset: normalizeDate(terms.contractDealDate, terms.statusDate),
  maturityDateOffset: normalizeDate(terms.contractDealDate, terms.maturityDate),
  
  feeAccrued: terms.feeAccrued,
  accruedInterest: terms.accruedInterest,
  rateMultiplier: terms.rateMultiplier,
  feeRate: terms.feeRate,
  nextResetRate: terms.nextResetRate,
  penaltyRate: terms.penaltyRate,
  priceAtPurchaseDate: terms.priceAtPurchaseDate,
  nextPrincipalRedemptionPayment: terms.nextPrincipalRedemptionPayment,
  
  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,
  
  periodCap: terms.periodCap,
  periodFloor: terms.periodFloor
});

export const deriveCustomTerms = (terms: Terms): CustomTerms => ({
  anchorDate: terms.contractDealDate,
  notionalPrincipal: terms.notionalPrincipal,
  nominalInterestRate: terms.nominalInterestRate,
  premiumDiscountAtIED: terms.premiumDiscountAtIED,
  rateSpread: terms.rateSpread,
  lifeCap: terms.lifeCap,
  lifeFloor: terms.lifeFloor,
  coverageOfCreditEnhancement: terms.coverageOfCreditEnhancement,
  contractReference_1: terms.contractReference_1,
  contractReference_2: terms.contractReference_2
});

function convertDatesToOffsets (terms: Terms): Terms {
  const anchorDate = terms.contractDealDate;

  terms.contractDealDate = 0;
  terms.statusDate = 0;
  terms.initialExchangeDate = normalizeDate(anchorDate, terms.initialExchangeDate); 
  terms.maturityDate = normalizeDate(anchorDate, terms.maturityDate)
  terms.terminationDate = normalizeDate(anchorDate, terms.terminationDate)
  terms.purchaseDate = normalizeDate(anchorDate, terms.purchaseDate)
  terms.capitalizationEndDate = normalizeDate(anchorDate, terms.capitalizationEndDate)
  terms.cycleAnchorDateOfInterestPayment = normalizeDate(anchorDate, terms.cycleAnchorDateOfInterestPayment)
  terms.cycleAnchorDateOfRateReset = normalizeDate(anchorDate, terms.cycleAnchorDateOfRateReset)
  terms.cycleAnchorDateOfScalingIndex = normalizeDate(anchorDate, terms.cycleAnchorDateOfScalingIndex)
  terms.cycleAnchorDateOfFee = normalizeDate(anchorDate, terms.cycleAnchorDateOfFee)
  terms.cycleAnchorDateOfPrincipalRedemption = normalizeDate(anchorDate, terms.cycleAnchorDateOfPrincipalRedemption)

  return terms;
}

const normalizeDate = (anchorDate: number | string, date: number | string): string => (
  (Number(date) > Number(anchorDate)) ? String(Number(date) - Number(anchorDate)) : '0'
);

const associativeArrayToObject = (arr: [any]): object => ({ 
  ...Object.keys(arr).reduce((obj: object, element: any): object => (
    (!Number.isInteger(Number(element)))
      ? { 
        ...obj,
        [element]: (Array.isArray(arr[element]))
          ? associativeArrayToObject(arr[element])
          : arr[element]
      }
      : obj
  ), {})
});
