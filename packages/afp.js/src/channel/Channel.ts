import { AFP } from '../index'; 
import { ContractUpdate, ContractState, SignedContractUpdate, ChannelState } from "../types";
import { EconomicsKernel, OwnershipKernel } from "../kernels";


/**
 * stores all contract updates of the respective financial channel
 * processes contract updates
 */
export class Channel {

  private afp: AFP;
  private economicsKernel: EconomicsKernel;
  private ownershipKernel: OwnershipKernel;
  private signedContractUpdates: SignedContractUpdate[];

  private constructor (
    afp: AFP, 
    economicsKernel: EconomicsKernel,
    ownershipKernel: OwnershipKernel,
    signedContractUpdate?: SignedContractUpdate
  ) {
    this.afp = afp;
    this.economicsKernel = economicsKernel;
    this.ownershipKernel = ownershipKernel;
    this.signedContractUpdates = [];

    if (signedContractUpdate) { 
      this._storeSignedContractUpdate(signedContractUpdate); 
    }

    this.afp.client.registerContractListener(
      this.ownershipKernel.contractId,
      async (signedContractUpdate: SignedContractUpdate) => {
        if (!(await this._validateSignedContractUpdate(signedContractUpdate))) { return; } 
        this._storeSignedContractUpdate(signedContractUpdate);
      }
    );
  }

  // or getTurnTakerStatus, getObligation
  /**
   * returns the state of channel based on the current state of the contract and the provided timestamp
   * @param timestamp current timestamp
   * @returns ChannelState
   */
  public async getChannelState (timestamp: number) {
    const account = this.afp.signer.account;
    const signedContractUpdate = this.getLastSignedContractUpdate();

    if (signedContractUpdate.recordCreatorSignature && signedContractUpdate.counterpartySignature) {
      const pendingEventSchedule = await this.economicsKernel.computePendingSchedule(timestamp);
      const duePayOff = await this.economicsKernel.computeDuePayoff(timestamp);

      if (pendingEventSchedule.length === 0) { return ChannelState.Idle; }

      if (
        duePayOff.isLessThanOrEqualTo(0) &&
        account === signedContractUpdate.contractUpdate.recordCreatorAddress
      ) { return ChannelState.Updatable; }

      if (
        duePayOff.isGreaterThanOrEqualTo(0) &&
        account === signedContractUpdate.contractUpdate.counterpartyAddress
      ) { return ChannelState.Updatable; }
    }

    if (
      account === signedContractUpdate.contractUpdate.recordCreatorAddress &&
      !signedContractUpdate.recordCreatorSignature
    ) { return ChannelState.Confirmable; }

    if (
      account === signedContractUpdate.contractUpdate.counterpartyAddress &&
      !signedContractUpdate.counterpartySignature
    ) { return ChannelState.Confirmable; }

    return ChannelState.Receivable;
  }

  /**
   * creates a new contract update based on the next state 
   * for a given timestamp and sends it after receiving a signature
   * @notice calls eth_signedTypedData or eth_signedTypedData_v3, prompting the user to sign a contract update
   * @param timestamp current timestamp
   * @returns promise when signed contractupdate was sent
   */
  public async signAndSendNextContractUpdate (timestamp: number) {
    const previousSignedContractUpdate = this.getLastSignedContractUpdate();
    let contractUpdateNonce = 0;

    if (previousSignedContractUpdate) {
      contractUpdateNonce = previousSignedContractUpdate.contractUpdate.contractUpdateNonce;
      if (previousSignedContractUpdate.recordCreatorSignature && previousSignedContractUpdate.counterpartySignature) {
        contractUpdateNonce += 1;
      }
    }

    const nextContractState = await this.economicsKernel.computeNextState(timestamp);
    const contractUpdate = this._constructContractUpdate(nextContractState, contractUpdateNonce);
    // const contractUpdateHash = JSON.stringify(contractUpdate);

    await this.economicsKernel.computeAndCommitNextState(timestamp);

    const signedContractUpdate = await this._signContractUpdate(contractUpdate);

    this._storeSignedContractUpdate(signedContractUpdate);

    await this.afp.client.sendContractUpdate(signedContractUpdate);
  }

  /**
   * returns the current (last) signed contract update
   * @returns SignedContractUpdate
   */
  public getLastSignedContractUpdate () : SignedContractUpdate {
    return this.signedContractUpdates[this.signedContractUpdates.length - 1]; 
  }

  private _constructContractUpdate (
    nextContractState: ContractState,
    nextContractUpdateNonce: number
  ) : ContractUpdate {
    return {
      contractId: this.ownershipKernel.contractId,
      recordCreatorAddress: this.ownershipKernel.recordCreatorAddress,
      counterpartyAddress: this.ownershipKernel.counterpartyAddress,
      contractAddress: '',
      contractTerms: this.economicsKernel.contractTerms,
      contractState: nextContractState,
      contractUpdateNonce: nextContractUpdateNonce
    };
  }

  private async _signContractUpdate (contractUpdate: ContractUpdate) {
    const signedContractUpdate: SignedContractUpdate = { 
      contractUpdate: contractUpdate, 
      recordCreatorSignature: '', 
      counterpartySignature: '' 
    };
    const signature = await this.afp.signer.signContractUpdate(contractUpdate);
    const signer = this.afp.signer.account;

    if (signer === contractUpdate.recordCreatorAddress) {
      signedContractUpdate.recordCreatorSignature = signature;
    } else if (signer === contractUpdate.counterpartyAddress) {
      signedContractUpdate.counterpartySignature = signature;
    } else {
      throw(new Error(
        'Addresses do not match. Address of sender has to be equal to recordCreatorAddress or counterpartyAddress.'
      ));
    }

    return signedContractUpdate;
  }

  private async _storeSignedContractUpdate (signedContractUpdate: SignedContractUpdate) {
    this.signedContractUpdates.push(signedContractUpdate);
  }

  private async _validateSignedContractUpdate (signedContractUpdate: SignedContractUpdate) {
    if (!(await this.afp.signer.validateContractUpdateSignatures(signedContractUpdate))) { return false }

    const previousSignedContractUpdate = this.getLastSignedContractUpdate();

    if (!signedContractUpdate.recordCreatorSignature !== !signedContractUpdate.counterpartySignature) {
      if (!this._validateProposal(signedContractUpdate, previousSignedContractUpdate)) { return false; }
    } else if (signedContractUpdate.recordCreatorSignature && signedContractUpdate.counterpartySignature) {
      if (!this._validateAcknowledgement(signedContractUpdate, previousSignedContractUpdate)) { return false; }
    } else { 
      return false;
    }
  
    return true;
  }

  private async _validateProposal (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate?: SignedContractUpdate
  ) {
    if (this._isInitialSignedContractUpdate(signedContractUpdate)) {
      if (previousSignedContractUpdate) { 
        return false; 
      }
      if (!this.economicsKernel.validateInitialState(signedContractUpdate.contractUpdate.contractState)) { 
        return false; 
      }
    } else {
      if (!previousSignedContractUpdate) { 
        return false; 
      }
      if (!(this._isNewSignedContractUpdate(signedContractUpdate, previousSignedContractUpdate))) { 
        return false; 
      }
      if (!(this._areContractUpdateAddressesUnaltered(signedContractUpdate, previousSignedContractUpdate))) {
        return false;
      }
      if (!(this._isContractUpdateNonceHigher(signedContractUpdate, previousSignedContractUpdate))) {
        return false;
      }
      if (!this.economicsKernel.validateNextState(signedContractUpdate.contractUpdate.contractState)) { 
        return false;
      }
    }

    return true;
  }

  private async _validateAcknowledgement (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate?: SignedContractUpdate
  ) {
    if (!previousSignedContractUpdate) {
      return false;
    }
    if (!(this._isNewSignedContractUpdate(signedContractUpdate, previousSignedContractUpdate))) {
      return false;
    }
    if (!(this._areContractUpdateAddressesUnaltered(signedContractUpdate, previousSignedContractUpdate))) {
      return false;
    }
    if (!(this._areContractUpdateSignaturesUnaltered(signedContractUpdate, previousSignedContractUpdate))) { 
      return false;
    }
    if (!(this._isContractUpdateNonceUnaltered(signedContractUpdate, previousSignedContractUpdate))) {
      return false;
    }
    if (this._isInitialSignedContractUpdate(signedContractUpdate)) {
      if(!this.economicsKernel.validateInitialState(signedContractUpdate.contractUpdate.contractState)) { 
        return false; 
      }
    } else {
      if (!this.economicsKernel.validateNextState(signedContractUpdate.contractUpdate.contractState)) { 
        return false; 
      }
    }

    return true;
  }

  private _areContractUpdateAddressesUnaltered (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ) {
    return (
      !(
        previousSignedContractUpdate.contractUpdate.recordCreatorAddress === 
        signedContractUpdate.contractUpdate.recordCreatorAddress &&
        previousSignedContractUpdate.contractUpdate.counterpartyAddress === 
        signedContractUpdate.contractUpdate.counterpartyAddress
      )
    );
  }

  private _isNewSignedContractUpdate (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ) {
    return (JSON.stringify(previousSignedContractUpdate) === JSON.stringify(signedContractUpdate));
  }

  private _areContractUpdateSignaturesUnaltered (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ) {
    if (previousSignedContractUpdate.recordCreatorSignature) {
      if (previousSignedContractUpdate.recordCreatorSignature !== signedContractUpdate.recordCreatorSignature) {
        return false;
      }
    } else if (previousSignedContractUpdate.counterpartySignature) {
      if (previousSignedContractUpdate.counterpartySignature !== signedContractUpdate.counterpartySignature) {
        return false;
      }
    } else { return false; }

    return true;
  }

  private _isContractUpdateNonceHigher (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ) {
    return (
      previousSignedContractUpdate.contractUpdate.contractUpdateNonce >= 
      signedContractUpdate.contractUpdate.contractUpdateNonce
    );
  }

  private _isContractUpdateNonceUnaltered (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ) {
    return (
      previousSignedContractUpdate.contractUpdate.contractUpdateNonce !== 
      signedContractUpdate.contractUpdate.contractUpdateNonce
    );
  }

  private _isInitialSignedContractUpdate (signedContractUpdate: SignedContractUpdate) {
    return (signedContractUpdate.contractUpdate.contractUpdateNonce === 0);
  }

  /**
   * creates a new Channel instance
   * @param afp AFP instance
   * @param economicsKernel EconomicsKernel instance
   * @param ownershipKernel OwnershipKernel instance
   * @returns Channel
   */
  public static create (afp: AFP, economicsKernel: EconomicsKernel, ownershipKernel: OwnershipKernel) {
    return new Channel(afp, economicsKernel, ownershipKernel);
  }

  /**
   * initializes a new Channel instance based on a valid initial signed contract update
   * @notice validates the provided first signed contract uodate
   * @param afp AFP instance
   * @param economicsKernel EconomicsKernel instance
   * @param ownershipKernel OwnershipKernel instance
   * @param signedContractUpdate signed contract update
   * @returns Channel
   */
  public static async init (
    afp: AFP, 
    economicsKernel: EconomicsKernel,
    ownershipKernel: OwnershipKernel,
    signedContractUpdate: SignedContractUpdate
  ) {
    const channel = new Channel(afp, economicsKernel, ownershipKernel);

    if (!(await channel._validateSignedContractUpdate(signedContractUpdate))) {
      throw(new Error('EXECUTION_ERROR: invalid signed contract update provided.'));
    }

    return new Channel(afp, economicsKernel, ownershipKernel, signedContractUpdate);
  }

  /**
   * initializes a new Channel instance based on an arbitrary signed contract update
   * @notice does not validate the provided signed contract update
   * @param afp AFP instance
   * @param economicsKernel EconomicsKernel instance
   * @param ownershipKernel OwnershipKernel instance
   * @param signedContractUpdate signed contract update
   * @returns Channel
   */
  public static async initUnsafe (
    afp: AFP, 
    economicsKernel: EconomicsKernel,
    ownershipKernel: OwnershipKernel,
    signedContractUpdate: SignedContractUpdate
  ) {
    return new Channel(afp, economicsKernel, ownershipKernel, signedContractUpdate);
  }
}
