import Web3Utils from 'web3-utils';

import {
  UEngine,
  UTerms,
  CYCLIC_EVENTS
} from '../types';


export function getEpochOffsetForEventType (eventType: string): number {
  return Number(eventType);
}

export async function computeScheduleFromTerms(
  engine: UEngine,
  terms: UTerms,
  from?: number | string,
  to?: number | string
): Promise<string[]> {
  // @ts-ignore
  const { maturityDate } = terms;
  const schedule = [];

  // @ts-ignore
  schedule.push(...(await engine.methods.computeNonCyclicScheduleSegment(terms, from || 0, to || maturityDate).call()));

  if (to || maturityDate) {
    for (const cyclicEvent of CYCLIC_EVENTS) {
      // @ts-ignore
      schedule.push(...(await engine.methods.computeCyclicScheduleSegment(terms, from || 0, to || maturityDate, cyclicEvent).call()));
    }
  } 

  return sortEvents(removeNullEvents(schedule));
}

export function sortEvents (_events: string[]): string[] {
  _events.sort((_eventA, _eventB): number => {
    const { eventType: eventTypeA, scheduleTime: scheduleTimeA } = decodeEvent(_eventA);
    const { eventType: eventTypeB, scheduleTime: scheduleTimeB } = decodeEvent(_eventB);

    if (Number(scheduleTimeA) === 0) { return 1; }
    if (Number(scheduleTimeB) === 0) { return -1; }
    if (Number(scheduleTimeA) > Number(scheduleTimeB)) { return 1; }
    if (Number(scheduleTimeA) < Number(scheduleTimeB)) { return -1; }
    
    if (getEpochOffsetForEventType(eventTypeA) > getEpochOffsetForEventType(eventTypeB)) { 
      return 1; 
    }
    if (getEpochOffsetForEventType(eventTypeA) < getEpochOffsetForEventType(eventTypeB)) {
      return -1;
    }

    return 0;
  });

  return _events;
}

export function removeNullEvents (eventSchedule: string[]): string[] {
  const compactEventSchedule = [];

  for (let event of eventSchedule) {
    if (String(decodeEvent(event).eventType) === '0') {
      continue; 
    }
    compactEventSchedule.push(event);
  }

  return compactEventSchedule;
}

export const decodeEvent = (encodedEvent: string): { eventType: string; scheduleTime: string } => ({
  eventType: String(Web3Utils.hexToNumber('0x' + String(encodedEvent).substr(2, 2))),
  scheduleTime: String(Web3Utils.hexToNumber('0x' + String(encodedEvent).substr(10, encodedEvent.length)))
});

export function encodeEvent (eventType: string | number, scheduleTime: string | number): string {
  const eventTypeAsHex = Web3Utils.padLeft(Web3Utils.toHex(eventType), 2);
  const scheduleTimeAsHex = Web3Utils.padLeft(Web3Utils.toHex(scheduleTime), 62);

  return eventTypeAsHex + scheduleTimeAsHex.substr(2, scheduleTimeAsHex.length);
}

export function parseEventSchedule (encodedEventSchedule: string[]): { eventType: string; scheduleTime: string }[] {
  return removeNullEvents(encodedEventSchedule).map(
    (encodedEvent): { eventType: string; scheduleTime: string } => decodeEvent(encodedEvent)
  );
}
