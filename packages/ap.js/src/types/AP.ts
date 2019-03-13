import { ContractState, ContractTerms } from './ACTUS';

export enum ChannelState {
  Initializable,
  Idle,
  Updatable,
  Confirmable,
  Receivable
}

export interface ContractOwnership {
  recordCreatorObligorAddress: string,
  recordCreatorBeneficiaryAddress: string,
  counterpartyObligorAddress: string,
  counterpartyBeneficiaryAddress: string
}

export interface ContractUpdate {
  contractId: string,
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
    recordCreatorObligorAddress: string,
    counterpartyObligorAddress: string,
    contractAddress: string,
    contractTermsHash: string,
    contractStateHash: string,
    contractUpdateNonce: number
  }
}
