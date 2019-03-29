import { BigNumber } from 'bignumber.js';

import { numberToHex } from '../utils/Utils';
import { ContractState, ContractEvent, ProtoEvent, ProtoEventSchedule } from '../types';


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
    scheduledTime: Number(raw['scheduledTime']),
    eventType: Number(raw['eventType']),
    currency: Number(raw['currency']),
    payoff: new BigNumber(raw['payoff']),
    actualEventTime: Number(raw['actualEventTime'])
  };
}

export function fromContractEvent (event: ContractEvent): object {
  return {
    scheduledTime: event.scheduledTime,
    eventType: event.eventType,
    currency: event.currency,
    payoff: numberToHex(event.payoff),
    actualEventTime: event.actualEventTime
  };
}

export function toProtoEvent (raw: any): ProtoEvent {
  return {
    scheduledTime: Number(raw['scheduledTime']), 
    eventType: Number(raw['eventType']),
    currency: Number(raw['currency']),
    pofType: Number(raw['pofType']),
    stfType: Number(raw['stfType'])
  };
}

export function fromProtoEvent (protoEvent: ProtoEvent): object {
  return {
    scheduledTime: protoEvent.scheduledTime,
    eventType: protoEvent.eventType,
    currency: protoEvent.currency,
    pofType: protoEvent.pofType,
    stfType: protoEvent.stfType
  }
}

export function toProtoEventSchedule (raw: any): ProtoEventSchedule {
  const protoEventSchedule: ProtoEventSchedule = [];
  
  for (const element of raw) {
    if (Number(element['scheduledTime']) === 0) { break; }
    protoEventSchedule.push(toProtoEvent(element));
  }

  return protoEventSchedule;
}