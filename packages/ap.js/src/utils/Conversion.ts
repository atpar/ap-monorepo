import * as web3Utils from 'web3-utils';
import BN from 'bn.js';

import {
  Terms,
  State,
  CustomTerms,
  TemplateTerms,
  LifecycleTerms,
  GeneratingTerms,
  ZERO_OFFSET,
  ExtendedTemplateTerms
} from '../types';

import { EMPTY_LIFECYCLE_TERMS } from './Constants';


export const isoToUnix = (date: string): string => (
  String((new Date(date + 'Z')).getTime() / 1000)
);

export const unixToISO = (unix: string | number): string => (
  new Date(Number(unix) * 1000).toISOString()
);

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

export const isOverwritten = (overwrittenAttributesMap: string, index: string | number): boolean => {
  const bin = String((Number(overwrittenAttributesMap) >>> 0).toString(2).padStart(256, '0'));
  return bin.charAt(Number(index)) === '1';
};

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
  lifeCap: terms.lifeCap,
  lifeFloor: terms.lifeFloor,
  periodCap: terms.periodCap,
  periodFloor: terms.periodFloor,

  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,

  contractReference_1: terms.contractReference_1,
  contractReference_2: terms.contractReference_2,
});

export function deriveGeneratingTerms (terms: Terms): GeneratingTerms {
  const anchorDate = terms.contractDealDate;

  return {
    scalingEffect: terms.scalingEffect,
  
    contractDealDate: normalizeDate(anchorDate, terms.contractDealDate),
    statusDate: normalizeDate(anchorDate, terms.statusDate),
    initialExchangeDate: normalizeDate(anchorDate, terms.initialExchangeDate),
    maturityDate: normalizeDate(anchorDate, terms.maturityDate),
    purchaseDate: normalizeDate(anchorDate, terms.purchaseDate),
    capitalizationEndDate: normalizeDate(anchorDate, terms.capitalizationEndDate),
    cycleAnchorDateOfInterestPayment: normalizeDate(anchorDate, terms.cycleAnchorDateOfInterestPayment),
    cycleAnchorDateOfRateReset: normalizeDate(anchorDate, terms.cycleAnchorDateOfRateReset),
    cycleAnchorDateOfScalingIndex: normalizeDate(anchorDate, terms.cycleAnchorDateOfScalingIndex),
    cycleAnchorDateOfFee: normalizeDate(anchorDate, terms.cycleAnchorDateOfFee),
    cycleAnchorDateOfPrincipalRedemption: normalizeDate(anchorDate, terms.cycleAnchorDateOfPrincipalRedemption),
  
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
  lifeCap: terms.lifeCap,
  lifeFloor: terms.lifeFloor,
  periodCap: terms.periodCap,
  periodFloor: terms.periodFloor,
  
  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod
});

export const deriveCustomTerms = (terms: Terms): CustomTerms => {
  const templateTerms = deriveTemplateTerms(terms);
  const anchorDate = terms.contractDealDate;
  const overwrittenAttributes = {};
  Object.keys(terms)
    .filter((attribute): boolean => {
      return (
        // @ts-ignore
        !templateTerms[(attribute.includes('Date') ? attribute + 'Offset' : attribute)]
        // @ts-ignore
        && EMPTY_LIFECYCLE_TERMS[attribute]
        // @ts-ignore
        && EMPTY_LIFECYCLE_TERMS[attribute] != terms[attribute]
      );
    })
    .map((attribute): void => { 
      // @ts-ignore
      overwrittenAttributes[attribute] = terms[attribute] 
    });

  return deriveCustomTermsFromOverwrittenAttributesAndAnchorDate(overwrittenAttributes, anchorDate);
};

// used within ap-contracts
export const deriveLifecycleTermsFromTemplateTermsAndCustomTerms = (
  templateTerms: TemplateTerms,
  { anchorDate, overwrittenAttributesMap, overwrittenTerms }: CustomTerms
): LifecycleTerms => ({
  calendar: isOverwritten(overwrittenAttributesMap, 0) ? overwrittenTerms.calendar : templateTerms.calendar,
  contractRole: isOverwritten(overwrittenAttributesMap, 1) ? overwrittenTerms.contractRole : templateTerms.contractRole,
  dayCountConvention: isOverwritten(overwrittenAttributesMap, 2) ? overwrittenTerms.dayCountConvention : templateTerms.dayCountConvention,
  businessDayConvention: isOverwritten(overwrittenAttributesMap, 3) ? overwrittenTerms.businessDayConvention : templateTerms.businessDayConvention,
  endOfMonthConvention: isOverwritten(overwrittenAttributesMap, 4) ? overwrittenTerms.endOfMonthConvention : templateTerms.endOfMonthConvention,
  scalingEffect: isOverwritten(overwrittenAttributesMap, 5) ? overwrittenTerms.scalingEffect : templateTerms.scalingEffect,
  penaltyType: isOverwritten(overwrittenAttributesMap, 6) ? overwrittenTerms.penaltyType : templateTerms.penaltyType,
  feeBasis: isOverwritten(overwrittenAttributesMap, 7) ? overwrittenTerms.feeBasis : templateTerms.feeBasis,
  creditEventTypeCovered: isOverwritten(overwrittenAttributesMap, 8) ? overwrittenTerms.creditEventTypeCovered : templateTerms.creditEventTypeCovered,

  currency: isOverwritten(overwrittenAttributesMap, 9) ? overwrittenTerms.currency : templateTerms.currency,
  settlementCurrency: isOverwritten(overwrittenAttributesMap, 10) ? overwrittenTerms.settlementCurrency : templateTerms.settlementCurrency,

  marketObjectCodeRateReset: isOverwritten(overwrittenAttributesMap, 11) ? overwrittenTerms.marketObjectCodeRateReset : templateTerms.marketObjectCodeRateReset,

  statusDate: isOverwritten(overwrittenAttributesMap, 12) ? overwrittenTerms.statusDate : denormalizeDate(anchorDate, templateTerms.statusDateOffset),
  maturityDate: isOverwritten(overwrittenAttributesMap, 13) ? overwrittenTerms.maturityDate : denormalizeDate(anchorDate, templateTerms.maturityDateOffset),

  notionalPrincipal: isOverwritten(overwrittenAttributesMap, 14) ? overwrittenTerms.notionalPrincipal : templateTerms.notionalPrincipal,
  nominalInterestRate: isOverwritten(overwrittenAttributesMap, 15) ? overwrittenTerms.nominalInterestRate : templateTerms.nominalInterestRate,
  feeAccrued: isOverwritten(overwrittenAttributesMap, 16) ? overwrittenTerms.feeAccrued : templateTerms.feeAccrued,
  accruedInterest: isOverwritten(overwrittenAttributesMap, 17) ? overwrittenTerms.accruedInterest : templateTerms.accruedInterest,
  rateMultiplier: isOverwritten(overwrittenAttributesMap, 18) ? overwrittenTerms.rateMultiplier : templateTerms.rateMultiplier,
  rateSpread: isOverwritten(overwrittenAttributesMap, 19) ? overwrittenTerms.rateSpread : templateTerms.rateSpread,
  feeRate: isOverwritten(overwrittenAttributesMap, 20) ? overwrittenTerms.feeRate : templateTerms.feeRate,
  nextResetRate: isOverwritten(overwrittenAttributesMap, 21) ? overwrittenTerms.nextResetRate : templateTerms.nextResetRate,
  penaltyRate: isOverwritten(overwrittenAttributesMap, 22) ? overwrittenTerms.penaltyRate : templateTerms.penaltyRate,
  premiumDiscountAtIED: isOverwritten(overwrittenAttributesMap, 23) ? overwrittenTerms.premiumDiscountAtIED : templateTerms.premiumDiscountAtIED,
  priceAtPurchaseDate: isOverwritten(overwrittenAttributesMap, 24) ? overwrittenTerms.priceAtPurchaseDate : templateTerms.priceAtPurchaseDate,
  nextPrincipalRedemptionPayment: isOverwritten(overwrittenAttributesMap, 25) ? overwrittenTerms.nextPrincipalRedemptionPayment : templateTerms.nextPrincipalRedemptionPayment,
  coverageOfCreditEnhancement: isOverwritten(overwrittenAttributesMap, 26) ? overwrittenTerms.coverageOfCreditEnhancement : templateTerms.coverageOfCreditEnhancement,
  lifeCap: isOverwritten(overwrittenAttributesMap, 27) ? overwrittenTerms.lifeCap : templateTerms.lifeCap,
  lifeFloor: isOverwritten(overwrittenAttributesMap, 28) ? overwrittenTerms.lifeFloor : templateTerms.lifeFloor,
  periodCap: isOverwritten(overwrittenAttributesMap, 29) ? overwrittenTerms.periodCap : templateTerms.periodCap,
  periodFloor: isOverwritten(overwrittenAttributesMap, 30) ? overwrittenTerms.periodFloor : templateTerms.periodFloor,

  gracePeriod: isOverwritten(overwrittenAttributesMap, 31) ? overwrittenTerms.gracePeriod : templateTerms.gracePeriod,
  delinquencyPeriod: isOverwritten(overwrittenAttributesMap, 32) ? overwrittenTerms.delinquencyPeriod : templateTerms.delinquencyPeriod,

  contractReference_1: overwrittenTerms.contractReference_1,
  contractReference_2: overwrittenTerms.contractReference_2,
});

// retrieve ACTUS terms from subsets
export const deriveTermsFromExtendedTemplateTermsAndCustomTerms = (
  extendedTemplateTerms: ExtendedTemplateTerms,
  { anchorDate, overwrittenAttributesMap,  overwrittenTerms }: CustomTerms
): Terms => ({
  contractType: extendedTemplateTerms.contractType,
  calendar: isOverwritten(overwrittenAttributesMap, 0) ? overwrittenTerms.calendar : extendedTemplateTerms.calendar,
  contractRole: isOverwritten(overwrittenAttributesMap, 1) ? overwrittenTerms.contractRole : extendedTemplateTerms.contractRole,
  dayCountConvention: isOverwritten(overwrittenAttributesMap, 2) ? overwrittenTerms.dayCountConvention : extendedTemplateTerms.dayCountConvention,
  businessDayConvention: isOverwritten(overwrittenAttributesMap, 3) ? overwrittenTerms.businessDayConvention : extendedTemplateTerms.businessDayConvention,
  endOfMonthConvention: isOverwritten(overwrittenAttributesMap, 4) ? overwrittenTerms.endOfMonthConvention : extendedTemplateTerms.endOfMonthConvention,
  scalingEffect: isOverwritten(overwrittenAttributesMap, 5) ? overwrittenTerms.scalingEffect : extendedTemplateTerms.scalingEffect,
  penaltyType: isOverwritten(overwrittenAttributesMap, 6) ? overwrittenTerms.penaltyType : extendedTemplateTerms.penaltyType,
  feeBasis: isOverwritten(overwrittenAttributesMap, 7) ? overwrittenTerms.feeBasis : extendedTemplateTerms.feeBasis,
  creditEventTypeCovered: isOverwritten(overwrittenAttributesMap, 8) ? overwrittenTerms.creditEventTypeCovered : extendedTemplateTerms.creditEventTypeCovered,

  currency: isOverwritten(overwrittenAttributesMap, 9) ? overwrittenTerms.currency : extendedTemplateTerms.currency,
  settlementCurrency: isOverwritten(overwrittenAttributesMap, 10) ? overwrittenTerms.settlementCurrency : extendedTemplateTerms.settlementCurrency,

  marketObjectCodeRateReset: isOverwritten(overwrittenAttributesMap, 11) ? overwrittenTerms.marketObjectCodeRateReset : extendedTemplateTerms.marketObjectCodeRateReset,

  contractDealDate: denormalizeDate(anchorDate, extendedTemplateTerms.contractDealDateOffset),
  statusDate: isOverwritten(overwrittenAttributesMap, 12) ? overwrittenTerms.statusDate : denormalizeDate(anchorDate, extendedTemplateTerms.statusDateOffset),
  initialExchangeDate: denormalizeDate(anchorDate, extendedTemplateTerms.initialExchangeDateOffset),
  maturityDate: isOverwritten(overwrittenAttributesMap, 13) ? overwrittenTerms.maturityDate : denormalizeDate(anchorDate, extendedTemplateTerms.maturityDateOffset),
  purchaseDate: denormalizeDate(anchorDate, extendedTemplateTerms.purchaseDateOffset),
  capitalizationEndDate: denormalizeDate(anchorDate, extendedTemplateTerms.capitalizationEndDateOffset),
  cycleAnchorDateOfInterestPayment: denormalizeDate(anchorDate, extendedTemplateTerms.cycleAnchorDateOfInterestPaymentOffset),
  cycleAnchorDateOfRateReset: denormalizeDate(anchorDate, extendedTemplateTerms.cycleAnchorDateOfRateResetOffset),
  cycleAnchorDateOfScalingIndex: denormalizeDate(anchorDate, extendedTemplateTerms.cycleAnchorDateOfScalingIndexOffset),
  cycleAnchorDateOfFee: denormalizeDate(anchorDate, extendedTemplateTerms.cycleAnchorDateOfFeeOffset),
  cycleAnchorDateOfPrincipalRedemption: denormalizeDate(anchorDate, extendedTemplateTerms.cycleAnchorDateOfPrincipalRedemptionOffset), 

  notionalPrincipal: isOverwritten(overwrittenAttributesMap, 14) ? overwrittenTerms.notionalPrincipal : extendedTemplateTerms.notionalPrincipal,
  nominalInterestRate: isOverwritten(overwrittenAttributesMap, 15) ? overwrittenTerms.nominalInterestRate : extendedTemplateTerms.nominalInterestRate,
  feeAccrued: isOverwritten(overwrittenAttributesMap, 16) ? overwrittenTerms.feeAccrued : extendedTemplateTerms.feeAccrued,
  accruedInterest: isOverwritten(overwrittenAttributesMap, 17) ? overwrittenTerms.accruedInterest : extendedTemplateTerms.accruedInterest,
  rateMultiplier: isOverwritten(overwrittenAttributesMap, 18) ? overwrittenTerms.rateMultiplier : extendedTemplateTerms.rateMultiplier,
  rateSpread: isOverwritten(overwrittenAttributesMap, 19) ? overwrittenTerms.rateSpread : extendedTemplateTerms.rateSpread,
  feeRate: isOverwritten(overwrittenAttributesMap, 20) ? overwrittenTerms.feeRate : extendedTemplateTerms.feeRate,
  nextResetRate: isOverwritten(overwrittenAttributesMap, 21) ? overwrittenTerms.nextResetRate : extendedTemplateTerms.nextResetRate,
  penaltyRate: isOverwritten(overwrittenAttributesMap, 22) ? overwrittenTerms.penaltyRate : extendedTemplateTerms.penaltyRate,
  premiumDiscountAtIED: isOverwritten(overwrittenAttributesMap, 23) ? overwrittenTerms.premiumDiscountAtIED : extendedTemplateTerms.premiumDiscountAtIED,
  priceAtPurchaseDate: isOverwritten(overwrittenAttributesMap, 24) ? overwrittenTerms.priceAtPurchaseDate : extendedTemplateTerms.priceAtPurchaseDate,
  nextPrincipalRedemptionPayment: isOverwritten(overwrittenAttributesMap, 25) ? overwrittenTerms.nextPrincipalRedemptionPayment : extendedTemplateTerms.nextPrincipalRedemptionPayment,
  coverageOfCreditEnhancement: isOverwritten(overwrittenAttributesMap, 26) ? overwrittenTerms.coverageOfCreditEnhancement : extendedTemplateTerms.coverageOfCreditEnhancement,
  lifeCap: isOverwritten(overwrittenAttributesMap, 27) ? overwrittenTerms.lifeCap : extendedTemplateTerms.lifeCap,
  lifeFloor: isOverwritten(overwrittenAttributesMap, 28) ? overwrittenTerms.lifeFloor : extendedTemplateTerms.lifeFloor,
  periodCap: isOverwritten(overwrittenAttributesMap, 29) ? overwrittenTerms.periodCap : extendedTemplateTerms.periodCap,
  periodFloor: isOverwritten(overwrittenAttributesMap, 30) ? overwrittenTerms.periodFloor : extendedTemplateTerms.periodFloor,

  cycleOfInterestPayment: extendedTemplateTerms.cycleOfInterestPayment,
  cycleOfRateReset: extendedTemplateTerms.cycleOfRateReset,
  cycleOfScalingIndex: extendedTemplateTerms.cycleOfScalingIndex,
  cycleOfFee: extendedTemplateTerms.cycleOfFee,
  cycleOfPrincipalRedemption: extendedTemplateTerms.cycleOfPrincipalRedemption,

  gracePeriod: isOverwritten(overwrittenAttributesMap, 31) ? overwrittenTerms.gracePeriod : extendedTemplateTerms.gracePeriod,
  delinquencyPeriod: isOverwritten(overwrittenAttributesMap, 32) ? overwrittenTerms.delinquencyPeriod : extendedTemplateTerms.delinquencyPeriod,

  contractReference_1: overwrittenTerms.contractReference_1,
  contractReference_2: overwrittenTerms.contractReference_2
});

export const deriveCustomTermsFromOverwrittenAttributesAndAnchorDate = (
  overwrittenAttributes: Partial<LifecycleTerms>,
  anchorDate: string | number
): CustomTerms => {
  const overwrittenTerms: LifecycleTerms = { ...EMPTY_LIFECYCLE_TERMS, ...overwrittenAttributes };
  let overwrittenAttributesMap = '';

  Object.keys(EMPTY_LIFECYCLE_TERMS).forEach((attribute: string): void => {
    // set attributes map
    // @ts-ignore
    if (overwrittenAttributes[attribute]) {
      overwrittenAttributesMap = '1' + overwrittenAttributesMap;
    } else {
      overwrittenAttributesMap = '0' + overwrittenAttributesMap;
    }
  });

  // convert from binary string to number
  overwrittenAttributesMap = String(parseInt(overwrittenAttributesMap, 2));
  
  return { anchorDate, overwrittenAttributesMap, overwrittenTerms };
};

export const deriveTemplateTermsFromExtendedTemplateTerms = (
  extendedTemplateTerms: ExtendedTemplateTerms
): TemplateTerms => ({
  calendar: extendedTemplateTerms.calendar,
  contractRole: extendedTemplateTerms.contractRole,
  dayCountConvention: extendedTemplateTerms.dayCountConvention,
  businessDayConvention: extendedTemplateTerms.businessDayConvention,
  endOfMonthConvention: extendedTemplateTerms.endOfMonthConvention,
  scalingEffect: extendedTemplateTerms.scalingEffect,
  penaltyType: extendedTemplateTerms.penaltyType,
  feeBasis: extendedTemplateTerms.feeBasis,
  creditEventTypeCovered: extendedTemplateTerms.creditEventTypeCovered,
  
  currency: extendedTemplateTerms.currency,
  settlementCurrency: extendedTemplateTerms.settlementCurrency,
  
  marketObjectCodeRateReset: extendedTemplateTerms.marketObjectCodeRateReset,
  
  statusDateOffset: extendedTemplateTerms.statusDateOffset,
  maturityDateOffset: extendedTemplateTerms.maturityDateOffset,
  
  notionalPrincipal: extendedTemplateTerms.notionalPrincipal,
  nominalInterestRate: extendedTemplateTerms.nominalInterestRate,
  feeAccrued: extendedTemplateTerms.feeAccrued,
  accruedInterest: extendedTemplateTerms.accruedInterest,
  rateMultiplier: extendedTemplateTerms.rateMultiplier,
  rateSpread: extendedTemplateTerms.rateSpread,
  feeRate: extendedTemplateTerms.feeRate,
  nextResetRate: extendedTemplateTerms.nextResetRate,
  penaltyRate: extendedTemplateTerms.penaltyRate,
  premiumDiscountAtIED: extendedTemplateTerms.premiumDiscountAtIED,
  priceAtPurchaseDate: extendedTemplateTerms.priceAtPurchaseDate,
  nextPrincipalRedemptionPayment: extendedTemplateTerms.nextPrincipalRedemptionPayment,
  coverageOfCreditEnhancement: extendedTemplateTerms.coverageOfCreditEnhancement,
  lifeCap: extendedTemplateTerms.lifeCap,
  lifeFloor: extendedTemplateTerms.lifeFloor,
  periodCap: extendedTemplateTerms.periodCap,
  periodFloor: extendedTemplateTerms.periodFloor,

  gracePeriod: extendedTemplateTerms.gracePeriod,
  delinquencyPeriod: extendedTemplateTerms.delinquencyPeriod
});

export const deriveGeneratingTermsFromExtendedTemplateTerms = (
  extendedTemplateTerms: ExtendedTemplateTerms
): GeneratingTerms => ({
  scalingEffect: extendedTemplateTerms.scalingEffect,

  contractDealDate: extendedTemplateTerms.contractDealDateOffset,
  statusDate: extendedTemplateTerms.statusDateOffset,
  initialExchangeDate: extendedTemplateTerms.initialExchangeDateOffset,
  maturityDate: extendedTemplateTerms.maturityDateOffset,
  purchaseDate: extendedTemplateTerms.purchaseDateOffset,
  capitalizationEndDate: extendedTemplateTerms.capitalizationEndDateOffset,
  cycleAnchorDateOfInterestPayment: extendedTemplateTerms.cycleAnchorDateOfInterestPaymentOffset,
  cycleAnchorDateOfRateReset: extendedTemplateTerms.cycleAnchorDateOfRateResetOffset,
  cycleAnchorDateOfScalingIndex: extendedTemplateTerms.cycleAnchorDateOfScalingIndexOffset,
  cycleAnchorDateOfFee: extendedTemplateTerms.cycleAnchorDateOfFeeOffset,
  cycleAnchorDateOfPrincipalRedemption: extendedTemplateTerms.cycleAnchorDateOfPrincipalRedemptionOffset,

  cycleOfInterestPayment: extendedTemplateTerms.cycleOfInterestPayment,
  cycleOfRateReset: extendedTemplateTerms.cycleOfRateReset,
  cycleOfScalingIndex: extendedTemplateTerms.cycleOfScalingIndex,
  cycleOfFee: extendedTemplateTerms.cycleOfFee,
  cycleOfPrincipalRedemption: extendedTemplateTerms.cycleOfPrincipalRedemption,

  gracePeriod: extendedTemplateTerms.gracePeriod,
  delinquencyPeriod: extendedTemplateTerms.delinquencyPeriod
});

export const deriveExtendedTemplateTermsFromTerms = (terms: Terms): ExtendedTemplateTerms => ({
  contractType: terms.contractType,
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

  contractDealDateOffset: normalizeDate(terms.contractDealDate, terms.contractDealDate),
  statusDateOffset: normalizeDate(terms.contractDealDate, terms.statusDate),
  initialExchangeDateOffset: normalizeDate(terms.contractDealDate, terms.initialExchangeDate),
  maturityDateOffset: normalizeDate(terms.contractDealDate, terms.maturityDate),
  purchaseDateOffset: normalizeDate(terms.contractDealDate, terms.purchaseDate),
  capitalizationEndDateOffset: normalizeDate(terms.contractDealDate, terms.capitalizationEndDate),
  cycleAnchorDateOfInterestPaymentOffset: normalizeDate(terms.contractDealDate, terms.cycleAnchorDateOfInterestPayment),
  cycleAnchorDateOfRateResetOffset: normalizeDate(terms.contractDealDate, terms.cycleAnchorDateOfRateReset),
  cycleAnchorDateOfScalingIndexOffset: normalizeDate(terms.contractDealDate, terms.cycleAnchorDateOfScalingIndex),
  cycleAnchorDateOfFeeOffset: normalizeDate(terms.contractDealDate, terms.cycleAnchorDateOfFee),
  cycleAnchorDateOfPrincipalRedemptionOffset: normalizeDate(terms.contractDealDate, terms.cycleAnchorDateOfPrincipalRedemption),

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
  lifeCap: terms.lifeCap,
  lifeFloor: terms.lifeFloor,
  periodCap: terms.periodCap,
  periodFloor: terms.periodFloor,

  cycleOfInterestPayment: terms.cycleOfInterestPayment,
  cycleOfRateReset: terms.cycleOfRateReset,
  cycleOfScalingIndex: terms.cycleOfScalingIndex,
  cycleOfFee: terms.cycleOfFee,
  cycleOfPrincipalRedemption: terms.cycleOfPrincipalRedemption,

  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,
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
