// type definitions
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

// @ts-ignore:6196
export enum ContractType { PAM, ANN, NAM, LAM, LAX, CLM, UMP, CSH, STK, COM, SWAPS, SWPPV, FXOUT, CAPFL, FUTUR, OPTNS, CEG, CEC } // required ?

export enum Calendar { NULL, NOCALENDAR, MondayToFriday }
export enum ContractRole { RPA, RPL, LG, ST, RFL, BUYER, PFL, SELLER, GUARANTOR, OBLIGEE }
export enum DayCountConvention { 'A/AISDA', 'A/360', 'A/365', '30E/360ISDA', '30E/360', '30/360', 'BUS/252' }
export enum BusinessDayConvention { NULL, SCF, SCMF, CSF, CSMF, SCP, SCMP, CSP, CSMP }
export enum Currency { USD, EUR, ETH, ERC20 }
export enum ScalingEffect { '000', '0N0', '00M', '0NM', 'I00', 'IN0', 'I0M', 'INM' }
export enum PenaltyType { O, A, N, I }
export enum FeeBasis { A, N }

// @ts-ignore:6196
export enum EventType { SD, MD, AD, IED, IP, PR, PP, PY, FP, PRD, TD, IPCI, RR, RRY, SC, CD, DV, MR, IPCB, STD, Child }
// @ts-ignore:6196
export enum ClearingHouse { YES, NO }
// @ts-ignore:6196
export enum ContractStatus {PF, DL, DQ, DF}
// @ts-ignore:6196
export enum CyclePointOfInterestPayment { EndOf, BeginningOf }
// @ts-ignore:6196
export enum CyclePointOfRateReset { BeginningOf, EndOf }
// @ts-ignore:6196
export enum CycleTriggerOfOptionality { IP, PR, RR }
// @ts-ignore:6196
export enum EndOfMonthConvention { SD, EOM }
// @ts-ignore:6196
export enum EventLevel { P }
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
// @ts-ignore:6196
export enum PrepaymentEffect { N, A, M }
// @ts-ignore:6196
export enum Seniority { S, J }
// @ts-ignore:6196
export enum Unit { BRL, BSH, GLN, CUU, MWH, PND, STN, TON, TRO }

export interface ContractEvent {
  eventType: EventType,
  scheduledTime: number,
  payOff: BigNumber,
  currency: Currency
}

export interface ContractState {
  lastEventTime: number,
  contractStatus: ContractStatus,
  timeFromLastEvent: number,
  nominalAccrued: BigNumber,
  nominalRate: BigNumber,
  interestScalingMultiplier: BigNumber,
  nominalScalingMultiplier: BigNumber,
  contractRoleSign: ContractRole
}

export interface ContractTerms {
  contractType: ContractType,
  calendar: Calendar,
  contractRole: ContractRole,
  legalEntityIdRecordCreator: String,
  legalEntityIdCounterparty: String,
  dayCountConvention: DayCountConvention,
  businessDayConvention: BusinessDayConvention,
  endOfMonthConvention: EndOfMonthConvention,
  currency: Currency,
  scalingEffect: ScalingEffect,
  penaltyType: PenaltyType,
  feeBasis: FeeBasis,
  statusDate: number,
  initialExchangeDate: number,
  maturityDate: number,
  terminationDate: number,
  purchaseDate: number,
  capitalizationEndDate: number,
  cycleAnchorDateOfInterestPayment: number,
  cycleAnchorDateOfRateReset: number,
  cycleAnchorDateOfScalingIndex: number,
  cycleAnchorDateOfFee: number,
  notionalPrincipal: string, // BigNumber: see https://github.com/ethereum/web3.js/issues/2077 
  nominalInterestRate: string,
  feeAccrued: string,
  accruedInterest: string,
  rateMultiplier: string,
  rateSpread: string,
  feeRate: string,
  nextResetRate: string,
  penaltyRate: string,
  premiumDiscountAtIED: string,
  priceAtPurchaseDate: string,
  cycleOfInterestPayment: IPS,
  cycleOfRateReset: IPS,
  cycleOfScalingIndex: IPS,
  cycleOfFee: IPS,
  lifeCap: string,
  lifePeriod: string,
  lifeFloor: string,
  periodCap: string,
  periodFloor: string
}
