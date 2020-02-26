import { LifecycleTerms } from '../types'; 

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export const EMPTY_IP = {
  i: '0',
  p: '0',
  isSet: false
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

  contractReference_1: { object: ZERO_BYTES32, contractReferenceType: '0', contractReferenceRole: '0' },
  contractReference_2: { object: ZERO_BYTES32, contractReferenceType: '0', contractReferenceRole: '0' }
};

export const EMPTY_OWNERSHIP = {
  creatorObligor: ZERO_ADDRESS,
  creatorBeneficiary: ZERO_ADDRESS,
  counterpartyObligor: ZERO_ADDRESS,
  counterpartyBeneficiary: ZERO_ADDRESS
}


export const EMPTY_CUSTOM_TERMS = {
  anchorDate: '0',
  overwrittenAttributesMap: ZERO_BYTES32,
  overwrittenTerms: EMPTY_LIFECYCLE_TERMS
};

export const EMPTY_ENHANCEMENT_PARAMS = {
  termsHash: ZERO_BYTES32,
  templateId: ZERO_BYTES32,
  customTerms: EMPTY_CUSTOM_TERMS,
  ownership: EMPTY_OWNERSHIP,
  engine: ZERO_ADDRESS,
  creatorSignature: ZERO_BYTES,
  counterpartySignature: ZERO_BYTES,
  salt: Math.floor(Math.random() * 1000000)
};
