
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
  
  contractReference_1: ContractReference;
  contractReference_2: ContractReference;
  
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

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;

  gracePeriod: IP;
  delinquencyPeriod: IP;

  lifeCap: number | string;
  lifeFloor: number | string;
  periodCap: number | string;
  periodFloor: number | string;
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

  contractReference_1: ContractReference;
  contractReference_2: ContractReference;

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

  gracePeriod: IP;
  delinquencyPeriod: IP;

  lifeCap: number | string;
  lifeFloor: number | string;
  periodCap: number | string;
  periodFloor: number | string;
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
  notionalPrincipal: number | string;
  nominalInterestRate: number | string;
  premiumDiscountAtIED: number | string;
  rateSpread: number | string;
  lifeCap: number | string;
  lifeFloor: number | string;
  coverageOfCreditEnhancement: number | string;
  contractReference_1: ContractReference;
  contractReference_2: ContractReference;
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

  feeAccrued: number | string;
  accruedInterest: number | string;
  rateMultiplier: number | string;
  feeRate: number | string;
  nextResetRate: number | string;
  penaltyRate: number | string;
  priceAtPurchaseDate: number | string;
  nextPrincipalRedemptionPayment: number | string;

  gracePeriod: IP;
  delinquencyPeriod: IP;

  periodCap: number | string;
  periodFloor: number | string;
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

  feeAccrued: number | string;
  accruedInterest: number | string;
  rateMultiplier: number | string;
  feeRate: number | string;
  nextResetRate: number | string;
  penaltyRate: number | string;
  priceAtPurchaseDate: number | string;
  nextPrincipalRedemptionPayment: number | string;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;

  gracePeriod: IP;
  delinquencyPeriod: IP;

  periodCap: number | string;
  periodFloor: number | string;
}
