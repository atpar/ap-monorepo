import BigNumber from 'bignumber.js'; 

// IPS
export enum P { D, W, M, Q, H, Y } // P=[D=Days, W=Weeks, M=Months, Q=Quarters, H=Halfyear, Y=Year]
export enum S { LONG, SHORT } // S=[+=long stub,- short stub, {} if S empty then - for short stub]
export interface IPS { 
  i: number; // I=Integer
  p: P; 
  s: S;
  isSet: boolean;
}

export enum BusinessDayConvention { NULL, SCF, SCMF, CSF, CSMF, SCP, SCMP, CSP, CSMP }
export enum Calendar { NULL, NOCALENDAR, MondayToFriday }
// @ts-ignore:6196
export enum ClearingHouse { YES, NO }
export enum ContractRole { RPA, RPL, LG, ST, RFL, BUYER, PFL, SELLER, GUARANTOR, OBLIGEE }
export enum ContractStatus {PF, DL, DQ, DF}
export enum ContractType { PAM, ANN, NAM, LAM, LAX, CLM, UMP, CSH, STK, COM, SWAPS, SWPPV, FXOUT, CAPFL, FUTUR, OPTNS, CEG, CEC }
// @ts-ignore:6196
export enum CyclePointOfInterestPayment { EndOf, BeginningOf }
// @ts-ignore:6196
export enum CyclePointOfRateReset { BeginningOf, EndOf }
// @ts-ignore:6196
export enum CycleTriggerOfOptionality { IP, PR, RR }
export enum DayCountConvention { 'A/AISDA', 'A/360', 'A/365', '30E/360ISDA', '30E/360', '30/360', 'BUS/252' }
export enum EndOfMonthConvention { SD, EOM }
// @ts-ignore:6196
export enum EventLevel { P }
export enum EventType { SD, MD, AD, IED, IP, PR, PP, PY, FP, PRD, TD, IPCI, RR, RRY, SC, CD, DV, MR, IPCB, STD, Child }
export enum FeeBasis { A, N }
// @ts-ignore:6196
export enum InterestCalculationBase { NT, NTIED, NTL}
// @ts-ignore:6196
export enum MarketObjectCodeOfRateReset { USD_SWP, USD_GOV, CHF_SWP }
// @ts-ignore:6196
export enum ObjectCodeOfPrepaymentModel { IDXY }
// @ts-ignore:6196
export enum OptionExecutionType { E, B, A }
// @ts-ignore:6196
export enum OptionStrikeDriver { FX, IR, PR}
// @ts-ignore:6196
export enum OptionType { C, P, CP }
export enum PenaltyType { O, A, N, I }
// @ts-ignore:6196
export enum PrepaymentEffect { N, A, M }
export enum ScalingEffect { '000', '0N0', '00M', '0NM', 'I00', 'IN0', 'I0M', 'INM' }
// @ts-ignore:6196
export enum Seniority { S, J }
// @ts-ignore:6196
export enum Unit { BRL, BSH, GLN, CUU, MWH, PND, STN, TON, TRO }

export interface ContractEvent {
  scheduledTime: number;
  eventType: EventType;
  currency: string;
  payoff: BigNumber;
  actualEventTime: number;
}

export interface ProtoEvent { 
  scheduledTime: number;
  scheduledTimeWithEpochOffset: number;
  eventType: EventType;
  currency: string;
  pofType: EventType;
  stfType: EventType;
}

export interface ContractState {
  lastEventTime: number;
  contractStatus: ContractStatus;
  timeFromLastEvent: BigNumber;
  nominalValue: BigNumber;
  nominalAccrued: BigNumber;
  feeAccrued: BigNumber;
  nominalRate: BigNumber;
  interestScalingMultiplier: BigNumber;
  nominalScalingMultiplier: BigNumber;
  contractRoleSign: ContractRole;
}

export type ProtoEventSchedule = ProtoEvent[];
export type EvaluatedEventSchedule = { event: ContractEvent; state: ContractState }[];

export interface ContractTerms {
  contractType: ContractType;
  calendar: Calendar;
  contractRole: ContractRole;
  legalEntityIdRecordCreator: string;
  legalEntityIdCounterparty: string;
  dayCountConvention: DayCountConvention;
  businessDayConvention: BusinessDayConvention;
  endOfMonthConvention: EndOfMonthConvention;
  currency: string;
  scalingEffect: ScalingEffect;
  penaltyType: PenaltyType;
  feeBasis: FeeBasis;
  contractDealDate: number,
  statusDate: number;
  initialExchangeDate: number;
  maturityDate: number;
  terminationDate: number;
  purchaseDate: number;
  capitalizationEndDate: number;
  cycleAnchorDateOfInterestPayment: number;
  cycleAnchorDateOfRateReset: number;
  cycleAnchorDateOfScalingIndex: number;
  cycleAnchorDateOfFee: number;
  notionalPrincipal: string; // BigNumber: see https://github.com/ethereum/web3.js/issues/2077 
  nominalInterestRate: string;
  feeAccrued: string;
  accruedInterest: string;
  rateMultiplier: string;
  rateSpread: string;
  feeRate: string;
  nextResetRate: string;
  penaltyRate: string;
  premiumDiscountAtIED: string;
  priceAtPurchaseDate: string;
  cycleOfInterestPayment: IPS;
  cycleOfRateReset: IPS;
  cycleOfScalingIndex: IPS;
  cycleOfFee: IPS;
  lifeCap: string;
  lifeFloor: string;
  periodCap: string;
  periodFloor: string;
}

// export interface ContractTerms {
//   contractType: ContractType,
//   calendar: Calendar,
//   contractRole: ContractRole,
//   legalEntityIdRecordCreator: String,
//   legalEntityIdCounterparty: String,
//   dayCountConvention: DayCountConvention,
//   businessDayConvention: BusinessDayConvention,
//   endOfMonthConvention: EndOfMonthConvention,
//   currency: string,
//   scalingEffect: ScalingEffect,
//   penaltyType: PenaltyType,
//   feeBasis: FeeBasis,
//   contractDealDate: number,
//   statusDate: number,
//   initialExchangeDate: number,
//   maturityDate: number,
//   terminationDate: number,
//   purchaseDate: number,
//   capitalizationEndDate: number,
//   cycleAnchorDateOfInterestPayment: number,
//   cycleAnchorDateOfRateReset: number,
//   cycleAnchorDateOfScalingIndex: number,
//   cycleAnchorDateOfFee: number,
//   notionalPrincipal: string, // BigNumber: see https://github.com/ethereum/web3.js/issues/2077 
//   nominalInterestRate: string,
//   feeAccrued: string,
//   accruedInterest: string,
//   rateMultiplier: string,
//   rateSpread: string,
//   feeRate: string,
//   nextResetRate: string,
//   penaltyRate: string,
//   premiumDiscountAtIED: string,
//   priceAtPurchaseDate: string,
//   cycleOfInterestPayment: IPS,
//   cycleOfRateReset: IPS,
//   cycleOfScalingIndex: IPS,
//   cycleOfFee: IPS,
//   lifeCap: string,
//   lifeFloor: string,
//   periodCap: string,
//   periodFloor: string
// }
