import { CustomTerms } from './ACTUS';
import { AssetOwnership } from './AP';


export interface OrderParams {
  termsHash: string;
  productId: string;
  customTerms: CustomTerms;
  ownership: AssetOwnership;
  expirationDate: string;
  enhancement_1?: {
    termsHash: string;
    productId: string;
    customTerms: CustomTerms;
    ownership: AssetOwnership;
    engine: string;
  } | null;
  engine: string;
  enhancement_2?: {
    termsHash: string;
    productId: string;
    customTerms: CustomTerms;
    ownership: AssetOwnership;
    engine: string;
  } | null;
}

export interface OrderData {
  termsHash: string;
  productId: string;
  customTerms: CustomTerms;
  ownership: AssetOwnership;
  expirationDate: string;
  engine: string;
  actor: string;
  enhancementOrder_1: EnhancementOrderData;
  enhancementOrder_2: EnhancementOrderData;
  creatorSignature: string;
  counterpartySignature: string;
  salt: number;
}

export interface EnhancementOrderData {
  termsHash: string;
  productId: string;
  customTerms: CustomTerms;
  ownership: AssetOwnership;
  engine: string;
  creatorSignature: string;
  counterpartySignature: string;
  salt: number;
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

export interface OrderDataAsTypedData extends TypedData {
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
    termsHash: string;
    productId: string;
    customTermsHash: string;
    expirationDate: string;
    ownershipHash: string;
    engine: string;
    actor: string;
    enhancementOrderHash_1: string;
    enhancementOrderHash_2: string;
    salt: number;
  };
}

export interface EnhancementOrderDataAsTypedData extends TypedData {
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
    termsHash: string;
    productId: string;
    customTermsHash: string;
    ownershipHash: string;
    engine: string;
    salt: number;
  };
}

// @todo add type checks
export function isOrderData (obj: any): obj is OrderData {
  if (!obj) { return false; }
  if (obj.ownership === null) { return false; }
  if (obj.ownership.creatorObligor === null || obj.ownership.creatorBeneficiary === null) { return false; }
  if (obj.ownership.counterpartyObligor === null || obj.ownership.counterpartyBeneficiary === null) { return false; }
  if (obj.customTerms === null) { return false; }
  if (!isEnhancementOrderData(obj.enhancementOrder_1) || !isEnhancementOrderData(obj.enhancementOrder_2)) { return false; }
  if (obj.engine === null) { return false; }
  if (obj.actor === null) { return false; }
  if (obj.salt === null) { return false; }
  if (obj.creatorSignature === null || obj.counterpartySignature === null) { return false; }

  return true;
}

// @todo add type checks
export function isEnhancementOrderData (obj: any): obj is EnhancementOrderData {
  if (!obj) { return false; }
  if (obj.ownership === null) { return false; }
  if (obj.ownership.creatorObligor === null || obj.ownership.creatorBeneficiary === null) { return false; }
  if (obj.ownership.counterpartyObligor === null|| obj.ownership.counterpartyBeneficiary === null) { return false; }
  if (obj.customTerms === null) { return false; }
  if (obj.engine === null) { return false; }
  if (obj.salt === null) { return false; }
  if (obj.creatorSignature === null || obj.counterpartySignature === null) { return false; }

  return true;
}
