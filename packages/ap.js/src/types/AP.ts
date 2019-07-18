import { ContractTerms } from './ACTUS';
import BigNumber from 'bignumber.js';

export enum ChannelState {
  Initializable,
  Idle,
  Updatable,
  Confirmable,
  Receivable
}

export interface AssetOwnership {
  recordCreatorObligor: string;
  recordCreatorBeneficiary: string;
  counterpartyObligor: string;
  counterpartyBeneficiary: string;
}

export interface TypedData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: object;
  primaryType: string;
  message: object;
}

export interface OrderParams {
  makerAddress: string;
  terms: ContractTerms;
  makerCreditEnhancementAddress: string;
}

export interface OrderData extends OrderParams {
  takerAddress: string | null;
  takerCreditEnhancementAddress: string | null;
  actorAddress: string;
  salt: number;
  signatures: {
    makerSignature: string | null;
    takerSignature: string | null;
  };
}

export interface UnfilledOrderDataAsTypedData extends TypedData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    EIP712Domain: { name: string; type: string }[];
    Order: { name: string; type: string }[];
  };
  primaryType: string;
  message: {
    maker: string;
    actor: string;
    contractTermsHash: string;
    makerCreditEnhancement: string;
    salt: number;
  };
}

export interface FilledOrderDataAsTypedData extends TypedData {
  domain: {
    name: string;
    version: string;
    chainId: number;
    verifyingContract: string;
  };
  types: {
    EIP712Domain: { name: string; type: string }[];
    Order: { name: string; type: string }[];
  };
  primaryType: string;
  message: {
    maker: string;
    taker: string;
    actor: string;
    contractTermsHash: string;
    makerCreditEnhancement: string;
    takerCreditEnhancement: string;
    salt: number;
  };
}

export interface AssetIssuedEvent {
  assetId: string;
  recordCreatorAddress: string;
  counterpartyAddress: string;
}

export interface AssetProgressedEvent {
  assetId: string;
  eventId: number;
}

export interface PaidEvent {
  assetId: string;
  eventId: number;
  amount: BigNumber;
}

export function isOrderData (obj: any): obj is OrderData {
  if (obj.makerAddress === null) { return false; }
  if (obj.terms === null) { return false; }
  if (obj.makerCreditEnhancementAddress === null) { return false; }

  if (obj.takerAddress === undefined) { return false; }
  if (obj.takerCreditEnhancementAddress === undefined) { return false; }

  if (obj.actorAddress === null) { return false; }
  if (obj.salt === null) { return false; }

  if (
    obj.signatures === null || 
    obj.signatures.makerSignature === undefined || 
    obj.signatures.takerSignature === undefined
  ) { return false; }

  return true;
}
