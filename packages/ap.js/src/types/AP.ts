import { ZERO_ADDRESS } from "../utils/Constants";

export interface AddressBook {
  ANNActor: string;
  // ANNEncoder: string;
  ANNEngine: string;
  ANNRegistry: string;
  CECActor: string;
  // CECEncoder: string;
  CECEngine: string;
  CECRegistry: string;
  CEGActor: string;
  // CEGEncoder: string;
  CEGEngine: string;
  CEGRegistry: string;
  Custodian: string;
  FDTFactory: string;
  MarketObjectRegistry: string;
  PAMActor: string;
  // PAMEncoder: string;
  PAMEngine: string;
  PAMRegistry: string;
  // ScheduleEncoder: string;
  SignedMath: string;
  // StateEncoder: string;
}

export interface AssetOwnership {
  creatorObligor: string;
  creatorBeneficiary: string;
  counterpartyObligor: string;
  counterpartyBeneficiary: string;
}

export function isAddressBook (obj: any): obj is AddressBook {
  if (!obj) { return false; }
  if (obj.ANNActor == undefined || typeof obj.ANNActor !== 'string' || obj.ANNActor === ZERO_ADDRESS) { return false; }
  // if (obj.ANNEncoder == undefined || typeof obj.ANNEncoder !== 'string' || obj.ANNEncoder === ZERO_ADDRESS) { return false; }
  if (obj.ANNEngine == undefined || typeof obj.ANNEngine !== 'string' || obj.ANNEngine === ZERO_ADDRESS) { return false; }
  if (obj.ANNRegistry == undefined || typeof obj.ANNRegistry !== 'string' || obj.ANNRegistry === ZERO_ADDRESS) { return false; }
  if (obj.CECActor == undefined || typeof obj.CECActor !== 'string' || obj.CECActor === ZERO_ADDRESS) { return false; }
  // if (obj.CECEncoder == undefined || typeof obj.CECEncoder !== 'string' || obj.CECEncoder === ZERO_ADDRESS) { return false; }
  if (obj.CECEngine == undefined || typeof obj.CECEngine !== 'string' || obj.CECEngine === ZERO_ADDRESS) { return false; }
  if (obj.CECRegistry == undefined || typeof obj.CECRegistry !== 'string' || obj.CECRegistry === ZERO_ADDRESS) { return false; }
  if (obj.CEGActor == undefined || typeof obj.CEGActor !== 'string' || obj.CEGActor === ZERO_ADDRESS) { return false; }
  // if (obj.CEGEncoder == undefined || typeof obj.CEGEncoder !== 'string' || obj.CEGEncoder === ZERO_ADDRESS) { return false; }
  if (obj.CEGEngine == undefined || typeof obj.CEGEngine !== 'string' || obj.CEGEngine === ZERO_ADDRESS) { return false; }
  if (obj.CEGRegistry == undefined || typeof obj.CEGRegistry !== 'string' || obj.CEGRegistry === ZERO_ADDRESS) { return false; }
  if (obj.Custodian == undefined || typeof obj.Custodian !== 'string' || obj.Custodian === ZERO_ADDRESS) { return false; }
  if (obj.FDTFactory == undefined || typeof obj.FDTFactory !== 'string' || obj.FDTFactory === ZERO_ADDRESS) { return false; }
  if (obj.MarketObjectRegistry == undefined || typeof obj.MarketObjectRegistry !== 'string' || obj.MarketObjectRegistry === ZERO_ADDRESS) { return false; }
  if (obj.PAMActor == undefined || typeof obj.PAMActor !== 'string' || obj.PAMActor === ZERO_ADDRESS) { return false; }
  // if (obj.PAMEncoder == undefined || typeof obj.PAMEncoder !== 'string' || obj.PAMEncoder === ZERO_ADDRESS) { return false; }
  if (obj.PAMEngine == undefined || typeof obj.PAMEngine !== 'string' || obj.PAMEngine === ZERO_ADDRESS) { return false; }
  if (obj.PAMRegistry == undefined || typeof obj.PAMRegistry !== 'string' || obj.PAMRegistry === ZERO_ADDRESS) { return false; }
  // if (obj.ScheduleEncoder == undefined || typeof obj.ScheduleEncoder !== 'string' || obj.ScheduleEncoder === ZERO_ADDRESS) { return false; }
  if (obj.SignedMath == undefined || typeof obj.SignedMath !== 'string' || obj.SignedMath === ZERO_ADDRESS) { return false; }
  // if (obj.StateEncoder == undefined || typeof obj.StateEncoder !== 'string' || obj.StateEncoder === ZERO_ADDRESS) { return false; }

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
