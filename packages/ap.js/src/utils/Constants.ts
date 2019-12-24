
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export const EMPTY_OWNERSHIP = {
  creatorObligor: ZERO_ADDRESS,
  creatorBeneficiary: ZERO_ADDRESS,
  counterpartyObligor: ZERO_ADDRESS,
  counterpartyBeneficiary: ZERO_ADDRESS
}

export const EMPTY_CUSTOM_TERMS = {
  anchorDate: '0',
  notionalPrincipal: '0',
  nominalInterestRate: '0',
  premiumDiscountAtIED: '0',
  rateSpread: '0',
  lifeCap: '0',
  lifeFloor: '0',
  coverageOfCreditEnhancement: '0',
  contractReference_1: { object: ZERO_BYTES32, contractReferenceType: '0', contractReferenceRole: '0' },
  contractReference_2: { object: ZERO_BYTES32, contractReferenceType: '0', contractReferenceRole: '0' }
}

export const EMPTY_ENHANCEMENT_PARAMS = {
  termsHash: ZERO_BYTES32,
  templateId: ZERO_BYTES32,
  customTerms: EMPTY_CUSTOM_TERMS,
  ownership: EMPTY_OWNERSHIP,
  engine: ZERO_ADDRESS,
  creatorSignature: ZERO_BYTES,
  counterpartySignature: ZERO_BYTES,
  salt: Math.floor(Math.random() * 1000000)
}
