import { ANNEngine } from '@atpar/ap-contracts/ts-bindings/ANNEngine';
import { CECEngine } from '@atpar/ap-contracts/ts-bindings/CECEngine';
import { CEGEngine } from '@atpar/ap-contracts/ts-bindings/CEGEngine';
import { PAMEngine } from '@atpar/ap-contracts/ts-bindings/PAMEngine';
import { CERTFEngine } from '@atpar/ap-contracts/ts-bindings/CERTFEngine';

// Union Types
export type UEngine = ANNEngine | CECEngine | CEGEngine | PAMEngine | CERTFEngine;
export type UTerms = ANNTerms | CECTerms | CEGTerms |  PAMTerms | CERTFTerms;

// schedule ids
export const NON_CYLIC_SCHEDULE_ID = '255';
// FP, PR, PY, IP, IPCI, RR, SC, CFD, CPD, RFD, RPD, XD
export const CYCLIC_EVENTS = ['3', '4', '7', '9', '10', '13', '18', '21', '23', '24', '26'];

// IPS
export interface IPS { 
  i: string | number; // I=Integer
  p: string | number; 
  s: string | number;
  isSet: boolean;
}
// IP
export interface IP { 
  i: string | number; // I=Integer
  p: string | number;
  isSet: boolean;
}

export interface ContractReference {
  object: string | number[];
  object2: string | number[];
  _type: number | string;
  role: number | string;
}

export interface State {
  contractPerformance: string | number;
  statusDate: string | number;
  nonPerformingDate: string | number;
  maturityDate: string | number;
  exerciseDate: string | number;
  terminationDate: string | number;
  lastCouponDay: string | number;
  notionalPrincipal: string | number;
  accruedInterest: string | number;
  feeAccrued: string | number;
  nominalInterestRate: string | number;
  interestScalingMultiplier: string | number;
  notionalScalingMultiplier: string | number;
  nextPrincipalRedemptionPayment: string | number;
  exerciseAmount: string | number;
  exerciseQuantity: string | number;
  quantity: string | number;
  couponAmountFixed: string | number;
  marginFactor: string | number;
  adjustmentFactor: string | number;
}

export interface Terms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  scalingEffect: string | number;
  penaltyType: string | number;
  feeBasis: string | number;
  creditEventTypeCovered: string | number;
  couponType: string | number;
  
  currency: string;
  settlementCurrency: string;

  marketObjectCodeRateReset: string | number[];
  
  contractDealDate: number | string;
  statusDate: number | string;
  initialExchangeDate: number | string;
  issueDate: number | string;
  maturityDate: number | string;
  purchaseDate: number | string;
  capitalizationEndDate: number | string;
  cycleAnchorDateOfInterestPayment: number | string;
  cycleAnchorDateOfRateReset: number | string;
  cycleAnchorDateOfScalingIndex: number | string;
  cycleAnchorDateOfFee: number | string;
  cycleAnchorDateOfPrincipalRedemption: number | string;
  cycleAnchorDateOfRedemption: number | string;
  cycleAnchorDateOfTermination: number | string;
  cycleAnchorDateOfCoupon: number | string;

  notionalPrincipal: number | string;
  nominalPrice: number | string;
  issuePrice: number | string;
  quantity: number | string;
  nominalInterestRate: number | string;
  feeAccrued: number | string;
  accruedInterest: number | string;
  rateMultiplier: number | string;
  rateSpread: number | string;
  feeRate: number | string;
  nextResetRate: number | string;
  penaltyRate: number | string;
  delinquencyRate: number | string;
  couponRate: number | string;
  denominationRatio: number | string;
  premiumDiscountAtIED: number | string;
  priceAtPurchaseDate: number | string;
  nextPrincipalRedemptionPayment: number | string;
  coverageOfCreditEnhancement: number | string;
  lifeCap: number | string;
  lifeFloor: number | string;
  periodCap: number | string;
  periodFloor: number | string;
  nominalPrice: number | string;
  issuePrice: number | string;
  quantity: number | string;
  denominationRatio: number | string;
  couponRate: number | string;

  gracePeriod: IP;
  delinquencyPeriod: IP;
  settlementPeriod: IP;
  fixingPeriod: IP;
  exercisePeriod: IP;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;
  cycleOfRedemption: IPS;
  cycleOfTermination: IPS;
  cycleOfCoupon: IPS;

  contractReference_1: ContractReference;
  contractReference_2: ContractReference;
}

export interface ANNTerms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  scalingEffect: string | number;
  penaltyType: string | number;
  feeBasis: string | number;
  
  currency: string;
  settlementCurrency: string;

  marketObjectCodeRateReset: string | number[];
  
  contractDealDate: number | string;
  statusDate: number | string;
  initialExchangeDate: number | string;
  maturityDate: number | string;
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
  penaltyRate: number | string;
  delinquencyRate: number | string;
  premiumDiscountAtIED: number | string;
  priceAtPurchaseDate: number | string;
  nextPrincipalRedemptionPayment: number | string;

  lifeCap: number | string;
  lifeFloor: number | string;
  periodCap: number | string;
  periodFloor: number | string;

  gracePeriod: IP;
  delinquencyPeriod: IP;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;
}

export interface CECTerms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  feeBasis: string | number;
  creditEventTypeCovered: string | number;
  
  statusDate: number | string;
  maturityDate: number | string;

  notionalPrincipal: number | string;
  feeRate: number | string;
  coverageOfCreditEnhancement: number | string;

  contractReference_1: ContractReference;
  contractReference_2: ContractReference;
}

export interface CEGTerms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  feeBasis: string | number;
  creditEventTypeCovered: string | number;
  
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
  coverageOfCreditEnhancement: number | string;

  gracePeriod: IP;
  delinquencyPeriod: IP;

  cycleOfFee: IPS;

  contractReference_1: ContractReference;
  contractReference_2: ContractReference;
}

export interface CERTFTerms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  couponType: string | number;
  
  currency: string;
  settlementCurrency: string;

  contractDealDate: number | string;
  statusDate: number | string;
  initialExchangeDate: number | string;
  maturityDate: number | string;
  issueDate: number | string;
  cycleAnchorDateOfRedemption: number | string;
  cycleAnchorDateOfTermination: number | string;
  cycleAnchorDateOfCoupon: number | string;

  nominalPrice: number | string;
  issuePrice: number | string;
  quantity: number | string;
  denominationRatio: number | string;
  couponRate: number | string;

  gracePeriod: IP;
  delinquencyPeriod: IP;  
  settlementPeriod: IP;
  fixingPeriod: IP;
  exercisePeriod: IP;

  cycleOfRedemption: IPS;
  cycleOfTermination: IPS;
  cycleOfCoupon: IPS;

  contractReference_1: ContractReference;
  contractReference_2: ContractReference;
}

export interface PAMTerms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  scalingEffect: string | number;
  penaltyType: string | number;
  feeBasis: string | number;
  
  currency: string;
  settlementCurrency: string;

  marketObjectCodeRateReset: string | number[];
  
  contractDealDate: number | string;
  statusDate: number | string;
  initialExchangeDate: number | string;
  maturityDate: number | string;
  purchaseDate: number | string;
  capitalizationEndDate: number | string;
  cycleAnchorDateOfInterestPayment: number | string;
  cycleAnchorDateOfRateReset: number | string;
  cycleAnchorDateOfScalingIndex: number | string;
  cycleAnchorDateOfFee: number | string;

  notionalPrincipal: number | string;
  nominalInterestRate: number | string;
  accruedInterest: number | string;
  rateMultiplier: number | string;
  rateSpread: number | string;
  nextResetRate: number | string;
  feeRate: number | string;
  feeAccrued: number | string;
  penaltyRate: number | string;
  delinquencyRate: number | string;
  premiumDiscountAtIED: number | string;
  priceAtPurchaseDate: number | string;

  lifeCap: number | string;
  lifeFloor: number | string;
  periodCap: number | string;
  periodFloor: number | string;

  gracePeriod: IP;
  delinquencyPeriod: IP;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
}

export function isIP(obj: any): obj is IP {
  if (!obj) { return false; }
  if (obj.i == undefined || (typeof obj.i !== 'number' && typeof obj.i !== 'string')) { return false; }
  if (obj.p == undefined || (typeof obj.p !== 'number' && typeof obj.p !== 'string')) { return false; }
  if (obj.isSet == undefined || typeof obj.isSet !== 'boolean') { return false; }

  return true;
}

export function isIPS(obj: any): obj is IPS {
  if (!obj) { return false; }
  if (obj.i == undefined || (typeof obj.i !== 'number' && typeof obj.i !== 'string')) { return false; }
  if (obj.p == undefined || (typeof obj.p !== 'number' && typeof obj.p !== 'string')) { return false; }
  if (obj.s == undefined || (typeof obj.s !== 'number' && typeof obj.s !== 'string')) { return false; }
  if (obj.isSet == undefined || typeof obj.isSet !== 'boolean') { return false; }

  return true;
}

export function isContractReference(obj: any): obj is ContractReference {
  if (!obj) { return false; }
  if (obj.object == undefined || typeof obj.object !== 'string') { return false; }
  if (
    obj._type == undefined
    || (typeof obj._type !== 'number' && typeof obj._type !== 'string')
  ) { return false; }
  if (
    obj.role == undefined
    || (typeof obj.role !== 'number' && typeof obj.role !== 'string')
  ) { return false; }

  return true;
}

export function isState(obj: any): obj is State {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.exerciseDate == undefined || typeof obj.exerciseDate !== 'number' && typeof obj.exerciseDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.lastCouponDay == undefined || typeof obj.lastCouponDay !== 'number' && typeof obj.lastCouponDay !== 'string') { return false; }
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.interestScalingMultiplier == undefined || typeof obj.interestScalingMultiplier !== 'number' && typeof obj.interestScalingMultiplier !== 'string') { return false; }
  if (obj.notionalScalingMultiplier == undefined || typeof obj.notionalScalingMultiplier !== 'number' && typeof obj.notionalScalingMultiplier !== 'string') { return false; }
  if (obj.nextPrincipalRedemptionPayment == undefined || typeof obj.nextPrincipalRedemptionPayment !== 'number' && typeof obj.nextPrincipalRedemptionPayment !== 'string') { return false; }
  if (obj.exerciseAmount == undefined || typeof obj.exerciseAmount !== 'number' && typeof obj.exerciseAmount !== 'string') { return false; }
  if (obj.exerciseQuantity == undefined || typeof obj.exerciseQuantity !== 'number' && typeof obj.exerciseQuantity !== 'string') { return false; }
  if (obj.quantity == undefined || typeof obj.quantity !== 'number' && typeof obj.quantity !== 'string') { return false; }
  if (obj.couponAmountFixed == undefined || typeof obj.couponAmountFixed !== 'number' && typeof obj.couponAmountFixed !== 'string') { return false; }
  if (obj.marginFactor == undefined || typeof obj.marginFactor !== 'number' && typeof obj.marginFactor !== 'string') { return false; }
  if (obj.adjustmentFactor == undefined || typeof obj.adjustmentFactor !== 'number' && typeof obj.adjustmentFactor !== 'string') { return false; }

  return true;
}

export function isTerms (obj: any): obj is Terms {
  if (!obj) { return false; }
  if (obj.contractType == undefined || typeof obj.contractType !== 'string' && typeof obj.contractType !== 'number') { return false; }
  if (obj.calendar == undefined || typeof obj.calendar !== 'string' && typeof obj.calendar !== 'number') { return false; }
  if (obj.contractRole == undefined || typeof obj.contractRole !== 'string' && typeof obj.contractRole !== 'number') { return false; }
  if (obj.dayCountConvention == undefined || typeof obj.dayCountConvention !== 'string' && typeof obj.dayCountConvention !== 'number') { return false; }
  if (obj.businessDayConvention == undefined || typeof obj.businessDayConvention !== 'string' && typeof obj.businessDayConvention !== 'number') { return false; }
  if (obj.endOfMonthConvention == undefined || typeof obj.endOfMonthConvention !== 'string' && typeof obj.endOfMonthConvention !== 'number') { return false; }
  if (obj.scalingEffect == undefined || typeof obj.scalingEffect !== 'string' && typeof obj.scalingEffect !== 'number') { return false; }
  if (obj.penaltyType == undefined || typeof obj.penaltyType !== 'string' && typeof obj.penaltyType !== 'number') { return false; }
  if (obj.feeBasis == undefined || typeof obj.feeBasis !== 'string' && typeof obj.feeBasis !== 'number') { return false; }
  if (obj.creditEventTypeCovered == undefined || typeof obj.creditEventTypeCovered !== 'string' && typeof obj.creditEventTypeCovered !== 'number') { return false; }
  
  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }
  
  if (obj.marketObjectCodeRateReset == undefined || typeof obj.marketObjectCodeRateReset !== 'string') { return false; }

  if (obj.contractDealDate == undefined || typeof obj.contractDealDate !== 'number' && typeof obj.contractDealDate !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.purchaseDate == undefined || typeof obj.purchaseDate !== 'number' && typeof obj.purchaseDate !== 'string') { return false; }
  if (obj.capitalizationEndDate == undefined || typeof obj.capitalizationEndDate !== 'number' && typeof obj.capitalizationEndDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfInterestPayment == undefined || typeof obj.cycleAnchorDateOfInterestPayment !== 'number' && typeof obj.cycleAnchorDateOfInterestPayment !== 'string') { return false; }
  if (obj.cycleAnchorDateOfRateReset == undefined || typeof obj.cycleAnchorDateOfRateReset !== 'number' && typeof obj.cycleAnchorDateOfRateReset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfScalingIndex == undefined || typeof obj.cycleAnchorDateOfScalingIndex !== 'number' && typeof obj.cycleAnchorDateOfScalingIndex !== 'string') { return false; }
  if (obj.cycleAnchorDateOfFee == undefined || typeof obj.cycleAnchorDateOfFee !== 'number' && typeof obj.cycleAnchorDateOfFee !== 'string') { return false; }
  if (obj.cycleAnchorDateOfPrincipalRedemption == undefined || typeof obj.cycleAnchorDateOfPrincipalRedemption !== 'number' && typeof obj.cycleAnchorDateOfPrincipalRedemption !== 'string') { return false; }

  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.rateMultiplier == undefined || typeof obj.rateMultiplier !== 'number' && typeof obj.rateMultiplier !== 'string') { return false; }
  if (obj.rateSpread == undefined || typeof obj.rateSpread !== 'number' && typeof obj.rateSpread !== 'string') { return false; }
  if (obj.feeRate == undefined || typeof obj.feeRate !== 'number' && typeof obj.feeRate !== 'string') { return false; }
  if (obj.nextResetRate == undefined || typeof obj.nextResetRate !== 'number' && typeof obj.nextResetRate !== 'string') { return false; }
  if (obj.penaltyRate == undefined || typeof obj.penaltyRate !== 'number' && typeof obj.penaltyRate !== 'string') { return false; }
  if (obj.premiumDiscountAtIED == undefined || typeof obj.premiumDiscountAtIED !== 'number' && typeof obj.premiumDiscountAtIED !== 'string') { return false; }
  if (obj.priceAtPurchaseDate == undefined || typeof obj.priceAtPurchaseDate !== 'number' && typeof obj.priceAtPurchaseDate !== 'string') { return false; }
  if (obj.nextPrincipalRedemptionPayment == undefined || typeof obj.nextPrincipalRedemptionPayment !== 'number' && typeof obj.nextPrincipalRedemptionPayment !== 'string') { return false; }
  if (obj.coverageOfCreditEnhancement == undefined || typeof obj.coverageOfCreditEnhancement !== 'number' && typeof obj.coverageOfCreditEnhancement !== 'string') { return false; }
  if (obj.lifeCap == undefined || typeof obj.lifeCap !== 'number' && typeof obj.lifeCap !== 'string') { return false; }
  if (obj.lifeFloor == undefined || typeof obj.lifeFloor !== 'number' && typeof obj.lifeFloor !== 'string') { return false; }
  if (obj.periodCap == undefined || typeof obj.periodCap !== 'number' && typeof obj.periodCap !== 'string') { return false; }
  if (obj.periodFloor == undefined || typeof obj.periodFloor !== 'number' && typeof obj.periodFloor !== 'string') { return false; }

  if (!isIPS(obj.cycleOfInterestPayment)) { return false; }
  if (!isIPS(obj.cycleOfRateReset)) { return false; }
  if (!isIPS(obj.cycleOfScalingIndex)) { return false; }
  if (!isIPS(obj.cycleOfFee)) { return false; }
  if (!isIPS(obj.cycleOfPrincipalRedemption)) { return false; }

  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }

  if (!isContractReference(obj.contractReference_1)) { return false; }
  if (!isContractReference(obj.contractReference_2)) { return false; }

  return true;
}

export function isANNTerms (obj: any): obj is ANNTerms {
  if (!obj) { return false; }
  if (obj.contractType == undefined || typeof obj.contractType !== 'string' && typeof obj.contractType !== 'number') { return false; }
  if (obj.calendar == undefined || typeof obj.calendar !== 'string' && typeof obj.calendar !== 'number') { return false; }
  if (obj.contractRole == undefined || typeof obj.contractRole !== 'string' && typeof obj.contractRole !== 'number') { return false; }
  if (obj.dayCountConvention == undefined || typeof obj.dayCountConvention !== 'string' && typeof obj.dayCountConvention !== 'number') { return false; }
  if (obj.businessDayConvention == undefined || typeof obj.businessDayConvention !== 'string' && typeof obj.businessDayConvention !== 'number') { return false; }
  if (obj.endOfMonthConvention == undefined || typeof obj.endOfMonthConvention !== 'string' && typeof obj.endOfMonthConvention !== 'number') { return false; }
  if (obj.scalingEffect == undefined || typeof obj.scalingEffect !== 'string' && typeof obj.scalingEffect !== 'number') { return false; }
  if (obj.penaltyType == undefined || typeof obj.penaltyType !== 'string' && typeof obj.penaltyType !== 'number') { return false; }
  if (obj.feeBasis == undefined || typeof obj.feeBasis !== 'string' && typeof obj.feeBasis !== 'number') { return false; }
  
  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }
  
  if (obj.marketObjectCodeRateReset == undefined || typeof obj.marketObjectCodeRateReset !== 'string') { return false; }

  if (obj.contractDealDate == undefined || typeof obj.contractDealDate !== 'number' && typeof obj.contractDealDate !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.purchaseDate == undefined || typeof obj.purchaseDate !== 'number' && typeof obj.purchaseDate !== 'string') { return false; }
  if (obj.capitalizationEndDate == undefined || typeof obj.capitalizationEndDate !== 'number' && typeof obj.capitalizationEndDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfInterestPayment == undefined || typeof obj.cycleAnchorDateOfInterestPayment !== 'number' && typeof obj.cycleAnchorDateOfInterestPayment !== 'string') { return false; }
  if (obj.cycleAnchorDateOfRateReset == undefined || typeof obj.cycleAnchorDateOfRateReset !== 'number' && typeof obj.cycleAnchorDateOfRateReset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfScalingIndex == undefined || typeof obj.cycleAnchorDateOfScalingIndex !== 'number' && typeof obj.cycleAnchorDateOfScalingIndex !== 'string') { return false; }
  if (obj.cycleAnchorDateOfFee == undefined || typeof obj.cycleAnchorDateOfFee !== 'number' && typeof obj.cycleAnchorDateOfFee !== 'string') { return false; }
  if (obj.cycleAnchorDateOfPrincipalRedemption == undefined || typeof obj.cycleAnchorDateOfPrincipalRedemption !== 'number' && typeof obj.cycleAnchorDateOfPrincipalRedemption !== 'string') { return false; }

  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.rateMultiplier == undefined || typeof obj.rateMultiplier !== 'number' && typeof obj.rateMultiplier !== 'string') { return false; }
  if (obj.rateSpread == undefined || typeof obj.rateSpread !== 'number' && typeof obj.rateSpread !== 'string') { return false; }
  if (obj.nextResetRate == undefined || typeof obj.nextResetRate !== 'number' && typeof obj.nextResetRate !== 'string') { return false; }
  if (obj.feeRate == undefined || typeof obj.feeRate !== 'number' && typeof obj.feeRate !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.penaltyRate == undefined || typeof obj.penaltyRate !== 'number' && typeof obj.penaltyRate !== 'string') { return false; }
  if (obj.delinquencyRate == undefined || typeof obj.delinquencyRate !== 'number' && typeof obj.delinquencyRate !== 'string') { return false; }
  if (obj.premiumDiscountAtIED == undefined || typeof obj.premiumDiscountAtIED !== 'number' && typeof obj.premiumDiscountAtIED !== 'string') { return false; }
  if (obj.priceAtPurchaseDate == undefined || typeof obj.priceAtPurchaseDate !== 'number' && typeof obj.priceAtPurchaseDate !== 'string') { return false; }
  if (obj.nextPrincipalRedemptionPayment == undefined || typeof obj.nextPrincipalRedemptionPayment !== 'number' && typeof obj.nextPrincipalRedemptionPayment !== 'string') { return false; }

  if (obj.lifeCap == undefined || typeof obj.lifeCap !== 'number' && typeof obj.lifeCap !== 'string') { return false; }
  if (obj.lifeFloor == undefined || typeof obj.lifeFloor !== 'number' && typeof obj.lifeFloor !== 'string') { return false; }
  if (obj.periodCap == undefined || typeof obj.periodCap !== 'number' && typeof obj.periodCap !== 'string') { return false; }
  if (obj.periodFloor == undefined || typeof obj.periodFloor !== 'number' && typeof obj.periodFloor !== 'string') { return false; }

  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }

  if (!isIPS(obj.cycleOfInterestPayment)) { return false; }
  if (!isIPS(obj.cycleOfRateReset)) { return false; }
  if (!isIPS(obj.cycleOfScalingIndex)) { return false; }
  if (!isIPS(obj.cycleOfFee)) { return false; }
  if (!isIPS(obj.cycleOfPrincipalRedemption)) { return false; }

  return true;
}

export function isCECTerms (obj: any): obj is CECTerms {
  if (!obj) { return false; }
  if (obj.contractType == undefined || typeof obj.contractType !== 'string' && typeof obj.contractType !== 'number') { return false; }
  if (obj.calendar == undefined || typeof obj.calendar !== 'string' && typeof obj.calendar !== 'number') { return false; }
  if (obj.contractRole == undefined || typeof obj.contractRole !== 'string' && typeof obj.contractRole !== 'number') { return false; }
  if (obj.dayCountConvention == undefined || typeof obj.dayCountConvention !== 'string' && typeof obj.dayCountConvention !== 'number') { return false; }
  if (obj.businessDayConvention == undefined || typeof obj.businessDayConvention !== 'string' && typeof obj.businessDayConvention !== 'number') { return false; }
  if (obj.endOfMonthConvention == undefined || typeof obj.endOfMonthConvention !== 'string' && typeof obj.endOfMonthConvention !== 'number') { return false; }
  if (obj.creditEventTypeCovered == undefined || typeof obj.creditEventTypeCovered !== 'string' && typeof obj.creditEventTypeCovered !== 'number') { return false; }
  if (obj.feeBasis == undefined || typeof obj.feeBasis !== 'string' && typeof obj.feeBasis !== 'number') { return false; }

  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.feeRate == undefined || typeof obj.feeRate !== 'number' && typeof obj.feeRate !== 'string') { return false; }
  if (obj.coverageOfCreditEnhancement == undefined || typeof obj.coverageOfCreditEnhancement !== 'number' && typeof obj.coverageOfCreditEnhancement !== 'string') { return false; }

  if (!isContractReference(obj.contractReference_1)) { return false; }
  if (!isContractReference(obj.contractReference_2)) { return false; }

  return true;
}

export function isCEGTerms (obj: any): obj is CEGTerms {
  if (!obj) { return false; }
  if (obj.contractType == undefined || typeof obj.contractType !== 'string' && typeof obj.contractType !== 'number') { return false; }
  if (obj.calendar == undefined || typeof obj.calendar !== 'string' && typeof obj.calendar !== 'number') { return false; }
  if (obj.contractRole == undefined || typeof obj.contractRole !== 'string' && typeof obj.contractRole !== 'number') { return false; }
  if (obj.dayCountConvention == undefined || typeof obj.dayCountConvention !== 'string' && typeof obj.dayCountConvention !== 'number') { return false; }
  if (obj.businessDayConvention == undefined || typeof obj.businessDayConvention !== 'string' && typeof obj.businessDayConvention !== 'number') { return false; }
  if (obj.endOfMonthConvention == undefined || typeof obj.endOfMonthConvention !== 'string' && typeof obj.endOfMonthConvention !== 'number') { return false; }
  if (obj.feeBasis == undefined || typeof obj.feeBasis !== 'string' && typeof obj.feeBasis !== 'number') { return false; }
  if (obj.creditEventTypeCovered == undefined || typeof obj.creditEventTypeCovered !== 'string' && typeof obj.creditEventTypeCovered !== 'number') { return false; }
  
  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }
  
  if (obj.contractDealDate == undefined || typeof obj.contractDealDate !== 'number' && typeof obj.contractDealDate !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.purchaseDate == undefined || typeof obj.purchaseDate !== 'number' && typeof obj.purchaseDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfFee == undefined || typeof obj.cycleAnchorDateOfFee !== 'number' && typeof obj.cycleAnchorDateOfFee !== 'string') { return false; }

  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.delinquencyRate == undefined || typeof obj.delinquencyRate !== 'number' && typeof obj.delinquencyRate !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.feeRate == undefined || typeof obj.feeRate !== 'number' && typeof obj.feeRate !== 'string') { return false; }
  if (obj.priceAtPurchaseDate == undefined || typeof obj.priceAtPurchaseDate !== 'number' && typeof obj.priceAtPurchaseDate !== 'string') { return false; }
  if (obj.coverageOfCreditEnhancement == undefined || typeof obj.coverageOfCreditEnhancement !== 'number' && typeof obj.coverageOfCreditEnhancement !== 'string') { return false; }

  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }

  if (!isIPS(obj.cycleOfFee)) { return false; }

  if (!isContractReference(obj.contractReference_1)) { return false; }
  if (!isContractReference(obj.contractReference_2)) { return false; }

  return true;
}

export function isCERTFTerms (obj: any): obj is CERTFTerms {
  if (!obj) { return false; }
  if (obj.contractType == undefined || typeof obj.contractType !== 'string' && typeof obj.contractType !== 'number') { return false; }
  if (obj.calendar == undefined || typeof obj.calendar !== 'string' && typeof obj.calendar !== 'number') { return false; }
  if (obj.contractRole == undefined || typeof obj.contractRole !== 'string' && typeof obj.contractRole !== 'number') { return false; }
  if (obj.dayCountConvention == undefined || typeof obj.dayCountConvention !== 'string' && typeof obj.dayCountConvention !== 'number') { return false; }
  if (obj.businessDayConvention == undefined || typeof obj.businessDayConvention !== 'string' && typeof obj.businessDayConvention !== 'number') { return false; }
  if (obj.endOfMonthConvention == undefined || typeof obj.endOfMonthConvention !== 'string' && typeof obj.endOfMonthConvention !== 'number') { return false; }
  if (obj.couponType == undefined || typeof obj.couponType !== 'string' && typeof obj.couponType !== 'number') { return false; }
  
  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }
  
  if (obj.contractDealDate == undefined || typeof obj.contractDealDate !== 'number' && typeof obj.contractDealDate !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.issueDate == undefined || typeof obj.issueDate !== 'number' && typeof obj.issueDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfRedemption == undefined || typeof obj.cycleAnchorDateOfRedemption !== 'number' && typeof obj.cycleAnchorDateOfRedemption !== 'string') { return false; }
  if (obj.cycleAnchorDateOfTermination == undefined || typeof obj.cycleAnchorDateOfTermination !== 'number' && typeof obj.cycleAnchorDateOfTermination !== 'string') { return false; }
  if (obj.cycleAnchorDateOfCoupon == undefined || typeof obj.cycleAnchorDateOfCoupon !== 'number' && typeof obj.cycleAnchorDateOfCoupon !== 'string') { return false; }

  if (obj.nominalPrice == undefined || typeof obj.nominalPrice !== 'number' && typeof obj.nominalPrice !== 'string') { return false; }
  if (obj.issuePrice == undefined || typeof obj.issuePrice !== 'number' && typeof obj.issuePrice !== 'string') { return false; }
  if (obj.quantity == undefined || typeof obj.quantity !== 'number' && typeof obj.quantity !== 'string') { return false; }
  if (obj.denominationRatio == undefined || typeof obj.denominationRatio !== 'number' && typeof obj.denominationRatio !== 'string') { return false; }
  if (obj.couponRate == undefined || typeof obj.couponRate !== 'number' && typeof obj.couponRate !== 'string') { return false; }

  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }
  if (!isIP(obj.settlementPeriod)) { return false; }
  if (!isIP(obj.fixingPeriod)) { return false; }
  if (!isIP(obj.exercisePeriod)) { return false; }

  if (!isIPS(obj.cycleOfRedemption)) { return false; }
  if (!isIPS(obj.cycleOfTermination)) { return false; }
  if (!isIPS(obj.cycleOfCoupon)) { return false; }
  
  if (!isContractReference(obj.contractReference_1)) { return false; }
  if (!isContractReference(obj.contractReference_2)) { return false; }

  return true;
}

export function isPAMTerms (obj: any): obj is PAMTerms {
  if (!obj) { return false; }
  if (obj.contractType == undefined || typeof obj.contractType !== 'string' && typeof obj.contractType !== 'number') { return false; }
  if (obj.calendar == undefined || typeof obj.calendar !== 'string' && typeof obj.calendar !== 'number') { return false; }
  if (obj.contractRole == undefined || typeof obj.contractRole !== 'string' && typeof obj.contractRole !== 'number') { return false; }
  if (obj.dayCountConvention == undefined || typeof obj.dayCountConvention !== 'string' && typeof obj.dayCountConvention !== 'number') { return false; }
  if (obj.businessDayConvention == undefined || typeof obj.businessDayConvention !== 'string' && typeof obj.businessDayConvention !== 'number') { return false; }
  if (obj.endOfMonthConvention == undefined || typeof obj.endOfMonthConvention !== 'string' && typeof obj.endOfMonthConvention !== 'number') { return false; }
  if (obj.scalingEffect == undefined || typeof obj.scalingEffect !== 'string' && typeof obj.scalingEffect !== 'number') { return false; }
  if (obj.penaltyType == undefined || typeof obj.penaltyType !== 'string' && typeof obj.penaltyType !== 'number') { return false; }
  if (obj.feeBasis == undefined || typeof obj.feeBasis !== 'string' && typeof obj.feeBasis !== 'number') { return false; }
  
  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }
  
  if (obj.marketObjectCodeRateReset == undefined || typeof obj.marketObjectCodeRateReset !== 'string') { return false; }

  if (obj.contractDealDate == undefined || typeof obj.contractDealDate !== 'number' && typeof obj.contractDealDate !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.purchaseDate == undefined || typeof obj.purchaseDate !== 'number' && typeof obj.purchaseDate !== 'string') { return false; }
  if (obj.capitalizationEndDate == undefined || typeof obj.capitalizationEndDate !== 'number' && typeof obj.capitalizationEndDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfInterestPayment == undefined || typeof obj.cycleAnchorDateOfInterestPayment !== 'number' && typeof obj.cycleAnchorDateOfInterestPayment !== 'string') { return false; }
  if (obj.cycleAnchorDateOfRateReset == undefined || typeof obj.cycleAnchorDateOfRateReset !== 'number' && typeof obj.cycleAnchorDateOfRateReset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfScalingIndex == undefined || typeof obj.cycleAnchorDateOfScalingIndex !== 'number' && typeof obj.cycleAnchorDateOfScalingIndex !== 'string') { return false; }
  if (obj.cycleAnchorDateOfFee == undefined || typeof obj.cycleAnchorDateOfFee !== 'number' && typeof obj.cycleAnchorDateOfFee !== 'string') { return false; }

  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.rateMultiplier == undefined || typeof obj.rateMultiplier !== 'number' && typeof obj.rateMultiplier !== 'string') { return false; }
  if (obj.rateSpread == undefined || typeof obj.rateSpread !== 'number' && typeof obj.rateSpread !== 'string') { return false; }
  if (obj.nextResetRate == undefined || typeof obj.nextResetRate !== 'number' && typeof obj.nextResetRate !== 'string') { return false; }
  if (obj.feeRate == undefined || typeof obj.feeRate !== 'number' && typeof obj.feeRate !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.penaltyRate == undefined || typeof obj.penaltyRate !== 'number' && typeof obj.penaltyRate !== 'string') { return false; }
  if (obj.delinquencyRate == undefined || typeof obj.delinquencyRate !== 'number' && typeof obj.delinquencyRate !== 'string') { return false; }
  if (obj.premiumDiscountAtIED == undefined || typeof obj.premiumDiscountAtIED !== 'number' && typeof obj.premiumDiscountAtIED !== 'string') { return false; }
  if (obj.priceAtPurchaseDate == undefined || typeof obj.priceAtPurchaseDate !== 'number' && typeof obj.priceAtPurchaseDate !== 'string') { return false; }

  if (obj.lifeCap == undefined || typeof obj.lifeCap !== 'number' && typeof obj.lifeCap !== 'string') { return false; }
  if (obj.lifeFloor == undefined || typeof obj.lifeFloor !== 'number' && typeof obj.lifeFloor !== 'string') { return false; }
  if (obj.periodCap == undefined || typeof obj.periodCap !== 'number' && typeof obj.periodCap !== 'string') { return false; }
  if (obj.periodFloor == undefined || typeof obj.periodFloor !== 'number' && typeof obj.periodFloor !== 'string') { return false; }

  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }

  if (!isIPS(obj.cycleOfInterestPayment)) { return false; }
  if (!isIPS(obj.cycleOfRateReset)) { return false; }
  if (!isIPS(obj.cycleOfScalingIndex)) { return false; }
  if (!isIPS(obj.cycleOfFee)) { return false; }

  return true;
}
