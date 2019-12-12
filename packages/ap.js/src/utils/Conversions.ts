import * as web3Utils from 'web3-utils';
import BN from 'bn.js';

import { Terms, CustomTerms, ProductTerms, LifecycleTerms, GeneratingTerms } from '../types';


export function toHex (mixed: any): any {
  if (String(mixed).startsWith('0x')) { return mixed; }
  return web3Utils.toHex(mixed);
}

export function hexToUtf8 (hex: string): any {
  return web3Utils.hexToAscii(hex);
}

export function toChecksumAddress (address: string): string {
  return web3Utils.toChecksumAddress(address);
}

export function toPrecision (number: number | string | BN) {
  return web3Utils.toWei((typeof number === 'string') ? number : number.toString());
}

export function fromPrecision (number: number | string | BN) {
  return web3Utils.fromWei((typeof number === 'string') ? number : number.toString());
}

export function encodeAsBytes32 (externalData: number | string) {
  return web3Utils.padLeft(web3Utils.toHex(externalData), 64);
}

export function decodeBytes32AsNumber (bytes32Data: string): string {
  return web3Utils.hexToNumberString(bytes32Data);
}

export function toLifecycleTerms (terms: Terms): LifecycleTerms {
  return {
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
  }
}

export function toGeneratingTerms (terms: Terms): GeneratingTerms {
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

export function toProductTerms (terms: Terms): ProductTerms {
  return {
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
  }
}

export function toCustomTerms (terms: Terms): CustomTerms {
  return {
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
  };
}

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

function normalizeDate (anchorDate: number | string, date: number | string): string {
  return (Number(date) > Number(anchorDate)) ? String(Number(date) - Number(anchorDate)) : '0';
}

