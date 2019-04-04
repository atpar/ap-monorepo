import * as web3Utils from 'web3-utils';
import { BigNumber } from 'bignumber.js';

export function toHex (mixed: any): any {
  // return web3Utils.toHex(mixed);
  if (String(mixed).startsWith('0x')) { return mixed; }
  return web3Utils.asciiToHex(mixed);
}

export function numberToHex(bigNumber: BigNumber): string {
  return web3Utils.toHex(bigNumber.toFixed());
}

export function hexToUtf8 (hex: string): any {
  // return web3Utils.hexToUtf8(hex);
  return web3Utils.hexToAscii(hex);
}

export function toChecksumAddress (address: string): string {
  return web3Utils.toChecksumAddress(address);
}

export function getUnixTimestamp (): number {
  return Math.floor(Date.now() / 1000);
}