declare module "eth-sig-util" {
  import { Buffer } from "safe-buffer"
  
  export interface MsgParams { data: any; sig: any; }

  export function concatSig(v: number, r: Buffer, s: Buffer): Buffer
  export function recoverPersonalSignature(msgParams: MsgParams): string
  export function recoverTypedSignature(msgParams: MsgParams): string
  export function normalize(input: string | number): string
}