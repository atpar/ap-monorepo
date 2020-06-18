import { ANNEngine } from "@atpar/ap-contracts/ts-bindings/ANNEngine";
import { CECEngine } from "@atpar/ap-contracts/ts-bindings/CECEngine";
import { CEGEngine } from "@atpar/ap-contracts/ts-bindings/CEGEngine";
import { PAMEngine } from "@atpar/ap-contracts/ts-bindings/PAMEngine";

// Union Types
export type UEngine = ANNEngine | CECEngine | CEGEngine | PAMEngine;
export type UTerms = ANNTerms | CECTerms | CEGTerms |  PAMTerms;

// schedule ids
export const NON_CYLIC_SCHEDULE_ID = '255';
export const FP_SCHEDULE_ID = '2';
export const PR_SCHEDULE_ID = '3';
export const PY_SCHEDULE_ID = '6';
export const IP_SCHEDULE_ID = '8';
export const IPCI_SCHEDULE_ID = '9';
export const RR_SCHEDULE_ID = '12';
export const SC_SCHEDULE_ID = '17';

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
  contractPerformance: number | string;
  statusDate: number | string;
  nonPerformingDate: number | string;
  maturityDate: number | string;
  exerciseDate: number | string;
  terminationDate: number | string;
  notionalPrincipal: number | string;
  accruedInterest: number | string;
  feeAccrued: number | string;
  nominalInterestRate: number | string;
  interestScalingMultiplier: number | string;
  notionalScalingMultiplier: number | string;
  nextPrincipalRedemptionPayment: number | string;
  exerciseAmount: number | string;
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
  feeAccrued: number | string;
  accruedInterest: number | string;
  rateMultiplier: number | string;
  rateSpread: number | string;
  feeRate: number | string;
  nextResetRate: number | string;
  penaltyRate: number | string;
  delinquencyRate: number | string;
  premiumDiscountAtIED: number | string;
  priceAtPurchaseDate: number | string;
  nextPrincipalRedemptionPayment: number | string;
  coverageOfCreditEnhancement: number | string;
  lifeCap: number | string;
  lifeFloor: number | string;
  periodCap: number | string;
  periodFloor: number | string;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;

  gracePeriod: IP;
  delinquencyPeriod: IP;

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
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.interestScalingMultiplier == undefined || typeof obj.interestScalingMultiplier !== 'number' && typeof obj.interestScalingMultiplier !== 'string') { return false; }
  if (obj.notionalScalingMultiplier == undefined || typeof obj.notionalScalingMultiplier !== 'number' && typeof obj.notionalScalingMultiplier !== 'string') { return false; }
  if (obj.nextPrincipalRedemptionPayment == undefined || typeof obj.nextPrincipalRedemptionPayment !== 'number' && typeof obj.nextPrincipalRedemptionPayment !== 'string') { return false; }
  if (obj.exerciseAmount == undefined || typeof obj.exerciseAmount !== 'number' && typeof obj.exerciseAmount !== 'string') { return false; }

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
