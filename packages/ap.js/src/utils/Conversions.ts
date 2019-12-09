import * as web3Utils from 'web3-utils';
import BN from 'bn.js';


export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

export const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

export function toHex (mixed: any): any {
  if (String(mixed).startsWith('0x')) { return mixed; }
  return web3Utils.toHex(mixed);
}

export function hexToUtf8 (hex: string): any {
  return web3Utils.hexToAscii(hex);
}

export function toChecksumAddress (address: string): string {
  return web3Utils.toChecksumAddress(address);
}

export function toPrecision (number: number | string | BN) {
  return web3Utils.toWei((typeof number === 'string') ? number : number.toString());
}

export function fromPrecision (number: number | string | BN) {
  return web3Utils.fromWei((typeof number === 'string') ? number : number.toString());
}

export function encodeAsBytes32 (externalData: number | string) {
  return web3Utils.padLeft(web3Utils.toHex(externalData), 64);
}

export function decodeBytes32AsNumber (bytes32Data: string): string {
  return web3Utils.hexToNumberString(bytes32Data);
}
