import * as web3Utils from 'web3-utils';
import BN from 'bn.js';

import {
  Terms,
  State,
  CustomTerms,
  TemplateTerms,
  LifecycleTerms,
  GeneratingTerms,
  ZERO_OFFSET
} from '../types';


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

export const web3ResponseToLifecycleTerms = (web3Response: any): LifecycleTerms => (
  associativeArrayToObject(web3Response) as LifecycleTerms
);

export const web3ResponseToTemplateTerms = (web3Response: any): TemplateTerms => (
  associativeArrayToObject(web3Response) as TemplateTerms
);

export const web3ResponseToState = (web3Response: any): State => (
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
  const anchorDate = terms.contractDealDate;

  return {
    scalingEffect: terms.scalingEffect,
  
    contractDealDate: normalizeDate(anchorDate, terms.contractDealDate),
    statusDate: normalizeDate(anchorDate, terms.statusDate),
    initialExchangeDate: normalizeDate(anchorDate, terms.initialExchangeDate),
    maturityDate: normalizeDate(anchorDate, terms.maturityDate),
    terminationDate: normalizeDate(anchorDate, terms.terminationDate),
    purchaseDate: normalizeDate(anchorDate, terms.purchaseDate),
    capitalizationEndDate: normalizeDate(anchorDate, terms.capitalizationEndDate),
    cycleAnchorDateOfInterestPayment: normalizeDate(anchorDate, terms.cycleAnchorDateOfInterestPayment),
    cycleAnchorDateOfRateReset: normalizeDate(anchorDate, terms.cycleAnchorDateOfRateReset),
    cycleAnchorDateOfScalingIndex: normalizeDate(anchorDate, terms.cycleAnchorDateOfScalingIndex),
    cycleAnchorDateOfFee: normalizeDate(anchorDate, terms.cycleAnchorDateOfFee),
    cycleAnchorDateOfPrincipalRedemption: normalizeDate(anchorDate, terms.cycleAnchorDateOfPrincipalRedemption),
  
    nominalInterestRate: terms.nominalInterestRate,
  
    cycleOfInterestPayment: terms.cycleOfInterestPayment,
    cycleOfRateReset: terms.cycleOfRateReset,
    cycleOfScalingIndex: terms.cycleOfScalingIndex,
    cycleOfFee: terms.cycleOfFee,
    cycleOfPrincipalRedemption: terms.cycleOfPrincipalRedemption,
  
    gracePeriod: terms.gracePeriod,
    delinquencyPeriod: terms.delinquencyPeriod
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

export const deriveLifecycleTermsFromTemplateTermsAndCustomTerms = (
  templateTerms: TemplateTerms,
  customTerms: CustomTerms
): LifecycleTerms => ({
  calendar: templateTerms.calendar,
  contractRole: templateTerms.contractRole,
  dayCountConvention: templateTerms.dayCountConvention,
  businessDayConvention: templateTerms.businessDayConvention,
  endOfMonthConvention: templateTerms.endOfMonthConvention,
  scalingEffect: templateTerms.scalingEffect,
  penaltyType: templateTerms.penaltyType,
  feeBasis: templateTerms.feeBasis,
  creditEventTypeCovered: templateTerms.creditEventTypeCovered,

  contractReference_1: customTerms.contractReference_1,
  contractReference_2: customTerms.contractReference_2,

  currency: templateTerms.currency,
  settlementCurrency: templateTerms.settlementCurrency,

  marketObjectCodeRateReset: templateTerms.marketObjectCodeRateReset,

  statusDate: denormalizeDate(customTerms.anchorDate, templateTerms.statusDateOffset),
  maturityDate: denormalizeDate(customTerms.anchorDate, templateTerms.maturityDateOffset),

  notionalPrincipal: customTerms.notionalPrincipal,
  nominalInterestRate: customTerms.nominalInterestRate,
  feeAccrued: templateTerms.feeAccrued,
  accruedInterest: templateTerms.accruedInterest,
  rateMultiplier: templateTerms.rateMultiplier,
  rateSpread: customTerms.rateSpread,
  feeRate: templateTerms.feeRate,
  nextResetRate: templateTerms.nextResetRate,
  penaltyRate: templateTerms.penaltyRate,
  premiumDiscountAtIED: customTerms.premiumDiscountAtIED,
  priceAtPurchaseDate: templateTerms.priceAtPurchaseDate,
  nextPrincipalRedemptionPayment: templateTerms.nextPrincipalRedemptionPayment,
  coverageOfCreditEnhancement: customTerms.coverageOfCreditEnhancement,

  gracePeriod: templateTerms.gracePeriod,
  delinquencyPeriod: templateTerms.delinquencyPeriod,

  lifeCap: customTerms.lifeCap,
  lifeFloor: customTerms.lifeFloor,
  periodCap: templateTerms.periodCap,
  periodFloor: templateTerms.periodFloor
});

// derive a normalized date (date offset) by subtracting the anchor date from an (absolute) date value
// used for deriving TemplateTerms and for deriving normalized GeneratingTerms for generating template schedules
export const normalizeDate = (anchorDate: number | string, date: number | string): string => {
  // not set date value, do not normalize
  if (Number(date) === 0) { return '0'; }

  const normalizedDate = String(Number(date) - Number(anchorDate));
  // anchorDate is greater than date to normalize
  if (Number(normalizedDate) < 0) { throw new Error('Normalized date is negative'); }
  // date value is set, set to ZERO_OFFSET to indicate that value is set
  if (Number(normalizedDate) === 0) { return ZERO_OFFSET; }

  return normalizedDate;
};

// derive the actual date value from a date offset by adding anchor date
// used off-chain for computing deriving terms from TemplateTerms and TemplateSchedules
export const denormalizeDate = (anchorDate: number | string, dateOffset: number | string): string => {
  // interpret offset == 0 as not set date value
  if (Number(dateOffset) === 0) { return '0'; }
  // interpret offset == ZERO_OFFSET as date value equal to anchor date
  if (String(dateOffset) === ZERO_OFFSET) { return String(anchorDate); }
  // shift date offsets not equal to ZERO_OFFSET
  return String(Number(anchorDate) + Number(dateOffset));
};

const associativeArrayToObject = (arr: any): object => ({ 
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
