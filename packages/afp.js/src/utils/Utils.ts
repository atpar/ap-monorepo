import * as web3Utils from 'web3-utils';

export function toHex (mixed: any): string {
  return web3Utils.toHex(mixed);
}

export function hexToUtf8 (hex: string): string {
  return web3Utils.hexToUtf8(hex);
}

export function getUnixTimestamp (): number {
  return Math.floor(Date.now() / 1000);
}