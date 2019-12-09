import * as web3Utils from 'web3-utils';
import BN from 'bn.js';

export function toHex (mixed: any): any {
  // return web3Utils.toHex(mixed); // workaround for web3 issue
  if (String(mixed).startsWith('0x')) { return mixed; }
  return web3Utils.asciiToHex(mixed);
}

// export function numberToHex(number: number | string): string {
//   return web3Utils.toHex(String(number));
// }

// export function hexToNumber(hex: string): number {
//   return web3Utils.hexToNumber(hex);
// }

export function hexToUtf8 (hex: string): any {
  // return web3Utils.hexToUtf8(hex); // workaround for web3 issue
  return web3Utils.hexToAscii(hex);
}

export function toChecksumAddress (address: string): string {
  return web3Utils.toChecksumAddress(address);
}

// export function sha3 (...mixed: web3Utils.Mixed[]): string {
//   return web3Utils.soliditySha3(...mixed);
// }

export function toPrecision (number: number | string | BN) {
  return web3Utils.toWei((typeof number === 'string') ? number : number.toString());
}

export function fromPrecision (number: number | string | BN) {
  return web3Utils.fromWei((typeof number === 'string') ? number : number.toString());
}

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
export const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
