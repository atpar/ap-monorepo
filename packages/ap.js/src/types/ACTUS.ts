
// schedule ids
export const NON_CYLIC_SCHEDULE_ID = '255';
export const IP_SCHEDULE_ID = '8';
export const PR_SCHEDULE_ID = '15';
export const SC_SCHEDULE_ID = '19';
export const RR_SCHEDULE_ID = '18';
export const PY_SCHEDULE_ID = '11';

// define zero offset as offset == anchorDate
export const ZERO_OFFSET = '1'; // '0xFFFFFFFFFFFFFFFF';

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
  contractReferenceType: number | string;
  contractReferenceRole: number | string;
}

export interface State {
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

  creatorID: string | number[];
  counterpartyID: string | number[];
  marketObjectCodeRateReset: string | number[];
  
  contractDealDate: number | string;
  statusDate: number | string;
  initialExchangeDate: number | string;
  maturityDate: number | string;
  terminationDate: number | string;
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

export interface LifecycleTerms {
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

  gracePeriod: IP;
  delinquencyPeriod: IP;

  contractReference_1: ContractReference;
  contractReference_2: ContractReference;
}

export interface GeneratingTerms {
  scalingEffect: string | number;
  
  contractDealDate: number | string;
  statusDate: number | string;
  initialExchangeDate: number | string;
  maturityDate: number | string;
  terminationDate: number | string;
  purchaseDate: number | string;
  capitalizationEndDate: number | string;
  cycleAnchorDateOfInterestPayment: number | string;
  cycleAnchorDateOfRateReset: number | string;
  cycleAnchorDateOfScalingIndex: number | string;
  cycleAnchorDateOfFee: number | string;
  cycleAnchorDateOfPrincipalRedemption: number | string;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;

  gracePeriod: IP;
  delinquencyPeriod: IP;
}

export interface CustomTerms {
  anchorDate: string | number;
  overwrittenAttributesMap: string;
  overwrittenTerms: LifecycleTerms;
}

export interface TemplateTerms {
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

  gracePeriod: IP;
  delinquencyPeriod: IP;
}

export interface ExtendedTemplateTerms {
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

  creatorID: string | number[];
  counterpartyID: string | number[];

  marketObjectCodeRateReset: string | number[];
  
  contractDealDateOffset: number | string;
  statusDateOffset: number | string;
  initialExchangeDateOffset: number | string;
  maturityDateOffset: number | string;
  terminationDateOffset: number | string;
  purchaseDateOffset: number | string;
  capitalizationEndDateOffset: number | string;
  cycleAnchorDateOfInterestPaymentOffset: number | string;
  cycleAnchorDateOfRateResetOffset: number | string;
  cycleAnchorDateOfScalingIndexOffset: number | string;
  cycleAnchorDateOfFeeOffset: number | string;
  cycleAnchorDateOfPrincipalRedemptionOffset: number | string;

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

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;

  gracePeriod: IP;
  delinquencyPeriod: IP;
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
    obj.contractReferenceType == undefined
    || (typeof obj.contractReferenceType !== 'number' && typeof obj.contractReferenceType !== 'string')
  ) { return false; }
  if (
    obj.contractReferenceRole == undefined
    || (typeof obj.contractReferenceRole !== 'number' && typeof obj.contractReferenceRole !== 'string')
  ) { return false; }

  return true;
}
