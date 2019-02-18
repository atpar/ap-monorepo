import { ContractState, ContractTerms } from './Actus';

export enum ChannelState {
  Idle,
  Updatable,
  Confirmable,
  Receivable
}

export interface ContractUpdate {
  contractId: string,
  recordCreatorAddress: string,
  counterpartyAddress: string,
  contractAddress: string,
  contractTerms: ContractTerms,
  contractState: ContractState,
  contractUpdateNonce: number
}

export interface SignedContractUpdate {
  contractUpdate: ContractUpdate,
  recordCreatorSignature: string,
  counterpartySignature: string
}

export interface ContractUpdateAsTypedData {
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
    contractId: string,
    recordCreatorAddress: string,
    counterpartyAddress: string,
    contractAddress: string,
    contractTermsHash: string,
    contractStateHash: string,
    contractUpdateNonce: number
  }
}
