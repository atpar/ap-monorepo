import Web3Utils from 'web3-utils';

import { Terms, ProductSchedule } from '../types';
import { toGeneratingTerms } from './Conversions';
import { Contract } from 'web3-eth-contract';


export function getEpochOffsetForEventType (eventType: number): number {
  if (eventType === 5) { return 20; } // IED
  if (eventType === 15) { return 25; } // PR
  if (eventType === 8) { return 30; } // IP
  if (eventType === 7) { return 40; } // IPCI
  if (eventType === 4) { return 50; } // FP
  if (eventType === 2) { return 60; } // DV
  if (eventType === 9) { return 80; } // MR
  if (eventType === 17) { return 90; } // RRF
  if (eventType === 18) { return 100; } // RR
  if (eventType === 19) { return 110; } // SC
  if (eventType === 6) { return 120; } // IPCB
  if (eventType === 16) { return 130; } // PRD
  if (eventType === 21) { return 140; } // TD
  if (eventType === 20) { return 150; } // STD
  if (eventType === 10) { return 160; } // MD
  if (eventType === 0) { return 950; } // AD
  return 0;
}

export async function generateProductSchedule (engineContract: Contract, terms: Terms): Promise<ProductSchedule> {
  if (
    !engineContract
    || !engineContract.methods
    || typeof engineContract.methods.computeNonCyclicScheduleSegment !== 'function' 
    || typeof engineContract.methods.computeCyclicScheduleSegment !== 'function' 
  ) { 
    throw new Error('EXECUTION_ERROR: Invalid engine provided.'); 
  }

  const generatingTerms = toGeneratingTerms(terms);

  return {
    nonCyclicSchedule: await engineContract.methods.computeNonCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate).call(),
    cyclicIPSchedule: await engineContract.methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 8).call(),
    cyclicPRSchedule: await engineContract.methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 15).call(),
    cyclicSCSchedule: await engineContract.methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 19).call(),
    cyclicRRSchedule: await engineContract.methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 18).call(),
    cyclicFPSchedule: await engineContract.methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 4).call(),
    cyclicPYSchedule: await engineContract.methods.computeCyclicScheduleSegment(generatingTerms, generatingTerms.contractDealDate, generatingTerms.maturityDate, 11).call(),
  };
}

export function applyAnchorDateToSchedule(schedule: string[], anchorDate: string | number): string[] {
  const shiftedSchedule = [];

  for (const event of schedule) {
    const { eventType, scheduleTime } = decodeEvent(event);
    shiftedSchedule.push(
      encodeEvent(
        eventType,
        (Number(scheduleTime) !== 0) ? Number(scheduleTime) + Number(anchorDate) : Number(scheduleTime)
      )
    );
  }

  return shiftedSchedule;
}

export function sortEvents (_events: string[]): string[] {
  _events.sort((_eventA, _eventB): number => {
    const { eventType: eventTypeA, scheduleTime: scheduleTimeA } = decodeEvent(_eventA);
    const { eventType: eventTypeB, scheduleTime: scheduleTimeB } = decodeEvent(_eventB);

    if (scheduleTimeA == 0) { return 1; }
    if (scheduleTimeB == 0) { return -1; }
    if (scheduleTimeA > scheduleTimeB) { return 1; }
    if (scheduleTimeA < scheduleTimeB) { return -1; }
    
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

export function removeNullEvents (_eventSchedule: string[]): string[] {
  const compactEventSchedule = [];

  for (let _event of _eventSchedule) {
    if (decodeEvent(_event).scheduleTime === 0) { continue; }
    compactEventSchedule.push(_event);
  }

  return compactEventSchedule;
}

export function decodeEvent (encodedEvent: string): { eventType: number; scheduleTime: number } {
  return {
    eventType: Web3Utils.hexToNumber('0x' + String(encodedEvent).substr(2, 2)),
    scheduleTime: Web3Utils.hexToNumber('0x' + String(encodedEvent).substr(10, encodedEvent.length))
  };
}

export function encodeEvent (eventType: string | number, scheduleTime: string | number): string {
  const eventTypeAsHex = Web3Utils.padLeft(Web3Utils.toHex(eventType), 2);
  const scheduleTimeAsHex = Web3Utils.padLeft(Web3Utils.toHex(scheduleTime), 62);

  return eventTypeAsHex + scheduleTimeAsHex.substr(2, scheduleTimeAsHex.length);
}

export function parseEventSchedule (encodedEventSchedule: string[]): { eventType: number; scheduleTime: number }[] {
  return removeNullEvents(
    encodedEventSchedule
  ).map((encodedEvent) => decodeEvent(encodedEvent));
}
