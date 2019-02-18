import web3Utils from 'web3-utils';


export class Utils {
  public static toHex (mixed: any) : string {
    return web3Utils.toHex(mixed);
  }

  public static hexToUtf8 (hex: string) : string {
    return web3Utils.hexToUtf8(hex);
  }
}