import {
  IP,
  IPS,
  ContractReference,
  State,
  ANNTerms,
  CECTerms,
  CEGTerms,
  CERTFTerms,
  PAMTerms,
  STKTerms
} from '../types';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export const EMPTY_IP: IP = { i: '0', p: '0', isSet: false };
export const EMPTY_IPS: IPS = { i: '0', p: '0', s: '0', isSet: false };

export const EMPTY_CONTRACT_REFERENCE: ContractReference = {
  object: ZERO_BYTES32,
  object2: ZERO_BYTES32,
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
  lastCouponFixingDate: '0',
  lastDividendFixingDate: '0',
  notionalPrincipal: '0',
  accruedInterest: '0',
  feeAccrued: '0',
  nominalInterestRate: '0',
  interestScalingMultiplier: '0',
  notionalScalingMultiplier: '0',
  nextPrincipalRedemptionPayment: '0',
  exerciseAmount: '0',
  exerciseQuantity: '0',
  quantity: '0',
  couponAmountFixed: '0',
  marginFactor: '0',
  adjustmentFactor: '0',
  dividendPaymentAmount: '0',
  splitRatio: '0'
};

export const EMPTY_ANN_TERMS: ANNTerms = {
  contractType: '0',
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  scalingEffect: '0',
  feeBasis: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  marketObjectCodeRateReset: ZERO_BYTES32,

  contractDealDate: '0',
  statusDate: '0',
  initialExchangeDate: '0',
  maturityDate: '0',
  issueDate: '0',
  purchaseDate: '0',
  capitalizationEndDate: '0',
  cycleAnchorDateOfInterestPayment: '0',
  cycleAnchorDateOfRateReset: '0',
  cycleAnchorDateOfScalingIndex: '0',
  cycleAnchorDateOfFee: '0',
  cycleAnchorDateOfPrincipalRedemption: '0',

  notionalPrincipal: '0',
  nominalInterestRate: '0',
  accruedInterest: '0',
  rateMultiplier: '0',
  rateSpread: '0',
  nextResetRate: '0',
  feeRate: '0',
  feeAccrued: '0',
  premiumDiscountAtIED: '0',
  priceAtPurchaseDate: '0',
  priceAtTerminationDate: '0',
  nextPrincipalRedemptionPayment: '0',

  lifeCap: '0',
  lifeFloor: '0',
  periodCap: '0',
  periodFloor: '0',

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,

  cycleOfInterestPayment: EMPTY_IPS,
  cycleOfRateReset: EMPTY_IPS,
  cycleOfScalingIndex: EMPTY_IPS,
  cycleOfFee: EMPTY_IPS,
  cycleOfPrincipalRedemption: EMPTY_IPS,
};

export const EMPTY_CEC_TERMS: CECTerms = {
  contractType: '0',
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  feeBasis: '0',
  creditEventTypeCovered: '0',

  statusDate: '0',
  maturityDate: '0',

  notionalPrincipal: '0',
  feeRate: '0',
  coverageOfCreditEnhancement: '0',

  contractReference_1: EMPTY_CONTRACT_REFERENCE,
  contractReference_2: EMPTY_CONTRACT_REFERENCE
};

export const EMPTY_CEG_TERMS: CEGTerms = {
  contractType: '0',
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  feeBasis: '0',
  creditEventTypeCovered: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  contractDealDate: '0',
  statusDate: '0',
  maturityDate: '0',
  purchaseDate: '0',
  cycleAnchorDateOfFee: '0',

  notionalPrincipal: '0',
  feeAccrued: '0',
  feeRate: '0',
  priceAtPurchaseDate: '0',
  priceAtTerminationDate: '0',
  coverageOfCreditEnhancement: '0',

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,

  cycleOfFee: EMPTY_IPS,

  contractReference_1: EMPTY_CONTRACT_REFERENCE,
  contractReference_2: EMPTY_CONTRACT_REFERENCE
};

export const EMPTY_CERTF_TERMS: CERTFTerms = {
  contractType: '0',
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  couponType: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  contractDealDate: '0',
  statusDate: '0',
  initialExchangeDate: '0',
  maturityDate: '0',
  issueDate: '0',
  cycleAnchorDateOfRedemption: '0',
  cycleAnchorDateOfTermination: '0',
  cycleAnchorDateOfCoupon: '0',

  nominalPrice: '0',
  issuePrice: '0',
  quantity: '0',
  denominationRatio: '0',
  couponRate: '0',

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,
  settlementPeriod: EMPTY_IP,
  fixingPeriod: EMPTY_IP,
  redemptionExercisePeriod: EMPTY_IP,

  cycleOfRedemption: EMPTY_IPS,
  cycleOfTermination: EMPTY_IPS,
  cycleOfCoupon: EMPTY_IPS,

  contractReference_1: EMPTY_CONTRACT_REFERENCE,
  contractReference_2: EMPTY_CONTRACT_REFERENCE
}

export const EMPTY_PAM_TERMS: PAMTerms = {
  contractType: '0',
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  scalingEffect: '0',
  feeBasis: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  marketObjectCodeRateReset: ZERO_BYTES32,

  contractDealDate: '0',
  statusDate: '0',
  initialExchangeDate: '0',
  maturityDate: '0',
  issueDate: '0',
  purchaseDate: '0',
  capitalizationEndDate: '0',
  cycleAnchorDateOfInterestPayment: '0',
  cycleAnchorDateOfRateReset: '0',
  cycleAnchorDateOfScalingIndex: '0',
  cycleAnchorDateOfFee: '0',

  notionalPrincipal: '0',
  nominalInterestRate: '0',
  accruedInterest: '0',
  rateMultiplier: '0',
  rateSpread: '0',
  nextResetRate: '0',
  feeRate: '0',
  feeAccrued: '0',
  premiumDiscountAtIED: '0',
  priceAtPurchaseDate: '0',
  priceAtTerminationDate: '0',

  lifeCap: '0',
  lifeFloor: '0',
  periodCap: '0',
  periodFloor: '0',

  gracePeriod: EMPTY_IP,
  delinquencyPeriod: EMPTY_IP,

  cycleOfInterestPayment: EMPTY_IPS,
  cycleOfRateReset: EMPTY_IPS,
  cycleOfScalingIndex: EMPTY_IPS,
  cycleOfFee: EMPTY_IPS,
};

export const EMPTY_STK_TERMS: STKTerms = {
  contractType: '0',
  calendar: '0',
  contractRole: '0',
  dayCountConvention: '0',
  businessDayConvention: '0',
  endOfMonthConvention: '0',
  redeemableByIssuer: '0',

  currency: ZERO_ADDRESS,
  settlementCurrency: ZERO_ADDRESS,

  contractDealDate: '0',
  statusDate: '0',
  issueDate: '0',
  purchaseDate: '0',
  cycleAnchorDateOfDividend: '0',

  nominalPrice: '0',
  notionalPrincipal: '0',
  issuePrice: '0',
  quantity: '0',
  priceAtPurchaseDate: '0',
  priceAtTerminationDate: '0',
  redemptionPrice: '0',

  dividendRecordPeriod: EMPTY_IP,
  dividendPaymentPeriod: EMPTY_IP,
  splitSettlementPeriod: EMPTY_IP,
  redemptionRecordPeriod: EMPTY_IP,
  redemptionPaymentPeriod: EMPTY_IP,

  cycleOfDividend: EMPTY_IPS
};

export const EMPTY_OWNERSHIP = {
  creatorObligor: ZERO_ADDRESS,
  creatorBeneficiary: ZERO_ADDRESS,
  counterpartyObligor: ZERO_ADDRESS,
  counterpartyBeneficiary: ZERO_ADDRESS
};
