import Web3Utils from 'web3-utils';

import {
  FP_SCHEDULE_ID,
  PR_SCHEDULE_ID,
  PY_SCHEDULE_ID,
  IP_SCHEDULE_ID,
  IPCI_SCHEDULE_ID,
  RR_SCHEDULE_ID,
  SC_SCHEDULE_ID
} from '../types';


export function getEpochOffsetForEventType (eventType: string): number {
  if (eventType === '1') { return 20; } // IED
  if (eventType === '3') { return 25; } // PR
  if (eventType === '8') { return 30; } // IP
  if (eventType === '9') { return 40; } // IPCI
  if (eventType === '2') { return 50; } // FP
  if (eventType === '13') { return 60; } // DV
  if (eventType === '15') { return 80; } // MR
  if (eventType === '11') { return 90; } // RRF
  if (eventType === '12') { return 100; } // RR
  if (eventType === '17') { return 110; } // SC
  if (eventType === '18') { return 120; } // IPCB
  if (eventType === '14') { return 130; } // PRD
  if (eventType === '16') { return 140; } // TD
  if (eventType === '21') { return 150; } // STD
  if (eventType === '19') { return 160; } // MD
  if (eventType === '0') { return 950; } // AD
  return 0;
}

export async function computeScheduleFromTerms<E, T>(
  engine: E,
  terms: T
): Promise<string[]> {
  // @ts-ignore
  const { maturityDate } = terms;
  const schedule = [];

  // @ts-ignore
  schedule.push(...(await engine.methods.computeNonCyclicScheduleSegment(terms, 0, maturityDate).call()));
  // @ts-ignore
  schedule.push(...(await engine.methods.computeCyclicScheduleSegment(terms, 0, maturityDate, FP_SCHEDULE_ID).call()));
  // @ts-ignore
  schedule.push(...(await engine.methods.computeCyclicScheduleSegment(terms, 0, maturityDate, PR_SCHEDULE_ID).call()));
  // @ts-ignore
  schedule.push(...(await engine.methods.computeCyclicScheduleSegment(terms, 0, maturityDate, PY_SCHEDULE_ID).call()));
  // @ts-ignore
  schedule.push(...(await engine.methods.computeCyclicScheduleSegment(terms, 0, maturityDate, IP_SCHEDULE_ID).call()));
  // @ts-ignore
  schedule.push(...(await engine.methods.computeCyclicScheduleSegment(terms, 0, maturityDate, IPCI_SCHEDULE_ID).call()));
  // @ts-ignore
  schedule.push(...(await engine.methods.computeCyclicScheduleSegment(terms, 0, maturityDate, RR_SCHEDULE_ID).call()));
  // @ts-ignore
  schedule.push(...(await engine.methods.computeCyclicScheduleSegment(terms, 0, maturityDate, SC_SCHEDULE_ID).call()));

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
