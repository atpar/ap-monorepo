import { ContractState, ContractTerms } from './ACTUS';

export enum ChannelState {
  Initializable,
  Idle,
  Updatable,
  Confirmable,
  Receivable
}

export interface AssetOwnership {
  recordCreatorObligorAddress: string,
  recordCreatorBeneficiaryAddress: string,
  counterpartyObligorAddress: string,
  counterpartyBeneficiaryAddress: string
}

export interface ContractUpdate {
  assetId: string,
  recordCreatorObligorAddress: string,
  counterpartyObligorAddress: string,
  contractAddress: string,
  contractTerms: ContractTerms,
  contractState: ContractState,
  contractUpdateNonce: number
}

export interface SignedContractUpdate {
  contractUpdate: ContractUpdate,
  recordCreatorObligorSignature: string,
  counterpartyObligorSignature: string
}

export interface TypedData {
  domain: {
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string
  },
  types: object,
  primaryType: string,
  message: object
}

export interface ContractUpdateAsTypedData extends TypedData {
  domain: {
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string
  },
  types: {
    EIP712Domain: { name: string, type: string }[],
    ContractUpdate: { name: string, type: string }[]
  },
  primaryType: string,
  message: {
    assetId: string,
    recordCreatorObligorAddress: string,
    counterpartyObligorAddress: string,
    contractAddress: string,
    contractTermsHash: string,
    contractStateHash: string,
    contractUpdateNonce: number
  }
}

export interface OrderParams {
  makerAddress: string,
  terms: ContractTerms,
  makerCreditEnhancementAddress: string,
}

export interface OrderData extends OrderParams {
  takerAddress: string | null,
  takerCreditEnhancementAddress: string | null
  actorAddress: string,
  salt: number,
  signatures: {
    makerSignature: string | null,
    takerSignature: string | null
  }
}

export interface UnfilledOrderDataAsTypedData extends TypedData {
  domain: {
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string
  },
  types: {
    EIP712Domain: { name: string, type: string }[],
    Order: { name: string, type: string }[]
  },
  primaryType: string,
  message: {
    maker: string,
    actor: string,
    contractTermsHash: string,
    makerCreditEnhancement: string,
    salt: number
  }
}

export interface FilledOrderDataAsTypedData extends TypedData {
  domain: {
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string
  },
  types: {
    EIP712Domain: { name: string, type: string }[],
    Order: { name: string, type: string }[]
  },
  primaryType: string,
  message: {
    maker: string,
    taker: string,
    actor: string,
    contractTermsHash: string,
    makerCreditEnhancement: string,
    takerCreditEnhancement: string,
    salt: number
  }
}

export interface AssetIssuedEvent {
  assetId: string,
  recordCreatorAddress: string,
  counterpartyAddress: string
}
