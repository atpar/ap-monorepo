import {
  IP,
  IPS,
  ContractReference,
  State,
  Terms,
  GeneratingTerms,
  LifecycleTerms,
  TemplateTerms,
  ExtendedTemplateTerms
} from '../types'; 

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export const EMPTY_IP: IP = { i: '0', p: '0', isSet: false };
export const EMPTY_IPS: IPS = { i: '0', p: '0', s: '0', isSet: false };

export const EMPTY_CONTRACT_REFERENCE: ContractReference = {
  object: ZERO_BYTES32,
  _type: '0',
  role: '0'
};

export const EMPTY_STATE: State = {
  contractPerformance: '0',
  statusDate: '0',
  nonPerformingDate: '0',
  maturityDate: '0',
  exerciseDate: '0',
  terminationDate: '0',
  notionalPrincipal: '0',
  accruedInterest: '0',
  feeAccrued: '0',
  nominalInterestRate: '0',
  interestScalingMultiplier: '0',
  notionalScalingMultiplier: '0',
  nextPrincipalRedemptionPayment: '0',
  exerciseAmount: '0',
};

export const EMPTY_TERMS: Terms = {
  contractType: '0',
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  scalingEffect: '0',
  penaltyType: '0',
  feeBasis: '0',
  creditEventTypeCovered: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  marketObjectCodeRateReset: ZERO_BYTES32,

  contractDealDate: '0',
  statusDate: '0',
  initialExchangeDate: '0',
  maturityDate: '0',
  purchaseDate: '0',
  capitalizationEndDate: '0',
  cycleAnchorDateOfInterestPayment: '0',
  cycleAnchorDateOfRateReset: '0',
  cycleAnchorDateOfScalingIndex: '0',
  cycleAnchorDateOfFee: '0',
  cycleAnchorDateOfPrincipalRedemption: '0',

  notionalPrincipal: '0',
  nominalInterestRate: '0',
  feeAccrued: '0',
  accruedInterest: '0',
  rateMultiplier: '0',
  rateSpread: '0',
  feeRate: '0',
  nextResetRate: '0',
  penaltyRate: '0',
  premiumDiscountAtIED: '0',
  priceAtPurchaseDate: '0',
  nextPrincipalRedemptionPayment: '0',
  coverageOfCreditEnhancement: '0',
  lifeCap: '0',
  lifeFloor: '0',
  periodCap: '0',
  periodFloor: '0',

  cycleOfInterestPayment: EMPTY_IPS,
  cycleOfRateReset: EMPTY_IPS,
  cycleOfScalingIndex: EMPTY_IPS,
  cycleOfFee: EMPTY_IPS,
  cycleOfPrincipalRedemption: EMPTY_IPS,

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,

  contractReference_1: EMPTY_CONTRACT_REFERENCE,
  contractReference_2: EMPTY_CONTRACT_REFERENCE
};

export const EMPTY_GENERATING_TERMS: GeneratingTerms = {
  scalingEffect: '0',

  contractDealDate: '0',
  statusDate: '0',
  initialExchangeDate: '0',
  maturityDate: '0',
  purchaseDate: '0',
  capitalizationEndDate: '0',
  cycleAnchorDateOfInterestPayment: '0',
  cycleAnchorDateOfRateReset: '0',
  cycleAnchorDateOfScalingIndex: '0',
  cycleAnchorDateOfFee: '0',
  cycleAnchorDateOfPrincipalRedemption: '0',

  cycleOfInterestPayment: EMPTY_IPS,
  cycleOfRateReset: EMPTY_IPS,
  cycleOfScalingIndex: EMPTY_IPS,
  cycleOfFee: EMPTY_IPS,
  cycleOfPrincipalRedemption: EMPTY_IPS,

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,
};

export const EMPTY_LIFECYCLE_TERMS: LifecycleTerms = {
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  scalingEffect: '0',
  penaltyType: '0',
  feeBasis: '0',
  creditEventTypeCovered: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  marketObjectCodeRateReset: ZERO_BYTES32,

  statusDate: '0',
  maturityDate: '0',

  notionalPrincipal: '0',
  nominalInterestRate: '0',
  feeAccrued: '0',
  accruedInterest: '0',
  rateMultiplier: '0',
  rateSpread: '0',
  feeRate: '0',
  nextResetRate: '0',
  penaltyRate: '0',
  premiumDiscountAtIED: '0',
  priceAtPurchaseDate: '0',
  nextPrincipalRedemptionPayment: '0',
  coverageOfCreditEnhancement: '0',
  lifeCap: '0',
  lifeFloor: '0',
  periodCap: '0',
  periodFloor: '0',

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,

  contractReference_1: EMPTY_CONTRACT_REFERENCE,
  contractReference_2: EMPTY_CONTRACT_REFERENCE
};

export const EMPTY_TEMPLATE_TERMS: TemplateTerms = {
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  scalingEffect: '0',
  penaltyType: '0',
  feeBasis: '0',
  creditEventTypeCovered: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  marketObjectCodeRateReset: ZERO_BYTES32,

  statusDateOffset: '0',
  maturityDateOffset: '0',

  notionalPrincipal: '0',
  nominalInterestRate: '0',
  feeAccrued: '0',
  accruedInterest: '0',
  rateMultiplier: '0',
  rateSpread: '0',
  feeRate: '0',
  nextResetRate: '0',
  penaltyRate: '0',
  premiumDiscountAtIED: '0',
  priceAtPurchaseDate: '0',
  nextPrincipalRedemptionPayment: '0',
  coverageOfCreditEnhancement: '0',
  lifeCap: '0',
  lifeFloor: '0',
  periodCap: '0',
  periodFloor: '0',

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,
};

export const EMPTY_EXTENDED_TEMPLATE_TERMS: ExtendedTemplateTerms = {
  contractType: '0',
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  scalingEffect: '0',
  penaltyType: '0',
  feeBasis: '0',
  creditEventTypeCovered: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  marketObjectCodeRateReset: ZERO_BYTES32,

  contractDealDateOffset: '0',
  statusDateOffset: '0',
  initialExchangeDateOffset: '0',
  maturityDateOffset: '0',
  purchaseDateOffset: '0',
  capitalizationEndDateOffset: '0',
  cycleAnchorDateOfInterestPaymentOffset: '0',
  cycleAnchorDateOfRateResetOffset: '0',
  cycleAnchorDateOfScalingIndexOffset: '0',
  cycleAnchorDateOfFeeOffset: '0',
  cycleAnchorDateOfPrincipalRedemptionOffset: '0',

  notionalPrincipal: '0',
  nominalInterestRate: '0',
  feeAccrued: '0',
  accruedInterest: '0',
  rateMultiplier: '0',
  rateSpread: '0',
  feeRate: '0',
  nextResetRate: '0',
  penaltyRate: '0',
  premiumDiscountAtIED: '0',
  priceAtPurchaseDate: '0',
  nextPrincipalRedemptionPayment: '0',
  coverageOfCreditEnhancement: '0',
  lifeCap: '0',
  lifeFloor: '0',
  periodCap: '0',
  periodFloor: '0',

  cycleOfInterestPayment: EMPTY_IPS,
  cycleOfRateReset: EMPTY_IPS,
  cycleOfScalingIndex: EMPTY_IPS,
  cycleOfFee: EMPTY_IPS,
  cycleOfPrincipalRedemption: EMPTY_IPS,

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,
};

export const EMPTY_CUSTOM_TERMS = {
  anchorDate: '0',
  overwrittenAttributesMap: ZERO_BYTES32,
  overwrittenTerms: EMPTY_LIFECYCLE_TERMS
};

export const EMPTY_OWNERSHIP = {
  creatorObligor: ZERO_ADDRESS,
  creatorBeneficiary: ZERO_ADDRESS,
  counterpartyObligor: ZERO_ADDRESS,
  counterpartyBeneficiary: ZERO_ADDRESS
};

export const EMPTY_ENHANCEMENT_PARAMS = {
  termsHash: ZERO_BYTES32,
  templateId: ZERO_BYTES32,
  customTerms: EMPTY_CUSTOM_TERMS,
  ownership: EMPTY_OWNERSHIP,
  engine: ZERO_ADDRESS,
  admin: ZERO_ADDRESS,
  creatorSignature: ZERO_BYTES,
  counterpartySignature: ZERO_BYTES,
  salt: Math.floor(Math.random() * 1000000)
};
