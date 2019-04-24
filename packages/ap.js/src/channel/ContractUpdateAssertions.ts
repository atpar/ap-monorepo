import { SignedContractUpdate } from '../types';

export function areContractUpdateAddressesUnaltered (
  signedContractUpdate: SignedContractUpdate, 
  previousSignedContractUpdate: SignedContractUpdate
): boolean {
  return (
    !(
      previousSignedContractUpdate.contractUpdate.recordCreatorObligor === 
      signedContractUpdate.contractUpdate.recordCreatorObligor &&
      previousSignedContractUpdate.contractUpdate.counterpartyObligor === 
      signedContractUpdate.contractUpdate.counterpartyObligor
    )
  );
}

export function isNewSignedContractUpdate (
  signedContractUpdate: SignedContractUpdate, 
  previousSignedContractUpdate: SignedContractUpdate
): boolean {
  return (JSON.stringify(previousSignedContractUpdate) === JSON.stringify(signedContractUpdate));
}

export function areContractUpdateSignaturesUnaltered (
  signedContractUpdate: SignedContractUpdate, 
  previousSignedContractUpdate: SignedContractUpdate
): boolean {
  if (previousSignedContractUpdate.recordCreatorObligorSignature) {
    if (previousSignedContractUpdate.recordCreatorObligorSignature !== signedContractUpdate.recordCreatorObligorSignature) {
      return false;
    }
  } else if (previousSignedContractUpdate.counterpartyObligorSignature) {
    if (previousSignedContractUpdate.counterpartyObligorSignature !== signedContractUpdate.counterpartyObligorSignature) {
      return false;
    }
  } else { return false; }

  return true;
}

export function isContractUpdateNonceHigher (
  signedContractUpdate: SignedContractUpdate, 
  previousSignedContractUpdate: SignedContractUpdate
): boolean {
  return (
    previousSignedContractUpdate.contractUpdate.contractUpdateNonce >= 
    signedContractUpdate.contractUpdate.contractUpdateNonce
  );
}

export function isContractUpdateNonceUnaltered (
  signedContractUpdate: SignedContractUpdate, 
  previousSignedContractUpdate: SignedContractUpdate
): boolean {
  return (
    previousSignedContractUpdate.contractUpdate.contractUpdateNonce !== 
    signedContractUpdate.contractUpdate.contractUpdateNonce
  );
}

export function isInitialSignedContractUpdate (signedContractUpdate: SignedContractUpdate): boolean {
  return (signedContractUpdate.contractUpdate.contractUpdateNonce === 0);
}
