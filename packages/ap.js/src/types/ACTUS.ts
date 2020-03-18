
// schedule ids
export const NON_CYLIC_SCHEDULE_ID = '255';
export const IP_SCHEDULE_ID = '8';
export const PR_SCHEDULE_ID = '15';
export const SC_SCHEDULE_ID = '19';
export const RR_SCHEDULE_ID = '18';
export const PY_SCHEDULE_ID = '11';

// define zero offset (1) as offset == anchorDate
export const ZERO_OFFSET = '1';

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

export function isState(obj: any): obj is State {
  if (!obj) { return false; }
  if (obj.contractPerformance == undefined || typeof obj.contractPerformance !== 'number' && typeof obj.contractPerformance !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.nonPerformingDate == undefined || typeof obj.nonPerformingDate !== 'number' && typeof obj.nonPerformingDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.executionDate == undefined || typeof obj.executionDate !== 'number' && typeof obj.executionDate !== 'string') { return false; }
  if (obj.notionalPrincipal == undefined || typeof obj.notionalPrincipal !== 'number' && typeof obj.notionalPrincipal !== 'string') { return false; }
  if (obj.accruedInterest == undefined || typeof obj.accruedInterest !== 'number' && typeof obj.accruedInterest !== 'string') { return false; }
  if (obj.feeAccrued == undefined || typeof obj.feeAccrued !== 'number' && typeof obj.feeAccrued !== 'string') { return false; }
  if (obj.nominalInterestRate == undefined || typeof obj.nominalInterestRate !== 'number' && typeof obj.nominalInterestRate !== 'string') { return false; }
  if (obj.interestScalingMultiplier == undefined || typeof obj.interestScalingMultiplier !== 'number' && typeof obj.interestScalingMultiplier !== 'string') { return false; }
  if (obj.notionalScalingMultiplier == undefined || typeof obj.notionalScalingMultiplier !== 'number' && typeof obj.notionalScalingMultiplier !== 'string') { return false; }
  if (obj.nextPrincipalRedemptionPayment == undefined || typeof obj.nextPrincipalRedemptionPayment !== 'number' && typeof obj.nextPrincipalRedemptionPayment !== 'string') { return false; }
  if (obj.executionAmount == undefined || typeof obj.executionAmount !== 'number' && typeof obj.executionAmount !== 'string') { return false; }

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
  
  if (obj.creatorID == undefined || typeof obj.creatorID !== 'string') { return false; }
  if (obj.counterpartyID == undefined || typeof obj.counterpartyID !== 'string') { return false; }
  
  if (obj.marketObjectCodeRateReset == undefined || typeof obj.marketObjectCodeRateReset !== 'string' || typeof obj.marketObjectCodeRateReset !== 'object') { return false; }
  
  if (obj.contractDealDate == undefined || typeof obj.contractDealDate !== 'number' && typeof obj.contractDealDate !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
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

export function isLifecycleTerms (obj: any): obj is LifecycleTerms {
  if (!obj) { return false; }
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
  
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  
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
  
  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }
  
  if (!isContractReference(obj.contractReference_1)) { return false; }
  if (!isContractReference(obj.contractReference_2)) { return false; }

  return true;
}

export function isGeneratingTerms (obj: any): obj is GeneratingTerms {
  if (!obj) { return false; }
  if (obj.scalingEffect == undefined || typeof obj.scalingEffect !== 'string' || typeof obj.scalingEffect !== 'number') { return false; }
 
  if (obj.contractDealDate == undefined || typeof obj.contractDealDate !== 'number' && typeof obj.contractDealDate !== 'string') { return false; }
  if (obj.statusDate == undefined || typeof obj.statusDate !== 'number' && typeof obj.statusDate !== 'string') { return false; }
  if (obj.initialExchangeDate == undefined || typeof obj.initialExchangeDate !== 'number' && typeof obj.initialExchangeDate !== 'string') { return false; }
  if (obj.maturityDate == undefined || typeof obj.maturityDate !== 'number' && typeof obj.maturityDate !== 'string') { return false; }
  if (obj.terminationDate == undefined || typeof obj.terminationDate !== 'number' && typeof obj.terminationDate !== 'string') { return false; }
  if (obj.purchaseDate == undefined || typeof obj.purchaseDate !== 'number' && typeof obj.purchaseDate !== 'string') { return false; }
  if (obj.capitalizationEndDate == undefined || typeof obj.capitalizationEndDate !== 'number' && typeof obj.capitalizationEndDate !== 'string') { return false; }
 
  if (obj.cycleAnchorDateOfInterestPayment == undefined || typeof obj.cycleAnchorDateOfInterestPayment !== 'number' && typeof obj.cycleAnchorDateOfInterestPayment !== 'string') { return false; }
  if (obj.cycleAnchorDateOfRateReset == undefined || typeof obj.cycleAnchorDateOfRateReset !== 'number' && typeof obj.cycleAnchorDateOfRateReset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfScalingIndex == undefined || typeof obj.cycleAnchorDateOfScalingIndex !== 'number' && typeof obj.cycleAnchorDateOfScalingIndex !== 'string') { return false; }
  if (obj.cycleAnchorDateOfFee == undefined || typeof obj.cycleAnchorDateOfFee !== 'number' && typeof obj.cycleAnchorDateOfFee !== 'string') { return false; }
  if (obj.cycleAnchorDateOfPrincipalRedemption == undefined || typeof obj.cycleAnchorDateOfPrincipalRedemption !== 'number' && typeof obj.cycleAnchorDateOfPrincipalRedemption !== 'string') { return false; }
 
  if (!isIPS(obj.cycleOfInterestPayment)) { return false; }
  if (!isIPS(obj.cycleOfRateReset)) { return false; }
  if (!isIPS(obj.cycleOfScalingIndex)) { return false; }
  if (!isIPS(obj.cycleOfFee)) { return false; }
  if (!isIPS(obj.cycleOfPrincipalRedemption)) { return false; }
 
  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }

  return true;
}

export function isCustomTerms (obj: any): obj is CustomTerms {
  if (!obj) { return false; }
  if (obj.anchorDate == undefined || typeof obj.anchorDate !== 'number' && typeof obj.anchorDate !== 'string') { return false; }
  if (obj.overwrittenAttributesMap == undefined || typeof obj.overwrittenAttributesMap !== 'number' && typeof obj.overwrittenAttributesMap !== 'string') { return false; }
  if (!isLifecycleTerms(obj.overwrittenTerms)) { return false; }

  return true;
}

export function isTemplateTerms (obj: any): obj is TemplateTerms {
  if (!obj) { return false; }
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

  if (obj.statusDateOffset == undefined || typeof obj.statusDateOffset !== 'number' && typeof obj.statusDateOffset !== 'string') { return false; }
  if (obj.maturityDateOffset == undefined || typeof obj.maturityDateOffset !== 'number' && typeof obj.maturityDateOffset !== 'string') { return false; }

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
 
  if (!isIP(obj.gracePeriod)) { return false; }
  if (!isIP(obj.delinquencyPeriod)) { return false; }

  return true;
}

export function isExtendedTemplateTerms (obj: any): obj is ExtendedTemplateTerms {
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
  
  if (obj.creatorID == undefined || typeof obj.creatorID !== 'string') { return false; }
  if (obj.counterpartyID == undefined || typeof obj.counterpartyID !== 'string') { return false; }
  
  if (obj.marketObjectCodeRateReset == undefined || typeof obj.marketObjectCodeRateReset !== 'string') { return false; }
  
  if (obj.contractDealDateOffset == undefined || typeof obj.contractDealDateOffset !== 'number' && typeof obj.contractDealDateOffset !== 'string') { return false; }
  if (obj.statusDateOffset == undefined || typeof obj.statusDateOffset !== 'number' && typeof obj.statusDateOffset !== 'string') { return false; }
  if (obj.initialExchangeDateOffset == undefined || typeof obj.initialExchangeDateOffset !== 'number' && typeof obj.initialExchangeDateOffset !== 'string') { return false; }
  if (obj.maturityDateOffset == undefined || typeof obj.maturityDateOffset !== 'number' && typeof obj.maturityDateOffset !== 'string') { return false; }
  if (obj.terminationDateOffset == undefined || typeof obj.terminationDateOffset !== 'number' && typeof obj.terminationDateOffset !== 'string') { return false; }
  if (obj.purchaseDateOffset == undefined || typeof obj.purchaseDateOffset !== 'number' && typeof obj.purchaseDateOffset !== 'string') { return false; }
  if (obj.capitalizationEndDateOffset == undefined || typeof obj.capitalizationEndDateOffset !== 'number' && typeof obj.capitalizationEndDateOffset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfInterestPaymentOffset == undefined || typeof obj.cycleAnchorDateOfInterestPaymentOffset !== 'number' && typeof obj.cycleAnchorDateOfInterestPaymentOffset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfRateResetOffset == undefined || typeof obj.cycleAnchorDateOfRateResetOffset !== 'number' && typeof obj.cycleAnchorDateOfRateResetOffset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfScalingIndexOffset == undefined || typeof obj.cycleAnchorDateOfScalingIndexOffset !== 'number' && typeof obj.cycleAnchorDateOfScalingIndexOffset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfFeeOffset == undefined || typeof obj.cycleAnchorDateOfFeeOffset !== 'number' && typeof obj.cycleAnchorDateOfFeeOffset !== 'string') { return false; }
  if (obj.cycleAnchorDateOfPrincipalRedemptionOffset == undefined || typeof obj.cycleAnchorDateOfPrincipalRedemptionOffset !== 'number' && typeof obj.cycleAnchorDateOfPrincipalRedemptionOffset !== 'string') { return false; }
  
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
  
  return true;
}
