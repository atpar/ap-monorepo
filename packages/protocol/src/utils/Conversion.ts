import * as web3Utils from 'web3-utils';

import {
  Terms,
  ANNTerms,
  CECTerms,
  CEGTerms,
  CERTFTerms,
  COLLATerms,
  PAMTerms,
  STKTerms
} from '../types';


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

export const toPrecision = (number: number | string): string => (
  web3Utils.toWei((typeof number === 'string') ? number : number.toString())
);

export const fromPrecision = (number: number | string): string => (
  web3Utils.fromWei((typeof number === 'string') ? number : number.toString())
);

export const encodeAsBytes32 = (externalData: number | string): string => (
  web3Utils.padLeft(web3Utils.toHex(externalData), 64)
);

export const decodeBytes32AsNumber = (bytes32Data: string): string => (
  web3Utils.hexToNumberString(bytes32Data)
);

export const decodeBytes32AsAddress = (bytes32: string): string => {
  if (bytes32.length !== 66) {
    throw new Error('Invalid bytes32 value ' + bytes32)
  }

  return '0x' + bytes32.substring(26)
}

export const parseWeb3Response = <T extends object>(web3Response: any): T => (
  associativeArrayToObject(web3Response) as T
);

export const extractANNTerms = (terms: Terms): ANNTerms => ({
  contractType: terms.contractType,
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  scalingEffect: terms.scalingEffect,
  feeBasis: terms.feeBasis,

  currency: terms.currency,
  settlementCurrency: terms.settlementCurrency,

  marketObjectCodeRateReset: terms.marketObjectCodeRateReset,

  statusDate: terms.statusDate,
  initialExchangeDate: terms.initialExchangeDate,
  maturityDate: terms.maturityDate,
  issueDate: terms.issueDate,
  purchaseDate: terms.purchaseDate,
  capitalizationEndDate: terms.capitalizationEndDate,
  cycleAnchorDateOfInterestPayment: terms.cycleAnchorDateOfInterestPayment,
  cycleAnchorDateOfRateReset: terms.cycleAnchorDateOfRateReset,
  cycleAnchorDateOfScalingIndex: terms.cycleAnchorDateOfScalingIndex,
  cycleAnchorDateOfFee: terms.cycleAnchorDateOfFee,
  cycleAnchorDateOfPrincipalRedemption: terms.cycleAnchorDateOfPrincipalRedemption,

  notionalPrincipal: terms.notionalPrincipal,
  nominalInterestRate: terms.nominalInterestRate,
  accruedInterest: terms.accruedInterest,
  rateMultiplier: terms.rateMultiplier,
  rateSpread: terms.rateSpread,
  nextResetRate: terms.nextResetRate,
  feeRate: terms.feeRate,
  feeAccrued: terms.feeAccrued,
  premiumDiscountAtIED: terms.premiumDiscountAtIED,
  priceAtPurchaseDate: terms.priceAtPurchaseDate,
  priceAtTerminationDate: terms.priceAtTerminationDate,
  nextPrincipalRedemptionPayment: terms.nextPrincipalRedemptionPayment,

  lifeCap: terms.lifeCap,
  lifeFloor: terms.lifeFloor,
  periodCap: terms.periodCap,
  periodFloor: terms.periodFloor,

  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,

  cycleOfInterestPayment: terms.cycleOfInterestPayment,
  cycleOfRateReset: terms.cycleOfRateReset,
  cycleOfScalingIndex: terms.cycleOfScalingIndex,
  cycleOfFee: terms.cycleOfFee,
  cycleOfPrincipalRedemption: terms.cycleOfPrincipalRedemption
});

export const extractCECTerms = (terms: Terms): CECTerms => ({
  contractType: terms.contractType,
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  feeBasis: terms.feeBasis,
  creditEventTypeCovered: terms.creditEventTypeCovered,

  statusDate: terms.statusDate,
  maturityDate: terms.maturityDate,

  notionalPrincipal: terms.notionalPrincipal,
  feeRate: terms.feeRate,
  coverageOfCreditEnhancement: terms.coverageOfCreditEnhancement,

  contractReference_1: terms.contractReference_1,
  contractReference_2: terms.contractReference_2
});

export const extractCEGTerms = (terms: Terms): CEGTerms => ({
  contractType: terms.contractType,
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  feeBasis: terms.feeBasis,
  creditEventTypeCovered: terms.creditEventTypeCovered,

  currency: terms.currency,
  settlementCurrency: terms.settlementCurrency,

  statusDate: terms.statusDate,
  maturityDate: terms.maturityDate,
  purchaseDate: terms.purchaseDate,
  cycleAnchorDateOfFee: terms.cycleAnchorDateOfFee,

  notionalPrincipal: terms.notionalPrincipal,
  feeAccrued: terms.feeAccrued,
  feeRate: terms.feeRate,
  priceAtPurchaseDate: terms.priceAtPurchaseDate,
  coverageOfCreditEnhancement: terms.coverageOfCreditEnhancement,

  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,

  cycleOfFee: terms.cycleOfFee,

  contractReference_1: terms.contractReference_1,
  contractReference_2: terms.contractReference_2
});

export const extractCERTFTerms = (terms: Terms): CERTFTerms => ({
  contractType: terms.contractType,
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  couponType: terms.couponType,
  currency: terms.currency,
  settlementCurrency: terms.settlementCurrency,
  statusDate: terms.statusDate,
  initialExchangeDate: terms.initialExchangeDate,
  maturityDate: terms.maturityDate,
  issueDate: terms.issueDate,
  cycleAnchorDateOfRedemption: terms.cycleAnchorDateOfRedemption,
  cycleAnchorDateOfTermination: terms.cycleAnchorDateOfTermination,
  cycleAnchorDateOfCoupon: terms.cycleAnchorDateOfCoupon,
  nominalPrice: terms.nominalPrice,
  issuePrice: terms.issuePrice,
  quantity: terms.quantity,
  denominationRatio: terms.denominationRatio,
  couponRate: terms.couponRate,
  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,
  settlementPeriod: terms.settlementPeriod,
  fixingPeriod: terms.fixingPeriod,
  redemptionRecordPeriod: terms.redemptionRecordPeriod,
  cycleOfRedemption: terms.cycleOfRedemption,
  cycleOfTermination: terms.cycleOfTermination,
  cycleOfCoupon: terms.cycleOfCoupon,
  contractReference_1: terms.contractReference_1,
  contractReference_2: terms.contractReference_2
});

export const extractCOLLATerms = (terms: Terms): COLLATerms => ({
  contractType: terms.contractType,
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  
  marketObjectCodeOfCollateral: terms.marketObjectCodeOfCollateral,

  currency: terms.currency,
  settlementCurrency: terms.settlementCurrency,
  collateralCurrency: terms.collateralCurrency,

  statusDate: terms.statusDate,
  initialExchangeDate: terms.initialExchangeDate,
  maturityDate: terms.maturityDate,
  capitalizationEndDate: terms.capitalizationEndDate,
  cycleAnchorDateOfInterestPayment: terms.cycleAnchorDateOfInterestPayment,

  notionalPrincipal: terms.notionalPrincipal,
  nominalInterestRate: terms.nominalInterestRate,
  accruedInterest: terms.accruedInterest,
  premiumDiscountAtIED: terms.premiumDiscountAtIED,
  coverageOfCollateral: terms.coverageOfCollateral,

  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,

  cycleOfInterestPayment: terms.cycleOfInterestPayment,
});

export const extractPAMTerms = (terms: Terms): PAMTerms => ({
  contractType: terms.contractType,
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  scalingEffect: terms.scalingEffect,
  feeBasis: terms.feeBasis,

  currency: terms.currency,
  settlementCurrency: terms.settlementCurrency,

  marketObjectCodeRateReset: terms.marketObjectCodeRateReset,

  statusDate: terms.statusDate,
  initialExchangeDate: terms.initialExchangeDate,
  maturityDate: terms.maturityDate,
  issueDate: terms.issueDate,
  purchaseDate: terms.purchaseDate,
  capitalizationEndDate: terms.capitalizationEndDate,
  cycleAnchorDateOfInterestPayment: terms.cycleAnchorDateOfInterestPayment,
  cycleAnchorDateOfRateReset: terms.cycleAnchorDateOfRateReset,
  cycleAnchorDateOfScalingIndex: terms.cycleAnchorDateOfScalingIndex,
  cycleAnchorDateOfFee: terms.cycleAnchorDateOfFee,

  notionalPrincipal: terms.notionalPrincipal,
  nominalInterestRate: terms.nominalInterestRate,
  accruedInterest: terms.accruedInterest,
  rateMultiplier: terms.rateMultiplier,
  rateSpread: terms.rateSpread,
  nextResetRate: terms.nextResetRate,
  feeRate: terms.feeRate,
  feeAccrued: terms.feeAccrued,
  premiumDiscountAtIED: terms.premiumDiscountAtIED,
  priceAtPurchaseDate: terms.priceAtPurchaseDate,
  priceAtTerminationDate: terms.priceAtTerminationDate,

  lifeCap: terms.lifeCap,
  lifeFloor: terms.lifeFloor,
  periodCap: terms.periodCap,
  periodFloor: terms.periodFloor,

  gracePeriod: terms.gracePeriod,
  delinquencyPeriod: terms.delinquencyPeriod,

  cycleOfInterestPayment: terms.cycleOfInterestPayment,
  cycleOfRateReset: terms.cycleOfRateReset,
  cycleOfScalingIndex: terms.cycleOfScalingIndex,
  cycleOfFee: terms.cycleOfFee
});

export const extractSTKTerms = (terms: Terms): STKTerms => ({
  contractType: terms.contractType,
  calendar: terms.calendar,
  contractRole: terms.contractRole,
  dayCountConvention: terms.dayCountConvention,
  businessDayConvention: terms.businessDayConvention,
  endOfMonthConvention: terms.endOfMonthConvention,
  redeemableByIssuer: terms.redeemableByIssuer,

  currency: terms.currency,
  settlementCurrency: terms.settlementCurrency,

  statusDate: terms.statusDate,
  issueDate: terms.issueDate,
  purchaseDate: terms.purchaseDate,
  cycleAnchorDateOfDividend: terms.cycleAnchorDateOfDividend,

  nominalPrice: terms.nominalPrice,
  notionalPrincipal: terms.notionalPrincipal,
  issuePrice: terms.issuePrice,
  quantity: terms.quantity,
  priceAtPurchaseDate: terms.priceAtPurchaseDate,
  priceAtTerminationDate: terms.priceAtTerminationDate,
  redemptionPrice: terms.redemptionPrice,

  dividendRecordPeriod: terms.dividendRecordPeriod,
  dividendPaymentPeriod: terms.dividendPaymentPeriod,
  splitSettlementPeriod: terms.splitSettlementPeriod,
  redemptionRecordPeriod: terms.redemptionRecordPeriod,
  redemptionPaymentPeriod: terms.redemptionPaymentPeriod,

  cycleOfDividend: terms.cycleOfDividend
});

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
