import * as web3Utils from 'web3-utils';
import { BigNumber } from 'bignumber.js';
import { EventType, ContractEvent } from '../types';

export function toHex (mixed: any): any {
  // return web3Utils.toHex(mixed); // workaround for web3 issue
  if (String(mixed).startsWith('0x')) { return mixed; }
  return web3Utils.asciiToHex(mixed);
}

export function numberToHex(bigNumber: BigNumber): string {
  return web3Utils.toHex(bigNumber.toFixed());
}

export function hexToNumber(hex: string): number {
  return web3Utils.hexToNumber(hex);
}

export function hexToUtf8 (hex: string): any {
  // return web3Utils.hexToUtf8(hex); // workaround for web3 issue
  return web3Utils.hexToAscii(hex);
}

export function toChecksumAddress (address: string): string {
  return web3Utils.toChecksumAddress(address);
}

export function sha3 (...mixed: web3Utils.Mixed[]): string {
  return web3Utils.soliditySha3(...mixed);
}     

export function getUnixTimestamp (): number {
  return Math.floor(Date.now() / 1000);
}

export function computeEventId (contractEvent: ContractEvent): string {
  let eventTimeWithEpochOffset;

  switch (contractEvent.eventType) {
    case EventType.IED: eventTimeWithEpochOffset = contractEvent.eventTime + 20; break;
		case EventType.IED: eventTimeWithEpochOffset = contractEvent.eventTime + 20; break;
		case EventType.PR: eventTimeWithEpochOffset = contractEvent.eventTime + 25; break;
		case EventType.IP: eventTimeWithEpochOffset = contractEvent.eventTime + 30; break;
		case EventType.IPCI: eventTimeWithEpochOffset = contractEvent.eventTime + 40; break;
		case EventType.FP: eventTimeWithEpochOffset = contractEvent.eventTime + 50; break;
		case EventType.DV: eventTimeWithEpochOffset = contractEvent.eventTime + 60; break;
		case EventType.MR: eventTimeWithEpochOffset = contractEvent.eventTime + 80; break;
		case EventType.RRF: eventTimeWithEpochOffset = contractEvent.eventTime + 90; break;
		case EventType.RR: eventTimeWithEpochOffset = contractEvent.eventTime + 100; break;
		case EventType.SC: eventTimeWithEpochOffset = contractEvent.eventTime + 110; break;
		case EventType.IPCB: eventTimeWithEpochOffset = contractEvent.eventTime + 120; break;
		case EventType.PRD: eventTimeWithEpochOffset = contractEvent.eventTime + 130; break;
		case EventType.TD: eventTimeWithEpochOffset = contractEvent.eventTime + 140; break;
		case EventType.STD: eventTimeWithEpochOffset = contractEvent.eventTime + 150; break;
		case EventType.MD: eventTimeWithEpochOffset = contractEvent.eventTime + 160; break;
    case EventType.AD: eventTimeWithEpochOffset = contractEvent.eventTime + 950; break;
    default: eventTimeWithEpochOffset = contractEvent.eventTime;
  }
  
  return web3Utils.soliditySha3(contractEvent.eventType, eventTimeWithEpochOffset);
}
