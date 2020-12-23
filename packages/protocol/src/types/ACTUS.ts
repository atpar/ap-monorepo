import { ANNEngine } from './contracts/ANNEngine';
import { CECEngine } from './contracts/CECEngine';
import { CEGEngine } from './contracts/CEGEngine';
import { CERTFEngine } from './contracts/CERTFEngine';
import { COLLAEngine } from './contracts/COLLAEngine';
import { PAMEngine } from './contracts/PAMEngine';
import { STKEngine } from "./contracts/STKEngine";
import dictionary from "./dictionary/dictionary.json";

// Union Types
export type UEngine = ANNEngine | CECEngine | CEGEngine | CERTFEngine | COLLAEngine | PAMEngine | STKEngine;
export type UTerms = ANNTerms | CECTerms | CEGTerms | CERTFTerms | COLLATerms | PAMTerms | STKTerms;
export type UState = ANNState | CECState | CEGState | CERTFState | COLLAState| PAMState | STKState;

// schedule ids
export const NON_CYLIC_SCHEDULE_ID = '255';

const eventIndex = (acronym: string): number => (dictionary as any).EventType.allowedValues[acronym];
export const CYCLIC_EVENTS = [
  eventIndex('FP'),
  eventIndex('PR'),
  eventIndex('PY'),
  eventIndex('IP'),
  eventIndex('IPCI'),
  eventIndex('RR'),
  eventIndex('SC'),
  eventIndex('COF'),
  eventIndex('COP'),
  eventIndex('REF'),
  eventIndex('REP'),
  eventIndex('EXE'),
];

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
  _type: string | number;
  role: string | number;
}

export interface UnderlyingState {
  exerciseAmount: string | number;
  isSet: boolean;
}

export interface ANNState {
  contractPerformance: string | number;
  statusDate: string | number;
  nonPerformingDate: string | number;
  maturityDate: string | number;
  terminationDate: string | number;
  notionalPrincipal: string | number;
  accruedInterest: string | number;
  feeAccrued: string | number;
  nominalInterestRate: string | number;
  interestScalingMultiplier: string | number;
  notionalScalingMultiplier: string | number;
  nextPrincipalRedemptionPayment: string | number;
}

export interface CECState {
  contractPerformance: string | number;
  statusDate: string | number;
  maturityDate: string | number;
  exerciseDate: string | number;
  terminationDate: string | number;
  feeAccrued: string | number;
  exerciseAmount: string | number;
}

export interface CEGState {
  contractPerformance: string | number;
  statusDate: string | number;
  nonPerformingDate: string | number;
  maturityDate: string | number;
  exerciseDate: string | number;
  terminationDate: string | number;
  notionalPrincipal: string | number;
  feeAccrued: string | number;
  exerciseAmount: string | number;
}

export interface CERTFState {
  contractPerformance: string | number;
  statusDate: string | number;
  nonPerformingDate: string | number;
  maturityDate: string | number;
  exerciseDate: string | number;
  terminationDate: string | number;
  lastCouponFixingDate: string | number;
  exerciseAmount: string | number;
  exerciseQuantity: string | number;
  quantity: string | number;
  couponAmountFixed: string | number;
  marginFactor: string | number;
  adjustmentFactor: string | number;
}

export interface COLLAState {
  contractPerformance: string | number;
  statusDate: string | number;
  nonPerformingDate: string | number;
  maturityDate: string | number;
  terminationDate: string | number;
  notionalPrincipal: string | number;
  accruedInterest: string | number;
  nominalInterestRate: string | number;
  interestScalingMultiplier: string | number;
  notionalScalingMultiplier: string | number;
}

export interface PAMState {
  contractPerformance: string | number;
  statusDate: string | number;
  nonPerformingDate: string | number;
  maturityDate: string | number;
  terminationDate: string | number;
  notionalPrincipal: string | number;
  accruedInterest: string | number;
  feeAccrued: string | number;
  nominalInterestRate: string | number;
  interestScalingMultiplier: string | number;
  notionalScalingMultiplier: string | number;
}

export interface STKState {
  contractPerformance: string | number;
  statusDate: string | number;
  nonPerformingDate: string | number;
  maturityDate: string | number;
  exerciseDate: string | number;
  terminationDate: string | number;
  lastDividendFixingDate: string | number;
  notionalPrincipal: string | number;
  exerciseAmount: string | number;
  exerciseQuantity: string | number;
  quantity: string | number;
  couponAmountFixed: string | number;
  marginFactor: string | number;
  adjustmentFactor: string | number;
  dividendPaymentAmount: string | number;
  splitRatio: string | number;
}

export interface Terms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  scalingEffect: string | number;
  feeBasis: string | number;
  creditEventTypeCovered: string | number;
  couponType: string | number;
  redeemableByIssuer: string | number;

  currency: string;
  settlementCurrency: string;
  collateralCurrency: string;

  marketObjectCodeRateReset: string | number[];
  marketObjectCodeOfCollateral: string | number[];

  statusDate: string | number;
  initialExchangeDate: string | number;
  issueDate: string | number;
  maturityDate: string | number;
  purchaseDate: string | number;
  capitalizationEndDate: string | number;
  cycleAnchorDateOfInterestPayment: string | number;
  cycleAnchorDateOfRateReset: string | number;
  cycleAnchorDateOfScalingIndex: string | number;
  cycleAnchorDateOfFee: string | number;
  cycleAnchorDateOfPrincipalRedemption: string | number;
  cycleAnchorDateOfRedemption: string | number;
  cycleAnchorDateOfTermination: string | number;
  cycleAnchorDateOfCoupon: string | number;
  cycleAnchorDateOfDividend: string | number;

  notionalPrincipal: string | number;
  nominalPrice: string | number;
  issuePrice: string | number;
  quantity: string | number;
  nominalInterestRate: string | number;
  feeAccrued: string | number;
  accruedInterest: string | number;
  rateMultiplier: string | number;
  rateSpread: string | number;
  feeRate: string | number;
  nextResetRate: string | number;
  couponRate: string | number;
  denominationRatio: string | number;
  premiumDiscountAtIED: string | number;
  priceAtPurchaseDate: string | number;
  priceAtTerminationDate: string | number;
  redemptionPrice: string | number;
  nextPrincipalRedemptionPayment: string | number;
  coverageOfCreditEnhancement: string | number;
  coverageOfCollateral: string | number;
  lifeCap: string | number;
  lifeFloor: string | number;
  periodCap: string | number;
  periodFloor: string | number;

  gracePeriod: IP;
  delinquencyPeriod: IP;
  settlementPeriod: IP;
  fixingPeriod: IP;
  redemptionRecordPeriod: IP;
  redemptionPaymentPeriod: IP;
  dividendRecordPeriod: IP;
  dividendPaymentPeriod: IP;
  splitSettlementPeriod: IP;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;
  cycleOfRedemption: IPS;
  cycleOfTermination: IPS;
  cycleOfCoupon: IPS;
  cycleOfDividend: IPS;

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
  feeBasis: string | number;

  currency: string;
  settlementCurrency: string;

  marketObjectCodeRateReset: string | number[];

  statusDate: string | number;
  initialExchangeDate: string | number;
  maturityDate: string | number;
  issueDate: string | number;
  purchaseDate: string | number;
  capitalizationEndDate: string | number;
  cycleAnchorDateOfInterestPayment: string | number;
  cycleAnchorDateOfRateReset: string | number;
  cycleAnchorDateOfScalingIndex: string | number;
  cycleAnchorDateOfFee: string | number;
  cycleAnchorDateOfPrincipalRedemption: string | number;

  notionalPrincipal: string | number;
  nominalInterestRate: string | number;
  accruedInterest: string | number;
  rateMultiplier: string | number;
  rateSpread: string | number;
  nextResetRate: string | number;
  feeRate: string | number;
  feeAccrued: string | number;
  premiumDiscountAtIED: string | number;
  priceAtPurchaseDate: string | number;
  priceAtTerminationDate: string | number;
  nextPrincipalRedemptionPayment: string | number;

  lifeCap: string | number;
  lifeFloor: string | number;
  periodCap: string | number;
  periodFloor: string | number;

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

  statusDate: string | number;
  maturityDate: string | number;

  notionalPrincipal: string | number;
  feeRate: string | number;
  coverageOfCreditEnhancement: string | number;

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

  statusDate: string | number;
  maturityDate: string | number;
  purchaseDate: string | number;
  cycleAnchorDateOfFee: string | number;

  notionalPrincipal: string | number;
  feeAccrued: string | number;
  feeRate: string | number;
  priceAtPurchaseDate: string | number;
  coverageOfCreditEnhancement: string | number;

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

  statusDate: string | number;
  initialExchangeDate: string | number;
  maturityDate: string | number;
  issueDate: string | number;
  cycleAnchorDateOfRedemption: string | number;
  cycleAnchorDateOfTermination: string | number;
  cycleAnchorDateOfCoupon: string | number;

  nominalPrice: string | number;
  issuePrice: string | number;
  quantity: string | number;
  denominationRatio: string | number;
  couponRate: string | number;

  gracePeriod: IP;
  delinquencyPeriod: IP;
  settlementPeriod: IP;
  fixingPeriod: IP;
  redemptionRecordPeriod: IP;

  cycleOfRedemption: IPS;
  cycleOfTermination: IPS;
  cycleOfCoupon: IPS;

  contractReference_1: ContractReference;
  contractReference_2: ContractReference;
}

export interface COLLATerms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;

  marketObjectCodeOfCollateral: string | number[];

  currency: string;
  settlementCurrency: string;
  collateralCurrency: string;

  statusDate: string | number;
  initialExchangeDate: string | number;
  maturityDate: string | number;
  capitalizationEndDate: string | number;
  cycleAnchorDateOfInterestPayment: string | number;

  notionalPrincipal: string | number;
  nominalInterestRate: string | number;
  accruedInterest: string | number;
  premiumDiscountAtIED: string | number;
  coverageOfCollateral: string | number;

  gracePeriod: IP;
  delinquencyPeriod: IP;

  cycleOfInterestPayment: IPS;
}

export interface PAMTerms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  scalingEffect: string | number;
  feeBasis: string | number;

  currency: string;
  settlementCurrency: string;

  marketObjectCodeRateReset: string | number[];

  statusDate: string | number;
  initialExchangeDate: string | number;
  maturityDate: string | number;
  issueDate: string | number;
  purchaseDate: string | number;
  capitalizationEndDate: string | number;
  cycleAnchorDateOfInterestPayment: string | number;
  cycleAnchorDateOfRateReset: string | number;
  cycleAnchorDateOfScalingIndex: string | number;
  cycleAnchorDateOfFee: string | number;

  notionalPrincipal: string | number;
  nominalInterestRate: string | number;
  accruedInterest: string | number;
  rateMultiplier: string | number;
  rateSpread: string | number;
  nextResetRate: string | number;
  feeRate: string | number;
  feeAccrued: string | number;
  premiumDiscountAtIED: string | number;
  priceAtPurchaseDate: string | number;
  priceAtTerminationDate: string | number;

  lifeCap: string | number;
  lifeFloor: string | number;
  periodCap: string | number;
  periodFloor: string | number;

  gracePeriod: IP;
  delinquencyPeriod: IP;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
}

export interface STKTerms {
  contractType: string | number;
  calendar: string | number;
  contractRole: string | number;
  dayCountConvention: string | number;
  businessDayConvention: string | number;
  endOfMonthConvention: string | number;
  redeemableByIssuer: string | number;

  currency: string;
  settlementCurrency: string;

  statusDate: string | number;
  issueDate: string | number;
  purchaseDate: string | number;
  cycleAnchorDateOfDividend: string | number;

  nominalPrice: string | number;
  notionalPrincipal: string | number;
  issuePrice: string | number;
  quantity: string | number;
  priceAtPurchaseDate: string | number;
  priceAtTerminationDate: string | number;
  redemptionPrice: string | number;

  dividendRecordPeriod: IP;
  dividendPaymentPeriod: IP;
  splitSettlementPeriod: IP;
  redemptionRecordPeriod: IP;
  redemptionPaymentPeriod: IP;

  cycleOfDividend: IPS;
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

export function isANNState(obj: any): obj is ANNState {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.interestScalingMultiplier == undefined || typeof obj.interestScalingMultiplier !== 'number' && typeof obj.interestScalingMultiplier !== 'string') { return false; }
  if (obj.notionalScalingMultiplier == undefined || typeof obj.notionalScalingMultiplier !== 'number' && typeof obj.notionalScalingMultiplier !== 'string') { return false; }
  if (obj.nextPrincipalRedemptionPayment == undefined || typeof obj.nextPrincipalRedemptionPayment !== 'number' && typeof obj.nextPrincipalRedemptionPayment !== 'string') { return false; }

  return true;
}

export function isCECState(obj: any): obj is CECState {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.exerciseAmount == undefined || typeof obj.exerciseAmount !== 'number' && typeof obj.exerciseAmount !== 'string') { return false; }

  return true;
}

export function isCEGState(obj: any): obj is CEGState {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.exerciseAmount == undefined || typeof obj.exerciseAmount !== 'number' && typeof obj.exerciseAmount !== 'string') { return false; }

  return true;
}

export function isCERTFState(obj: any): obj is CERTFState {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.exerciseDate == undefined || typeof obj.exerciseDate !== 'number' && typeof obj.exerciseDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.lastCouponFixingDate == undefined || typeof obj.lastCouponFixingDate !== 'number' && typeof obj.lastCouponFixingDate !== 'string') { return false; }
  if (obj.exerciseAmount == undefined || typeof obj.exerciseAmount !== 'number' && typeof obj.exerciseAmount !== 'string') { return false; }
  if (obj.exerciseQuantity == undefined || typeof obj.exerciseQuantity !== 'number' && typeof obj.exerciseQuantity !== 'string') { return false; }
  if (obj.quantity == undefined || typeof obj.quantity !== 'number' && typeof obj.quantity !== 'string') { return false; }
  if (obj.couponAmountFixed == undefined || typeof obj.couponAmountFixed !== 'number' && typeof obj.couponAmountFixed !== 'string') { return false; }
  if (obj.marginFactor == undefined || typeof obj.marginFactor !== 'number' && typeof obj.marginFactor !== 'string') { return false; }
  if (obj.adjustmentFactor == undefined || typeof obj.adjustmentFactor !== 'number' && typeof obj.adjustmentFactor !== 'string') { return false; }

  return true;
}

export function isCOLLAState(obj: any): obj is COLLAState {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.interestScalingMultiplier == undefined || typeof obj.interestScalingMultiplier !== 'number' && typeof obj.interestScalingMultiplier !== 'string') { return false; }
  if (obj.notionalScalingMultiplier == undefined || typeof obj.notionalScalingMultiplier !== 'number' && typeof obj.notionalScalingMultiplier !== 'string') { return false; }

  return true;
}

export function isPAMState(obj: any): obj is PAMState {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.interestScalingMultiplier == undefined || typeof obj.interestScalingMultiplier !== 'number' && typeof obj.interestScalingMultiplier !== 'string') { return false; }
  if (obj.notionalScalingMultiplier == undefined || typeof obj.notionalScalingMultiplier !== 'number' && typeof obj.notionalScalingMultiplier !== 'string') { return false; }

  return true;
}

export function isSTKState(obj: any): obj is STKState {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.exerciseDate == undefined || typeof obj.exerciseDate !== 'number' && typeof obj.exerciseDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.lastDividendFixingDate == undefined || typeof obj.lastDividendFixingDate !== 'number' && typeof obj.lastDividendFixingDate !== 'string') { return false; }
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.exerciseAmount == undefined || typeof obj.exerciseAmount !== 'number' && typeof obj.exerciseAmount !== 'string') { return false; }
  if (obj.exerciseQuantity == undefined || typeof obj.exerciseQuantity !== 'number' && typeof obj.exerciseQuantity !== 'string') { return false; }
  if (obj.quantity == undefined || typeof obj.quantity !== 'number' && typeof obj.quantity !== 'string') { return false; }
  if (obj.couponAmountFixed == undefined || typeof obj.couponAmountFixed !== 'number' && typeof obj.couponAmountFixed !== 'string') { return false; }
  if (obj.marginFactor == undefined || typeof obj.marginFactor !== 'number' && typeof obj.marginFactor !== 'string') { return false; }
  if (obj.adjustmentFactor == undefined || typeof obj.adjustmentFactor !== 'number' && typeof obj.adjustmentFactor !== 'string') { return false; }
  if (obj.dividendPaymentAmount == undefined || typeof obj.dividendPaymentAmount !== 'number' && typeof obj.dividendPaymentAmount !== 'string') { return false; }
  if (obj.splitRatio == undefined || typeof obj.splitRatio !== 'number' && typeof obj.splitRatio !== 'string') { return false; }

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
  if (obj.feeBasis == undefined || typeof obj.feeBasis !== 'string' && typeof obj.feeBasis !== 'number') { return false; }
  if (obj.creditEventTypeCovered == undefined || typeof obj.creditEventTypeCovered !== 'string' && typeof obj.creditEventTypeCovered !== 'number') { return false; }
  if (obj.couponType == undefined || typeof obj.couponType !== 'string' && typeof obj.couponType !== 'number') { return false; }
  if (obj.redeemableByIssuer == undefined || typeof obj.redeemableByIssuer !== 'string' && typeof obj.redeemableByIssuer !== 'number') { return false; }

  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }
  if (obj.collateralCurrency == undefined || typeof obj.collateralCurrency !== 'string') { return false; }

  if (obj.marketObjectCodeRateReset == undefined || typeof obj.marketObjectCodeRateReset !== 'string') { return false; }
  if (obj.marketObjectCodeOfCollateral == undefined || typeof obj.marketObjectCodeOfCollateral !== 'string') { return false; }

  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.issueDate == undefined || typeof obj.issueDate !== 'number' && typeof obj.issueDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.purchaseDate == undefined || typeof obj.purchaseDate !== 'number' && typeof obj.purchaseDate !== 'string') { return false; }
  if (obj.capitalizationEndDate == undefined || typeof obj.capitalizationEndDate !== 'number' && typeof obj.capitalizationEndDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfInterestPayment == undefined || typeof obj.cycleAnchorDateOfInterestPayment !== 'number' && typeof obj.cycleAnchorDateOfInterestPayment !== 'string') { return false; }
  if (obj.cycleAnchorDateOfRateReset == undefined || typeof obj.cycleAnchorDateOfRateReset !== 'number' && typeof obj.cycleAnchorDateOfRateReset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfScalingIndex == undefined || typeof obj.cycleAnchorDateOfScalingIndex !== 'number' && typeof obj.cycleAnchorDateOfScalingIndex !== 'string') { return false; }
  if (obj.cycleAnchorDateOfFee == undefined || typeof obj.cycleAnchorDateOfFee !== 'number' && typeof obj.cycleAnchorDateOfFee !== 'string') { return false; }
  if (obj.cycleAnchorDateOfPrincipalRedemption == undefined || typeof obj.cycleAnchorDateOfPrincipalRedemption !== 'number' && typeof obj.cycleAnchorDateOfPrincipalRedemption !== 'string') { return false; }
  if (obj.cycleAnchorDateOfRedemption == undefined || typeof obj.cycleAnchorDateOfRedemption !== 'number' && typeof obj.cycleAnchorDateOfRedemption !== 'string') { return false; }
  if (obj.cycleAnchorDateOfTermination == undefined || typeof obj.cycleAnchorDateOfTermination !== 'number' && typeof obj.cycleAnchorDateOfTermination !== 'string') { return false; }
  if (obj.cycleAnchorDateOfCoupon == undefined || typeof obj.cycleAnchorDateOfCoupon !== 'number' && typeof obj.cycleAnchorDateOfCoupon !== 'string') { return false; }
  if (obj.cycleAnchorDateOfDividend == undefined || typeof obj.cycleAnchorDateOfDividend !== 'number' && typeof obj.cycleAnchorDateOfDividend !== 'string') { return false; }

  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.nominalPrice == undefined || typeof obj.nominalPrice !== 'number' && typeof obj.nominalPrice !== 'string') { return false; }
  if (obj.issuePrice == undefined || typeof obj.issuePrice !== 'number' && typeof obj.issuePrice !== 'string') { return false; }
  if (obj.quantity == undefined || typeof obj.quantity !== 'number' && typeof obj.quantity !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.rateMultiplier == undefined || typeof obj.rateMultiplier !== 'number' && typeof obj.rateMultiplier !== 'string') { return false; }
  if (obj.rateSpread == undefined || typeof obj.rateSpread !== 'number' && typeof obj.rateSpread !== 'string') { return false; }
  if (obj.feeRate == undefined || typeof obj.feeRate !== 'number' && typeof obj.feeRate !== 'string') { return false; }
  if (obj.nextResetRate == undefined || typeof obj.nextResetRate !== 'number' && typeof obj.nextResetRate !== 'string') { return false; }
  if (obj.couponRate == undefined || typeof obj.couponRate !== 'number' && typeof obj.couponRate !== 'string') { return false; }
  if (obj.denominationRatio == undefined || typeof obj.denominationRatio !== 'number' && typeof obj.denominationRatio !== 'string') { return false; }
  if (obj.premiumDiscountAtIED == undefined || typeof obj.premiumDiscountAtIED !== 'number' && typeof obj.premiumDiscountAtIED !== 'string') { return false; }
  if (obj.priceAtPurchaseDate == undefined || typeof obj.priceAtPurchaseDate !== 'number' && typeof obj.priceAtPurchaseDate !== 'string') { return false; }
  if (obj.priceAtTerminationDate == undefined || typeof obj.priceAtTerminationDate !== 'number' && typeof obj.priceAtTerminationDate !== 'string') { return false; }
  if (obj.redemptionPrice == undefined || typeof obj.redemptionPrice !== 'number' && typeof obj.redemptionPrice !== 'string') { return false; }
  if (obj.nextPrincipalRedemptionPayment == undefined || typeof obj.nextPrincipalRedemptionPayment !== 'number' && typeof obj.nextPrincipalRedemptionPayment !== 'string') { return false; }
  if (obj.coverageOfCreditEnhancement == undefined || typeof obj.coverageOfCreditEnhancement !== 'number' && typeof obj.coverageOfCreditEnhancement !== 'string') { return false; }
  if (obj.coverageOfCollateral == undefined || typeof obj.coverageOfCollateral !== 'number' && typeof obj.coverageOfCollateral !== 'string') { return false; }
  if (obj.lifeCap == undefined || typeof obj.lifeCap !== 'number' && typeof obj.lifeCap !== 'string') { return false; }
  if (obj.lifeFloor == undefined || typeof obj.lifeFloor !== 'number' && typeof obj.lifeFloor !== 'string') { return false; }
  if (obj.periodCap == undefined || typeof obj.periodCap !== 'number' && typeof obj.periodCap !== 'string') { return false; }
  if (obj.periodFloor == undefined || typeof obj.periodFloor !== 'number' && typeof obj.periodFloor !== 'string') { return false; }

  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }
  if (!isIP(obj.settlementPeriod)) { return false; }
  if (!isIP(obj.fixingPeriod)) { return false; }
  if (!isIP(obj.redemptionRecordPeriod)) { return false; }
  if (!isIP(obj.redemptionPaymentPeriod)) { return false; }
  if (!isIP(obj.dividendRecordPeriod)) { return false; }
  if (!isIP(obj.dividendPaymentPeriod)) { return false; }
  if (!isIP(obj.splitSettlementPeriod)) { return false; }

  if (!isIPS(obj.cycleOfInterestPayment)) { return false; }
  if (!isIPS(obj.cycleOfRateReset)) { return false; }
  if (!isIPS(obj.cycleOfScalingIndex)) { return false; }
  if (!isIPS(obj.cycleOfFee)) { return false; }
  if (!isIPS(obj.cycleOfPrincipalRedemption)) { return false; }
  if (!isIPS(obj.cycleOfRedemption)) { return false; }
  if (!isIPS(obj.cycleOfTermination)) { return false; }
  if (!isIPS(obj.cycleOfCoupon)) { return false; }
  if (!isIPS(obj.cycleOfDividend)) { return false; }

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
  if (obj.feeBasis == undefined || typeof obj.feeBasis !== 'string' && typeof obj.feeBasis !== 'number') { return false; }

  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }

  if (obj.marketObjectCodeRateReset == undefined || typeof obj.marketObjectCodeRateReset !== 'string') { return false; }

  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.issueDate == undefined || typeof obj.issueDate !== 'number' && typeof obj.issueDate !== 'string') { return false; }
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
  if (obj.premiumDiscountAtIED == undefined || typeof obj.premiumDiscountAtIED !== 'number' && typeof obj.premiumDiscountAtIED !== 'string') { return false; }
  if (obj.priceAtPurchaseDate == undefined || typeof obj.priceAtPurchaseDate !== 'number' && typeof obj.priceAtPurchaseDate !== 'string') { return false; }
  if (obj.priceAtTerminationDate == undefined || typeof obj.priceAtTerminationDate !== 'number' && typeof obj.priceAtTerminationDate !== 'string') { return false; }
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

  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.purchaseDate == undefined || typeof obj.purchaseDate !== 'number' && typeof obj.purchaseDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfFee == undefined || typeof obj.cycleAnchorDateOfFee !== 'number' && typeof obj.cycleAnchorDateOfFee !== 'string') { return false; }

  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
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
  if (!isIP(obj.redemptionRecordPeriod)) { return false; }

  if (!isIPS(obj.cycleOfRedemption)) { return false; }
  if (!isIPS(obj.cycleOfTermination)) { return false; }
  if (!isIPS(obj.cycleOfCoupon)) { return false; }

  if (!isContractReference(obj.contractReference_1)) { return false; }
  if (!isContractReference(obj.contractReference_2)) { return false; }

  return true;
}

export function isCOLLATerms (obj: any): obj is PAMTerms {
  if (!obj) { return false; }
  if (obj.contractType == undefined || typeof obj.contractType !== 'string' && typeof obj.contractType !== 'number') { return false; }
  if (obj.calendar == undefined || typeof obj.calendar !== 'string' && typeof obj.calendar !== 'number') { return false; }
  if (obj.contractRole == undefined || typeof obj.contractRole !== 'string' && typeof obj.contractRole !== 'number') { return false; }
  if (obj.dayCountConvention == undefined || typeof obj.dayCountConvention !== 'string' && typeof obj.dayCountConvention !== 'number') { return false; }
  if (obj.businessDayConvention == undefined || typeof obj.businessDayConvention !== 'string' && typeof obj.businessDayConvention !== 'number') { return false; }
  if (obj.endOfMonthConvention == undefined || typeof obj.endOfMonthConvention !== 'string' && typeof obj.endOfMonthConvention !== 'number') { return false; }

  if (obj.marketObjectCodeOfCollateral == undefined || typeof obj.marketObjectCodeOfCollateral !== 'string') { return false; }

  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }
  if (obj.collateralCurrency == undefined || typeof obj.collateralCurrency !== 'string') { return false; }

  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.capitalizationEndDate == undefined || typeof obj.capitalizationEndDate !== 'number' && typeof obj.capitalizationEndDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfInterestPayment == undefined || typeof obj.cycleAnchorDateOfInterestPayment !== 'number' && typeof obj.cycleAnchorDateOfInterestPayment !== 'string') { return false; }

  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.premiumDiscountAtIED == undefined || typeof obj.premiumDiscountAtIED !== 'number' && typeof obj.premiumDiscountAtIED !== 'string') { return false; }
  if (obj.coverageOfCollateral == undefined || typeof obj.coverageOfCollateral !== 'number' && typeof obj.coverageOfCollateral !== 'string') { return false; }

  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }

  if (!isIPS(obj.cycleOfInterestPayment)) { return false; }

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
  if (obj.feeBasis == undefined || typeof obj.feeBasis !== 'string' && typeof obj.feeBasis !== 'number') { return false; }

  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }

  if (obj.marketObjectCodeRateReset == undefined || typeof obj.marketObjectCodeRateReset !== 'string') { return false; }

  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.issueDate == undefined || typeof obj.issueDate !== 'number' && typeof obj.issueDate !== 'string') { return false; }
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
  if (obj.premiumDiscountAtIED == undefined || typeof obj.premiumDiscountAtIED !== 'number' && typeof obj.premiumDiscountAtIED !== 'string') { return false; }
  if (obj.priceAtPurchaseDate == undefined || typeof obj.priceAtPurchaseDate !== 'number' && typeof obj.priceAtPurchaseDate !== 'string') { return false; }
  if (obj.priceAtTerminationDate == undefined || typeof obj.priceAtTerminationDate !== 'number' && typeof obj.priceAtTerminationDate !== 'string') { return false; }

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

export function isSTKTerms (obj: any): obj is STKTerms {
  if (!obj) { return false; }
  if (obj.contractType == undefined || typeof obj.contractType !== 'string' && typeof obj.contractType !== 'number') { return false; }
  if (obj.calendar == undefined || typeof obj.calendar !== 'string' && typeof obj.calendar !== 'number') { return false; }
  if (obj.contractRole == undefined || typeof obj.contractRole !== 'string' && typeof obj.contractRole !== 'number') { return false; }
  if (obj.dayCountConvention == undefined || typeof obj.dayCountConvention !== 'string' && typeof obj.dayCountConvention !== 'number') { return false; }
  if (obj.businessDayConvention == undefined || typeof obj.businessDayConvention !== 'string' && typeof obj.businessDayConvention !== 'number') { return false; }
  if (obj.endOfMonthConvention == undefined || typeof obj.endOfMonthConvention !== 'string' && typeof obj.endOfMonthConvention !== 'number') { return false; }
  if (obj.redeemableByIssuer == undefined || typeof obj.redeemableByIssuer !== 'string' && typeof obj.redeemableByIssuer !== 'number') { return false; }

  if (obj.currency == undefined || typeof obj.currency !== 'string') { return false; }
  if (obj.settlementCurrency == undefined || typeof obj.settlementCurrency !== 'string') { return false; }

  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.issueDate == undefined || typeof obj.issueDate !== 'number' && typeof obj.issueDate !== 'string') { return false; }
  if (obj.purchaseDate == undefined || typeof obj.purchaseDate !== 'number' && typeof obj.purchaseDate !== 'string') { return false; }
  if (obj.cycleAnchorDateOfDividend == undefined || typeof obj.cycleAnchorDateOfDividend !== 'number' && typeof obj.cycleAnchorDateOfDividend !== 'string') { return false; }

  if (obj.nominalPrice == undefined || typeof obj.nominalPrice !== 'number' && typeof obj.nominalPrice !== 'string') { return false; }
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.issuePrice == undefined || typeof obj.issuePrice !== 'number' && typeof obj.issuePrice !== 'string') { return false; }
  if (obj.quantity == undefined || typeof obj.quantity !== 'number' && typeof obj.quantity !== 'string') { return false; }
  if (obj.priceAtPurchaseDate == undefined || typeof obj.priceAtPurchaseDate !== 'number' && typeof obj.priceAtPurchaseDate !== 'string') { return false; }
  if (obj.redemptionPrice == undefined || typeof obj.redemptionPrice !== 'number' && typeof obj.redemptionPrice !== 'string') { return false; }
  if (obj.priceAtTerminationDate == undefined || typeof obj.priceAtTerminationDate !== 'number' && typeof obj.priceAtTerminationDate !== 'string') { return false; }

  if (!isIP(obj.redemptionRecordPeriod)) { return false; }
  if (!isIP(obj.redemptionPaymentPeriod)) { return false; }
  if (!isIP(obj.dividendRecordPeriod)) { return false; }
  if (!isIP(obj.dividendPaymentPeriod)) { return false; }
  if (!isIP(obj.splitSettlementPeriod)) { return false; }

  if (!isIPS(obj.cycleOfDividend)) { return false; }

  return true;
}
