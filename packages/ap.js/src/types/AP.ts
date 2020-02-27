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

// @todo add type checks
export function isAddressBook (obj: any): obj is AddressBook {
  if (!obj) { return false; }
  if (!obj.ANNEngine || obj.ANNEngine === ZERO_ADDRESS) { return false; }
  if (!obj.AssetActor || obj.AssetActor === ZERO_ADDRESS) { return false; }
  if (!obj.AssetIssuer || obj.AssetIssuer === ZERO_ADDRESS) { return false; }
  if (!obj.AssetRegistry || obj.AssetRegistry === ZERO_ADDRESS) { return false; }
  if (!obj.CEGEngine || obj.CEGEngine === ZERO_ADDRESS) { return false; }
  if (!obj.CECEngine || obj.CECEngine === ZERO_ADDRESS) { return false; }
  if (!obj.Custodian || obj.Custodian === ZERO_ADDRESS) { return false; }
  if (!obj.MarketObjectRegistry || obj.MarketObjectRegistry === ZERO_ADDRESS) { return false; }
  if (!obj.PAMEngine || obj.PAMEngine === ZERO_ADDRESS) { return false; }
  if (!obj.TemplateRegistry || obj.TemplateRegistry === ZERO_ADDRESS) { return false; }
  if (!obj.SignedMath || obj.SignedMath === ZERO_ADDRESS) { return false; }
  if (!obj.TokenizationFactory || obj.TokenizationFactory === ZERO_ADDRESS) { return false; }

  return true;
}
