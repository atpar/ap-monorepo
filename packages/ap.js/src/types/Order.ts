import { CustomTerms, isCustomTerms } from './ACTUS';
import { AssetOwnership, isAssetOwnership } from './AP';


export interface OrderParams {
  termsHash: string;
  templateId: string;
  customTerms: CustomTerms;
  ownership: AssetOwnership;
  expirationDate: string;
  engine: string;
  admin: string;
  enhancement_1?: {
    termsHash: string;
    templateId: string;
    customTerms: CustomTerms;
    ownership: AssetOwnership;
    engine: string;
    admin: string;
  } | null;
  enhancement_2?: {
    termsHash: string;
    templateId: string;
    customTerms: CustomTerms;
    ownership: AssetOwnership;
    engine: string;
    admin: string;
  } | null;
}

export interface OrderData {
  termsHash: string;
  templateId: string;
  customTerms: CustomTerms;
  ownership: AssetOwnership;
  expirationDate: string;
  engine: string;
  admin: string;
  enhancementOrder_1: EnhancementOrderData;
  enhancementOrder_2: EnhancementOrderData;
  creatorSignature: string;
  counterpartySignature: string;
  salt: number;
}

export interface EnhancementOrderData {
  termsHash: string;
  templateId: string;
  customTerms: CustomTerms;
  ownership: AssetOwnership;
  engine: string;
  admin: string;
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
    templateId: string;
    customTermsHash: string;
    expirationDate: string;
    ownershipHash: string;
    engine: string;
    admin: string;
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
    templateId: string;
    customTermsHash: string;
    ownershipHash: string;
    engine: string;
    admin: string;
    salt: number;
  };
}


export function isOrderParams (obj: any): obj is OrderParams {
  if (!obj) { return false; }
  if (obj.termsHash == undefined || typeof obj.termsHash !== 'string') { return false; }
  if (obj.templateId == undefined || typeof obj.templateId !== 'string') { return false; }
  if (!isCustomTerms(obj.customTerms)) { return false; }
  if (!isAssetOwnership(obj.ownership) == undefined) { return false; }
  if (obj.expirationDate == undefined || typeof obj.expirationDate !== 'number' && typeof obj.expirationDate !== 'string') { return false; }
  if (obj.engine == undefined || typeof obj.engine !== 'string') { return false; }
  if (obj.admin == undefined || typeof obj.admin!== 'string') { return false; }

  if (obj.enhancement_1) {
    if (obj.enhancement_1.termsHash == undefined || typeof obj.enhancement_1.termsHash !== 'string') { return false; }
    if (obj.enhancement_1.templateId == undefined || typeof obj.enhancement_1.templateId !== 'string') { return false; }
    if (!isCustomTerms(obj.enhancement_1.customTerms)) { return false; }
    if (!isAssetOwnership(obj.enhancement_1.ownership) == undefined) { return false; }
    if (obj.enhancement_1.engine == undefined || typeof obj.enhancement_1.engine !== 'string') { return false; }
    if (obj.enhancement_1.admin == undefined || typeof obj.enhancement_1.admin !== 'string') { return false; }
  }

  if (obj.enhancement_2) {
    if (obj.enhancement_2.termsHash == undefined || typeof obj.enhancement_2.termsHash !== 'string') { return false; }
    if (obj.enhancement_2.templateId == undefined || typeof obj.enhancement_2.templateId !== 'string') { return false; }
    if (!isCustomTerms(obj.enhancement_2.customTerms)) { return false; }
    if (!isAssetOwnership(obj.enhancement_2.ownership) == undefined) { return false; }
    if (obj.enhancement_2.engine == undefined || typeof obj.enhancement_2.engine !== 'string') { return false; }
    if (obj.enhancement_2.admin == undefined || typeof obj.enhancement_2.admin !== 'string') { return false; }
  }

  return true;
}

export function isOrderData (obj: any): obj is OrderData {
  if (!obj) { return false; }
  if (obj.termsHash == undefined || typeof obj.termsHash !== 'string') { return false; }
  if (obj.templateId == undefined || typeof obj.templateId !== 'string') { return false; }
  if (!isCustomTerms(obj.customTerms)) { return false; }
  if (!isAssetOwnership(obj.ownership)) { return false; }
  if (obj.expirationDate == undefined || typeof obj.expirationDate !== 'number' && typeof obj.expirationDate !== 'string') { return false; }
  if (obj.engine == undefined || typeof obj.engine !== 'string') { return false; }
  if (obj.admin == undefined || typeof obj.admin !== 'string') { return false; }
  if (!isEnhancementOrderData(obj.enhancementOrder_1) || !isEnhancementOrderData(obj.enhancementOrder_2)) { return false; }
  if (obj.creatorSignature == undefined || typeof obj.creatorSignature !== 'string') { return false; }
  if (obj.counterpartySignature == undefined || typeof obj.counterpartySignature !== 'string') { return false; }
  if (obj.salt == undefined || typeof obj.salt !== 'number' && typeof obj.salt !== 'string') { return false; }

  return true;
}

// @todo add type checks
export function isEnhancementOrderData (obj: any): obj is EnhancementOrderData {
  if (!obj) { return false; }
  if (obj.termsHash == undefined || typeof obj.termsHash !== 'string') { return false; }
  if (obj.templateId == undefined || typeof obj.templateId !== 'string') { return false; }
  if (!isCustomTerms(obj.customTerms)) { return false; }
  if (!isAssetOwnership(obj.ownership)) { return false; }
  if (obj.engine == undefined || typeof obj.engine !== 'string') { return false; }
  if (obj.admin == undefined || typeof obj.admin!== 'string') { return false; }
  if (obj.creatorSignature == undefined || typeof obj.creatorSignature !== 'string') { return false; }
  if (obj.counterpartySignature == undefined || typeof obj.counterpartySignature !== 'string') { return false; }
  if (obj.salt == undefined || typeof obj.salt !== 'number' && typeof obj.salt !== 'string') { return false; }

  return true;
}
