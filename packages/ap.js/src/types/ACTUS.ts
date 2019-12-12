
export const NON_CYLIC_SCHEDULE_ID = '256';
export const IP_SCHEDULE_ID = '8';
export const PR_SCHEDULE_ID = '15';
export const SC_SCHEDULE_ID = '19';
export const RR_SCHEDULE_ID = '18';
export const PY_SCHEDULE_ID = '11';

// IPS
// export enum P { D, W, M, Q, H, Y } // P=[D=Days, W=Weeks, M=Months, Q=Quarters, H=Halfyear, Y=Year]
// export enum S { LONG, SHORT } // S=[+=long stub,- short stub, {} if S empty then - for short stub]
export interface IPS { 
  i: number; // I=Integer
  p: string | number; 
  s: string | number;
  isSet: boolean;
}
// IP
export interface IP { 
  i: number; // I=Integer
  p: string | number;
  isSet: boolean;
}

export interface ContractReference {
  object: string | number[];
  contractReferenceType: number | string;
  contractReferenceRole: number | string;
}

// export enum BusinessDayConvention { NULL, SCF, SCMF, CSF, CSMF, SCP, SCMP, CSP, CSMP }
// export enum Calendar { NULL, NOCALENDAR, MondayToFriday }
// // @ts-ignore:6196
// export enum ClearingHouse { YES, NO }
// export enum ContractRole { RPA, RPL, LG, ST, RFL, BUYER, PFL, SELLER, GUARANTOR, OBLIGEE }
// export enum ContractPerformance { PF, DL, DQ, DF }
// export enum ContractType { PAM, ANN, NAM, LAM, LAX, CLM, UMP, CSH, STK, COM, SWAPS, SWPPV, FXOUT, CAPFL, FUTUR, OPTNS, CEG, CEC }
// // @ts-ignore:6196
// export enum CyclePointOfInterestPayment { EndOf, BeginningOf }
// // @ts-ignore:6196
// export enum CyclePointOfRateReset { BeginningOf, EndOf }
// // @ts-ignore:6196
// export enum CycleTriggerOfOptionality { IP, PR, RR }
// export enum DayCountConvention { 'A/AISDA', 'A/360', 'A/365', '30E/360ISDA', '30E/360', '30/360', 'BUS/252' }
// export enum EndOfMonthConvention { SD, EOM }
// // @ts-ignore:6196
// export enum EventLevel { P }
// export enum EventType { AD, CD, DV, XD, FP, IED, IPCB, IPCI, IP, MR, MD, PY, PD, PRF, PP, PR, PRD, RRF, RR, SC, STD, TD }
// export enum FeeBasis { A, N }
// // @ts-ignore:6196
// export enum InterestCalculationBase { NT, NTIED, NTL}
// // @ts-ignore:6196
// export enum MarketObjectCodeOfRateReset { USD_SWP, USD_GOV, CHF_SWP }
// // @ts-ignore:6196
// export enum ObjectCodeOfPrepaymentModel { IDXY }
// // @ts-ignore:6196
// export enum OptionExecutionType { E, B, A }
// // @ts-ignore:6196
// export enum OptionStrikeDriver { FX, IR, PR}
// // @ts-ignore:6196
// export enum OptionType { C, P, CP }
// export enum PenaltyType { O, A, N, I }
// // @ts-ignore:6196
// export enum PrepaymentEffect { N, A, M }
// export enum ScalingEffect { '000', '0N0', '00M', '0NM', 'I00', 'IN0', 'I0M', 'INM' }
// // @ts-ignore:6196
// export enum Seniority { S, J }
// // @ts-ignore:6196
// export enum Unit { BRL, BSH, GLN, CUU, MWH, PND, STN, TON, TRO }
// export enum ContractReferenceRole { CT, CID, MOC, LEI, CS }
// export enum ContractReferenceType { UDY, FL, SL, CVE, CVI }

// export interface ContractState {
//   contractPerformance: ContractPerformance;
//   statusDate: number | string;
//   nonPerformingDate: number | string;
//   maturityDate: number | string;
//   executionDate: number | string;
//   notionalPrincipal: number | string;
//   accruedInterest: number | string;
//   feeAccrued: number | string;
//   nominalInterestRate: number | string;
//   interestScalingMultiplier: number | string;
//   notionalScalingMultiplier: number | string;
//   nextPrincipalRedemptionPayment: number | string;
//   executionAmount: number | string;
// }

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
  counterpartyID: string | number[]
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

  nominalInterestRate: number | string;

  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  cycleOfPrincipalRedemption: IPS;

  gracePeriod: IP;
  delinquencyPeriod: IP;
}

export interface ProductTerms {
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
