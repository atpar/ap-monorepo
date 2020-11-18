import { ZERO_ADDRESS } from '../utils/Constants';

export interface AddressBook {
  ANNActor: string;
  ANNEngine: string;
  ANNRegistry: string;
  CECActor: string;
  CECEngine: string;
  CECRegistry: string;
  CEGActor: string;
  CEGEngine: string;
  CEGRegistry: string;
  CERTFActor: string;
  CERTFEngine: string;
  CERTFRegistry: string;
  Custodian: string;
  DataRegistryProxy: string;
  DvPSettlement: string;
  PAMActor: string;
  PAMEngine: string;
  PAMRegistry: string;
  STKActor: string;
  STKEngine: string;
  STKRegistry: string;
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
  if (obj.ANNEngine == undefined || typeof obj.ANNEngine !== 'string' || obj.ANNEngine === ZERO_ADDRESS) { return false; }
  if (obj.ANNRegistry == undefined || typeof obj.ANNRegistry !== 'string' || obj.ANNRegistry === ZERO_ADDRESS) { return false; }
  if (obj.CECActor == undefined || typeof obj.CECActor !== 'string' || obj.CECActor === ZERO_ADDRESS) { return false; }
  if (obj.CECEngine == undefined || typeof obj.CECEngine !== 'string' || obj.CECEngine === ZERO_ADDRESS) { return false; }
  if (obj.CECRegistry == undefined || typeof obj.CECRegistry !== 'string' || obj.CECRegistry === ZERO_ADDRESS) { return false; }
  if (obj.CEGActor == undefined || typeof obj.CEGActor !== 'string' || obj.CEGActor === ZERO_ADDRESS) { return false; }
  if (obj.CEGEngine == undefined || typeof obj.CEGEngine !== 'string' || obj.CEGEngine === ZERO_ADDRESS) { return false; }
  if (obj.CEGRegistry == undefined || typeof obj.CEGRegistry !== 'string' || obj.CEGRegistry === ZERO_ADDRESS) { return false; }
  if (obj.CERTFActor == undefined || typeof obj.CERTFActor !== 'string' || obj.CERTFActor === ZERO_ADDRESS) { return false; }
  if (obj.CERTFEngine == undefined || typeof obj.CERTFEngine !== 'string' || obj.CERTFEngine === ZERO_ADDRESS) { return false; }
  if (obj.CERTFRegistry == undefined || typeof obj.CERTFRegistry !== 'string' || obj.CERTFRegistry === ZERO_ADDRESS) { return false; }
  if (obj.Custodian == undefined || typeof obj.Custodian !== 'string' || obj.Custodian === ZERO_ADDRESS) { return false; }
  if (obj.DataRegistryProxy == undefined || typeof obj.DataRegistryProxy !== 'string' || obj.DataRegistryProxy === ZERO_ADDRESS) { return false; }
  if (obj.DvPSettlement == undefined || typeof obj.DvPSettlement !== 'string' || obj.DvPSettlement === ZERO_ADDRESS) { return false; }
  if (obj.PAMActor == undefined || typeof obj.PAMActor !== 'string' || obj.PAMActor === ZERO_ADDRESS) { return false; }
  if (obj.PAMEngine == undefined || typeof obj.PAMEngine !== 'string' || obj.PAMEngine === ZERO_ADDRESS) { return false; }
  if (obj.PAMRegistry == undefined || typeof obj.PAMRegistry !== 'string' || obj.PAMRegistry === ZERO_ADDRESS) { return false; }
  if (obj.STKActor == undefined || typeof obj.STKActor !== 'string' || obj.STKActor === ZERO_ADDRESS) { return false; }
  if (obj.STKEngine == undefined || typeof obj.STKEngine !== 'string' || obj.STKEngine === ZERO_ADDRESS) { return false; }
  if (obj.STKRegistry == undefined || typeof obj.STKRegistry !== 'string' || obj.STKRegistry === ZERO_ADDRESS) { return false; }

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
