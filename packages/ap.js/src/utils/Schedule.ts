import Web3Utils from 'web3-utils';

import { IEngine } from '@atpar/ap-contracts/ts-bindings/IEngine';

import { denormalizeDate, deriveGeneratingTermsFromExtendedTemplateTerms } from './Conversion';
import { ExtendedTemplateTerms } from '../types';


export function getEpochOffsetForEventType (eventType: string): number {
  if (eventType === '5') { return 20; } // IED
  if (eventType === '15') { return 25; } // PR
  if (eventType === '8') { return 30; } // IP
  if (eventType === '7') { return 40; } // IPCI
  if (eventType === '4') { return 50; } // FP
  if (eventType === '2') { return 60; } // DV
  if (eventType === '9') { return 80; } // MR
  if (eventType === '17') { return 90; } // RRF
  if (eventType === '18') { return 100; } // RR
  if (eventType === '19') { return 110; } // SC
  if (eventType === '6') { return 120; } // IPCB
  if (eventType === '16') { return 130; } // PRD
  if (eventType === '21') { return 140; } // TD
  if (eventType === '20') { return 150; } // STD
  if (eventType === '10') { return 160; } // MD
  if (eventType === '0') { return 950; } // AD
  return 0;
}

export function deriveScheduleFromTemplateSchedule(anchorDate: string | number, templateSchedule: string[]): string[] {
  const schedule = [];

  for (const event of templateSchedule) {
    const { eventType, scheduleTime: scheduleTimeOffset } = decodeEvent(event);
    schedule.push(
      encodeEvent(eventType, denormalizeDate(anchorDate, scheduleTimeOffset))
    );
  }

  return schedule;
}

export async function computeTemplateScheduleFromExtendedTemplateTerms(
  engine: IEngine,
  extendedTemplateTerms: ExtendedTemplateTerms
): Promise<string[]> {
  const generatingTerms = deriveGeneratingTermsFromExtendedTemplateTerms(extendedTemplateTerms);
  const { maturityDate } = generatingTerms;
  const templateSchedule = [];

  templateSchedule.push(...(await engine.methods.computeNonCyclicScheduleSegment(generatingTerms, 0, maturityDate).call()));
  templateSchedule.push(...(await engine.methods.computeCyclicScheduleSegment(generatingTerms, 0, maturityDate, 8).call()));
  templateSchedule.push(...(await engine.methods.computeCyclicScheduleSegment(generatingTerms, 0, maturityDate, 15).call()));
  templateSchedule.push(...(await engine.methods.computeCyclicScheduleSegment(generatingTerms, 0, maturityDate, 19).call()));
  templateSchedule.push(...(await engine.methods.computeCyclicScheduleSegment(generatingTerms, 0, maturityDate, 18).call()));
  templateSchedule.push(...(await engine.methods.computeCyclicScheduleSegment(generatingTerms, 0, maturityDate, 4).call()));
  templateSchedule.push(...(await engine.methods.computeCyclicScheduleSegment(generatingTerms, 0, maturityDate, 11).call()));

  return sortEvents(removeNullEvents(templateSchedule));
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
