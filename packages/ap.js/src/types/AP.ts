import { ZERO_ADDRESS } from "../utils/Constants";

export interface AddressBook {
  ANNEngine: string;
  AssetActor: string;
  AssetIssuer: string;
  AssetRegistry: string;
  CEGEngine: string;
  CECEngine: string;
  Custodian: string;
  MarketObjectRegistry: string;
  PAMEngine: string;
  TemplateRegistry: string;
  SignedMath: string;
  TokenizationFactory: string;
}

export interface AssetOwnership {
  creatorObligor: string;
  creatorBeneficiary: string;
  counterpartyObligor: string;
  counterpartyBeneficiary: string;
}

export function isAddressBook (obj: any): obj is AddressBook {
  if (!obj) { return false; }
  if (obj.ANNEngine == undefined || typeof obj.ANNEngine !== 'string' || obj.ANNEngine === ZERO_ADDRESS) { return false; }
  if (obj.AssetActor == undefined || typeof obj.AssetActor !== 'string' || obj.AssetActor === ZERO_ADDRESS) { return false; }
  if (obj.AssetIssuer == undefined || typeof obj.AssetIssuer !== 'string' || obj.AssetIssuer === ZERO_ADDRESS) { return false; }
  if (obj.AssetRegistry == undefined || typeof obj.AssetRegistry !== 'string' || obj.AssetRegistry === ZERO_ADDRESS) { return false; }
  if (obj.CEGEngine == undefined || typeof obj.CEGEngine !== 'string' || obj.CEGEngine === ZERO_ADDRESS) { return false; }
  if (obj.CECEngine == undefined || typeof obj.CECEngine !== 'string' || obj.CECEngine === ZERO_ADDRESS) { return false; }
  if (obj.Custodian == undefined || typeof obj.Custodian !== 'string' || obj.Custodian === ZERO_ADDRESS) { return false; }
  if (obj.MarketObjectRegistry == undefined || typeof obj.MarketObjectRegistry !== 'string' || obj.MarketObjectRegistry === ZERO_ADDRESS) { return false; }
  if (obj.PAMEngine == undefined || typeof obj.PAMEngine !== 'string' || obj.PAMEngine === ZERO_ADDRESS) { return false; }
  if (obj.TemplateRegistry == undefined || typeof obj.TemplateRegistry !== 'string' || obj.TemplateRegistry === ZERO_ADDRESS) { return false; }
  if (obj.SignedMath == undefined || typeof obj.SignedMath !== 'string' || obj.SignedMath === ZERO_ADDRESS) { return false; }
  if (obj.TokenizationFactory == undefined || typeof obj.TokenizationFactory !== 'string' || obj.TokenizationFactory === ZERO_ADDRESS) { return false; }

  return true;
}

export function isAssetOwnership (obj: any): obj is AssetOwnership {
  if (!obj) { return false; }
  if (obj.creatorObligor == undefined || typeof obj.creatorObligor !== 'string') { return false; }
  if (obj.creatorBeneficiary == undefined || typeof obj.creatorBeneficiary !== 'string') { return false; }
  if (obj.counterpartyObligor == undefined || typeof obj.counterpartyObligor !== 'string') { return false; }
  if (obj.counterpartyBeneficiary == undefined || typeof obj.counterpartyBeneficiary !== 'string') { return false; }

  return true;
}
