import { BigNumber } from 'bignumber.js';

import { numberToHex, toChecksumAddress, hexToNumber, toHex } from '../utils/Utils';
import { 
  ContractTerms,
  ContractState, 
  ContractEvent, 
  ProtoEvent, 
  ProtoEventSchedule, 
  AssetIssuedEvent, 
  AssetProgressedEvent, 
  PaidEvent,
  AssetOwnership
} from '../types';


export function toAssetOwnership (raw: any): AssetOwnership {
  return {
    recordCreatorObligor: String(raw['recordCreatorObligor']),
    recordCreatorBeneficiary: String(raw['recordCreatorBeneficiary']),
    counterpartyObligor: String(raw['counterpartyObligor']),
    counterpartyBeneficiary: String(raw['counterpartyBeneficiary'])
  }
}

export function toContractTerms (raw: any): ContractTerms {
  return {
    contractType: Number(raw['contractType']),
    calendar: Number(raw['calendar']),
    contractRole: Number(raw['contractRole']),
    legalEntityIdRecordCreator: String(raw['legalEntityIdRecordCreator']),
    legalEntityIdCounterparty: String(raw['legalEntityIdCounterparty']),
    dayCountConvention: Number(raw['dayCountConvention']),
    businessDayConvention: Number(raw['businessDayConvention']),
    endOfMonthConvention: Number(raw['endOfMonthConvention']),
    currency: String(raw['currency']),
    scalingEffect: Number(raw['scalingEffect']),
    penaltyType: Number(raw['penaltyType']),
    feeBasis: Number(raw['feeBasis']),
    contractDealDate: Number(raw['contractDealDate']),
    statusDate: Number(raw['statusDate']),
    initialExchangeDate: Number(raw['initialExchangeDate']),
    maturityDate: Number(raw['maturityDate']),
    terminationDate: Number(raw['terminationDate']),
    purchaseDate: Number(raw['purchaseDate']),
    capitalizationEndDate: Number(raw['capitalizationEndDate']),
    cycleAnchorDateOfInterestPayment: Number(raw['cycleAnchorDateOfInterestPayment']),
    cycleAnchorDateOfRateReset: Number(raw['cycleAnchorDateOfRateReset']),
    cycleAnchorDateOfScalingIndex: Number(raw['cycleAnchorDateOfScalingIndex']),
    cycleAnchorDateOfFee: Number(raw['cycleAnchorDateOfFee']),
    notionalPrincipal: String(raw['notionalPrincipal']),
    nominalInterestRate: String(raw['nominalInterestRate']),
    feeAccrued: String(raw['feeAccrued']),
    accruedInterest: String(raw['accruedInterest']),
    rateMultiplier: String(raw['rateMultiplier']),
    rateSpread: String(raw['rateSpread']),
    feeRate: String(raw['feeRate']),
    nextResetRate: String(raw['nextResetRate']),
    penaltyRate: String(raw['penaltyRate']),
    premiumDiscountAtIED: String(raw['premiumDiscountAtIED']),
    priceAtPurchaseDate: String(raw['priceAtPurchaseDate']),
    cycleOfInterestPayment: raw['cycleOfInterestPayment'],
    cycleOfRateReset: raw['cycleOfRateReset'],
    cycleOfScalingIndex: raw['cycleOfScalingIndex'],
    cycleOfFee: raw['cycleOfFee'],
    lifeCap: String(raw['lifeCap']),
    lifeFloor: String(raw['lifeFloor']),
    periodCap: String(raw['periodCap']),
    periodFloor: String(raw['periodFloor'])
  }
}

export function fromContractTerms (terms: ContractTerms): object {
  return {
    contractType: terms.contractType,
    calendar: terms.calendar,
    contractRole: terms.contractRole,
    legalEntityIdRecordCreator: toHex(terms.legalEntityIdRecordCreator),
    legalEntityIdCounterparty: toHex(terms.legalEntityIdCounterparty),
    dayCountConvention: terms.dayCountConvention,
    businessDayConvention: terms.businessDayConvention,
    endOfMonthConvention: terms.endOfMonthConvention,
    currency: terms.currency,
    scalingEffect: terms.scalingEffect,
    penaltyType: terms.penaltyType,
    feeBasis: terms.feeBasis,
    contractDealDate: terms.contractDealDate,
    statusDate: terms.statusDate,
    initialExchangeDate: terms.initialExchangeDate,
    maturityDate: terms.maturityDate,
    terminationDate: terms.terminationDate,
    purchaseDate: terms.purchaseDate,
    capitalizationEndDate: terms.capitalizationEndDate,
    cycleAnchorDateOfInterestPayment: terms.cycleAnchorDateOfInterestPayment,
    cycleAnchorDateOfRateReset: terms.cycleAnchorDateOfRateReset,
    cycleAnchorDateOfScalingIndex: terms.cycleAnchorDateOfScalingIndex,
    cycleAnchorDateOfFee: terms.cycleAnchorDateOfFee,
    notionalPrincipal: terms.notionalPrincipal,
    nominalInterestRate: terms.nominalInterestRate, // BigNumber: see https://github.com/ethereum/web3.js/issues/2077 
    feeAccrued: terms.feeAccrued,
    accruedInterest: terms.accruedInterest,
    rateMultiplier: terms.rateMultiplier,
    rateSpread: terms.rateSpread,
    feeRate: terms.feeRate,
    nextResetRate: terms.nextResetRate,
    penaltyRate: terms.penaltyRate,
    premiumDiscountAtIED: terms.premiumDiscountAtIED,
    priceAtPurchaseDate: terms.priceAtPurchaseDate,
    cycleOfInterestPayment: terms.cycleOfInterestPayment,
    cycleOfRateReset: terms.cycleOfRateReset,
    cycleOfScalingIndex: terms.cycleOfScalingIndex,
    cycleOfFee: terms.cycleOfFee,
    lifeCap: terms.lifeCap,
    lifeFloor: terms.lifeFloor,
    periodCap: terms.periodCap,
    periodFloor: terms.periodFloor
  }
}

export function toContractState (raw: any): ContractState {
  return {
    lastEventTime: Number(raw['lastEventTime']),
    contractStatus: Number(raw['contractStatus']),
    timeFromLastEvent: new BigNumber(raw['timeFromLastEvent']),
    nominalValue: new BigNumber(raw['nominalValue']),
    nominalAccrued: new BigNumber(raw['nominalAccrued']),
    feeAccrued: new BigNumber(raw['feeAccrued']),
    nominalRate: new BigNumber(raw['nominalRate']),
    interestScalingMultiplier: new BigNumber(raw['interestScalingMultiplier']),
    nominalScalingMultiplier: new BigNumber(raw['nominalScalingMultiplier']),
    contractRoleSign: Number(raw['contractRoleSign'])
  };
}

export function fromContractState (state: ContractState): object {
  return {
    lastEventTime: state.lastEventTime,
    contractStatus: state.contractStatus,
    timeFromLastEvent: numberToHex(state.timeFromLastEvent),
    nominalValue: numberToHex(state.nominalValue),
    nominalAccrued: numberToHex(state.nominalAccrued),
    feeAccrued: numberToHex(state.feeAccrued),
    nominalRate: numberToHex(state.nominalRate),
    interestScalingMultiplier: numberToHex(state.interestScalingMultiplier),
    nominalScalingMultiplier: numberToHex(state.nominalScalingMultiplier),
    contractRoleSign: state.contractRoleSign
  };
}

export function toContractEvent (raw: any): ContractEvent {
  return {
    eventTime: Number(raw['eventTime']),
    eventType: Number(raw['eventType']),
    currency: String(raw['currency']),
    payoff: new BigNumber(raw['payoff']),
    actualEventTime: Number(raw['actualEventTime'])
  };
}

export function fromContractEvent (event: ContractEvent): object {
  return {
    eventTime: event.eventTime,
    eventType: event.eventType,
    currency: event.currency,
    payoff: numberToHex(event.payoff),
    actualEventTime: event.actualEventTime
  };
}

export function toProtoEvent (raw: any): ProtoEvent {
  return {
    eventTime: Number(raw['eventTime']),
    eventTimeWithEpochOffset: Number(raw['eventTimeWithEpochOffset']),
    scheduleTime: Number(raw['scheduleTime']),
    eventType: Number(raw['eventType']),
    currency: String(raw['currency']),
    pofType: Number(raw['pofType']),
    stfType: Number(raw['stfType'])
  };
}

export function fromProtoEvent (protoEvent: ProtoEvent): object {
  return {
    eventTime: protoEvent.eventTime,
    eventTimeWithEpochOffset: protoEvent.eventTimeWithEpochOffset,
    scheduleTime: protoEvent.scheduleTime,
    eventType: protoEvent.eventType,
    currency: protoEvent.currency,
    pofType: protoEvent.pofType,
    stfType: protoEvent.stfType
  }
}

export function toProtoEventSchedule (raw: any): ProtoEventSchedule {
  const protoEventSchedule: ProtoEventSchedule = [];
  
  for (const element of raw) {
    if (Number(element['eventTime']) === 0) { break; }
    protoEventSchedule.push(toProtoEvent(element));
  }

  return protoEventSchedule;
}

export function toAssetIssuedEvent (raw: any): AssetIssuedEvent {
  return {
    assetId: raw['raw']['topics'][1] as string, // see web3 event decoding issue
    recordCreatorAddress: toChecksumAddress(String('0x' + raw['raw']['topics'][2].substring(26))),
    counterpartyAddress: toChecksumAddress(String('0x' + raw['raw']['topics'][3].substring(26)))
  };
}

export function toAssetProgressedEvent (raw: any): AssetProgressedEvent {
  return {
    assetId: raw['raw']['topics'][1] as string, // see web3 event decoding issue
    eventId: hexToNumber(String(raw['returnValues']['eventId']))
  };
}

export function toPaidEvent (raw: any): PaidEvent {
  return {
    assetId: raw['raw']['topics'][1] as string, // see web3 event decoding issue
    eventId: hexToNumber(String(raw['returnValues']['eventId'])),
    amount: new BigNumber(String(raw['returnValues']['amount']))
  };
}
