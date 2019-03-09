import { AP } from '../index'; 
import { ContractEngine, PAM } from '../engines';
import * as Assert from './ContractUpdateAssertions';
import { 
  ContractType,
  ContractUpdate, 
  ContractState, 
  SignedContractUpdate, 
  ChannelState, 
  ContractTerms, 
  ContractOwnership 
} from '../types';


/**
 * stores all contract updates of the respective financial channel
 * processes contract updates
 */
export class ContractChannel {

  private ap: AP;
  private contractEngine: ContractEngine;

  private signedContractUpdates: SignedContractUpdate[];

  private constructor (
    ap: AP, 
    contractEngine: ContractEngine,
    signedContractUpdate?: SignedContractUpdate
  ) {
    if (!ap.client) { 
      throw(new Error('FEATURE_UNAVAILABLE_ERROR: Client is not enabled!')); 
    }

    this.ap = ap;
    this.contractEngine = contractEngine;
    this.signedContractUpdates = [];

    if (signedContractUpdate) { 
      this._storeSignedContractUpdate(signedContractUpdate); 
      this._startContractUpdateListener();
    }
  }

  /**
   * returns the contract terms
   * @returns {ContractTerms}
   */
  public getContractTerms (): ContractTerms {
    return this.getLastSignedContractUpdate().contractUpdate.contractTerms;
  }

  /**
   * returns the last accepted contract state of the channel
   * (not the last co-signed contract state)
   * @returns {ContractState}
   */
  public getContractState (): ContractState {
    return this.getLastSignedContractUpdate().contractUpdate.contractState;
  }

  // or getTurnTakerStatus, getObligation
  /**
   * returns the state of the ContractChannel based on the 
   * current state of the contract and the provided timestamp
   * @param {number} timestamp current timestamp
   * @returns {Promise<ChannelState>}
   */
  public async getChannelState (timestamp: number): Promise<ChannelState> {
    const account = this.ap.signer.account;
    const signedContractUpdate = this.getLastSignedContractUpdate();
    const contractTerms = this.getContractTerms();
    const contractState = this.getContractState();

    if (signedContractUpdate.recordCreatorObligorSignature && signedContractUpdate.counterpartyObligorSignature) {
      const pendingEventSchedule = await this.contractEngine.computePendingSchedule(
        contractTerms, 
        contractState, 
        timestamp
      );
      const duePayOff = await this.contractEngine.computeDuePayoff(contractTerms, contractState, timestamp);

      if (pendingEventSchedule.length === 0) { return ChannelState.Idle; }

      if (
        duePayOff.isLessThanOrEqualTo(0) &&
        account === signedContractUpdate.contractUpdate.recordCreatorObligorAddress
      ) { return ChannelState.Updatable; }

      if (
        duePayOff.isGreaterThanOrEqualTo(0) &&
        account === signedContractUpdate.contractUpdate.counterpartyObligorAddress
      ) { return ChannelState.Updatable; }
    }

    if (
      account === signedContractUpdate.contractUpdate.recordCreatorObligorAddress &&
      !signedContractUpdate.recordCreatorObligorSignature
    ) { return ChannelState.Confirmable; }

    if (
      account === signedContractUpdate.contractUpdate.counterpartyObligorAddress &&
      !signedContractUpdate.counterpartyObligorSignature
    ) { return ChannelState.Confirmable; }

    return ChannelState.Receivable;
  }

  /**
   * computes the initial state of the contact, creates a new contract update from it
   * and sends it after receiving a signature
   * @notice calls eth_signedTypedData or eth_signedTypedData_v3, prompting the user to sign a contract update
   * @param {string} contractId 
   * @param {ContractTerms} contractTerms
   * @param {ContractOwnership} contractOwnership 
   * @returns {Promise<void>}
   */
  private async _signAndSendInitialContractUpdate (
    contractId: string,
    contractTerms: ContractTerms,
    contractOwnership: ContractOwnership,
  ): Promise<void> {
    if (!this.ap.client) { 
      throw(new Error('FEATURE_NOT_AVAILABLE: Client is not enabled!')); 
    }
    if (this.signedContractUpdates.length !== 0) { 
      throw(new Error(
        'EXECUTION_ERROR: ContractChannel is already initialized! Use signAndSendNextContractUpdate method instead.'
      )); 
    }

    const initialContractState = await this.contractEngine.computeInitialState(contractTerms);

    const contractUpdate = this._constructInitialContractUpdate(
      contractId,
      contractOwnership,
      contractTerms,
      initialContractState
    );

    const signedContractUpdate = await this._signContractUpdate(contractUpdate);
    this._storeSignedContractUpdate(signedContractUpdate);

    await this.ap.client.sendContractUpdate(signedContractUpdate);

    this._startContractUpdateListener();
  }

  /**
   * creates a new contract update based on the next state 
   * for a given timestamp and sends it after receiving a signature
   * @notice calls eth_signedTypedData or eth_signedTypedData_v3, prompting the user to sign a contract update
   * @param {number} timestamp current timestamp
   * @returns {Promise<void>} promise when signed contractupdate was sent
   */
  public async signAndSendNextContractUpdate (timestamp: number): Promise<void> {
    if (!this.ap.client) { 
      throw(new Error('FEATURE_NOT_AVAILABLE: Client is not enabled!')); 
    }

    const previousSignedContractUpdate = this.getLastSignedContractUpdate();
    
    if (!previousSignedContractUpdate) { 
      throw(new Error(
        'EXECUTION_ERROR: ContractChannel is not initialized! Use signAndSendInitialContractUpdate method instead.'
      )); 
    }
  
    let contractUpdateNonce = previousSignedContractUpdate.contractUpdate.contractUpdateNonce;
    if (
      previousSignedContractUpdate.recordCreatorObligorSignature && 
      previousSignedContractUpdate.counterpartyObligorSignature
    ) {
      contractUpdateNonce += 1;
    }

    const contractTerms = this.getContractTerms();
    const contractState = this.getContractState();

    const nextContractState = await this.contractEngine.computeNextState(contractTerms, contractState, timestamp);

    const contractUpdate = this._constructNextContractUpdate(
      contractTerms,
      nextContractState, 
      contractUpdateNonce
    );
    // const contractUpdateHash = JSON.stringify(contractUpdate);

    const signedContractUpdate = await this._signContractUpdate(contractUpdate);
    this._storeSignedContractUpdate(signedContractUpdate);
    await this.ap.client.sendContractUpdate(signedContractUpdate);
  }

  /**
   * returns the current (last) signed contract update
   * @returns {SignedContractUpdate}
   */
  public getLastSignedContractUpdate (): SignedContractUpdate {
    return this.signedContractUpdates[this.signedContractUpdates.length - 1]; 
  }

  private _startContractUpdateListener (): void  {
    if (!this.ap.client) { 
      throw(new Error('FEATURE_NOT_AVAILABLE: Client is not enabled!')); 
    }
    if (this.signedContractUpdates.length == 0) { 
      throw(new Error(
        'EXECUTION_ERROR: ContractChannel is not initialized! There has to be at least one previous valid signed contract update in order to start the listener.'
      )); 
    }
    
    const { contractUpdate: { contractId } } = this.getLastSignedContractUpdate();

    this.ap.client.registerContractListener(
      contractId,
      async (signedContractUpdate: SignedContractUpdate) => {
        if (!(await this._validateSignedContractUpdate(signedContractUpdate))) { return; } 
        this._storeSignedContractUpdate(signedContractUpdate);
      }
    );
  }

  private _constructInitialContractUpdate (
    contractId: string,
    contractOwnership: ContractOwnership,
    initialContractTerms: ContractTerms,
    initialContractState: ContractState
  ): ContractUpdate {
    return {
      contractId: contractId,
      recordCreatorObligorAddress: contractOwnership.recordCreatorObligorAddress,
      counterpartyObligorAddress: contractOwnership.counterpartyObligorAddress,
      contractAddress: '',
      contractTerms: initialContractTerms,
      contractState: initialContractState,
      contractUpdateNonce: 0
    }
  }

  private _constructNextContractUpdate (
    nextContractTerms: ContractTerms,
    nextContractState: ContractState,
    nextContractUpdateNonce: number
  ): ContractUpdate {
    const { contractUpdate } = this.getLastSignedContractUpdate();

    return {
      contractId: contractUpdate.contractId,
      recordCreatorObligorAddress: contractUpdate.recordCreatorObligorAddress,
      counterpartyObligorAddress: contractUpdate.counterpartyObligorAddress,
      contractAddress: '',
      contractTerms: nextContractTerms,
      contractState: nextContractState,
      contractUpdateNonce: nextContractUpdateNonce
    };
  }

  private async _signContractUpdate (contractUpdate: ContractUpdate): Promise<SignedContractUpdate> {
    const signedContractUpdate: SignedContractUpdate = { 
      contractUpdate: contractUpdate, 
      recordCreatorObligorSignature: '', 
      counterpartyObligorSignature: '' 
    };
    const signature = await this.ap.signer.signContractUpdate(contractUpdate);
    const signer = this.ap.signer.account;

    if (signer === contractUpdate.recordCreatorObligorAddress) {
      signedContractUpdate.recordCreatorObligorSignature = signature;
    } else if (signer === contractUpdate.counterpartyObligorAddress) {
      signedContractUpdate.counterpartyObligorSignature = signature;
    } else {
      throw(new Error(
        'EXECUTION_ERROR: Addresses do not match. Address of sender has to be equal to recordCreatorObligorAddress or counterpartyObligorAddress.'
      ));
    }

    return signedContractUpdate;
  }

  private _storeSignedContractUpdate (signedContractUpdate: SignedContractUpdate): void {
    this.signedContractUpdates.push(signedContractUpdate);
  }

  private async _validateSignedContractUpdate (signedContractUpdate: SignedContractUpdate): Promise<boolean> {
    if (!(await this.ap.signer.validateContractUpdateSignatures(signedContractUpdate))) { return false }

    if (!signedContractUpdate.recordCreatorObligorSignature !== !signedContractUpdate.counterpartyObligorSignature) {
      if (!this._validateProposal(signedContractUpdate)) { return false; }
    } else if (signedContractUpdate.recordCreatorObligorSignature && signedContractUpdate.counterpartyObligorSignature) {
      if (!this._validateAcknowledgement(signedContractUpdate)) { return false; }
    } else { 
      return false;
    }
  
    return true;
  }

  private async _validateProposal (
    signedContractUpdate: SignedContractUpdate, 
  ): Promise<boolean> {
    const previousSignedContractUpdate = this.getLastSignedContractUpdate();
    const proposedContractState = signedContractUpdate.contractUpdate.contractState;
    
    if (Assert.isInitialSignedContractUpdate(signedContractUpdate)) {
      if (previousSignedContractUpdate) { return false; }
      const contractTerms = signedContractUpdate.contractUpdate.contractTerms;

      if (!(await this.contractEngine.validateInitialState(contractTerms, proposedContractState))) { 
        return false; 
      }
    } else {
      if (!previousSignedContractUpdate) { return false; }
      const contractTerms = previousSignedContractUpdate.contractUpdate.contractTerms;
      const contractState = previousSignedContractUpdate.contractUpdate.contractState;
      
      if (!(Assert.isNewSignedContractUpdate(signedContractUpdate, previousSignedContractUpdate))) { 
        return false; 
      }
      if (!(Assert.areContractUpdateAddressesUnaltered(signedContractUpdate, previousSignedContractUpdate))) {
        return false;
      }
      if (!(Assert.isContractUpdateNonceHigher(signedContractUpdate, previousSignedContractUpdate))) {
        return false;
      }
      if (!(await this.contractEngine.validateNextState(contractTerms, contractState, proposedContractState))) { 
        return false;
      }
    }

    return true;
  }

  private async _validateAcknowledgement (
    signedContractUpdate: SignedContractUpdate, 
  ): Promise<boolean> {
    const previousSignedContractUpdate = this.getLastSignedContractUpdate();

    if (!previousSignedContractUpdate) { return false; }

    const proposedContractState = signedContractUpdate.contractUpdate.contractState;
    const contractTerms = this.getContractTerms();
    const contractState = this.getContractState();

    if (!(Assert.isNewSignedContractUpdate(signedContractUpdate, previousSignedContractUpdate))) {
      return false;
    }
    if (!(Assert.areContractUpdateAddressesUnaltered(signedContractUpdate, previousSignedContractUpdate))) {
      return false;
    }
    if (!(Assert.areContractUpdateSignaturesUnaltered(signedContractUpdate, previousSignedContractUpdate))) { 
      return false;
    }
    if (!(Assert.isContractUpdateNonceUnaltered(signedContractUpdate, previousSignedContractUpdate))) {
      return false;
    }
    if (Assert.isInitialSignedContractUpdate(signedContractUpdate)) {
      if(!this.contractEngine.validateInitialState(contractTerms, proposedContractState)) { 
        return false; 
      }
    } else {
      if (!this.contractEngine.validateNextState(contractTerms, contractState, proposedContractState)) { 
        return false; 
      }
    }

    return true;
  }

  /**
   * returns a new ContractChannel instance
   * @notice calls signAndSendInitialContractUpdate method, whereby eth_signedTypedData or 
   * eth_signedTypedData_v3 is called, prompting the user to sign a contract update
   * @param {AP} ap AP instance
   * @param {ContractTerms} contractTerms
   * @param {ContractOwnership} contractOwnership
   * @returns {Promise<ContractChannel>}
   */
  public static async create (
    ap: AP, 
    contractTerms: ContractTerms,
    contractOwnership: ContractOwnership
  ): Promise<ContractChannel> {    
    const contractId = 'PAM' + String(Math.floor(Date.now() / 1000));

    let contractEngine;
    switch (contractTerms.contractType) {
      case ContractType.PAM:
      contractEngine = await PAM.init(ap.web3);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const contractChannel = new ContractChannel(ap, contractEngine);
    await contractChannel._signAndSendInitialContractUpdate(
      contractId, 
      contractTerms,
      contractOwnership
    );

    return contractChannel;
  }

  /**
   * returns a new ContractChannel instance based on a valid initial signed contract update
   * @notice validates the provided signed contract upodate 
   * (has to be the initial signed contract update)
   * @param {AP} ap AP instance
   * @param {SignedContractUpdate} signedContractUpdate
   * @returns {Promise<ContractChannel>}
   */
  public static async fromSignedContractUpdate (
    ap: AP,
    signedContractUpdate: SignedContractUpdate
  ): Promise<ContractChannel> {
    const { contractTerms: { contractType }} = signedContractUpdate.contractUpdate;
    
    let ContractEngine;
    switch (contractType) {
      case ContractType.PAM:
        ContractEngine = await PAM.init(ap.web3);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const contractChannel = new ContractChannel(ap, ContractEngine);

    if (!(await contractChannel._validateSignedContractUpdate(signedContractUpdate))) {
      throw(new Error('EXECUTION_ERROR: invalid signed contract update provided.'));
    }

    return new ContractChannel(ap, ContractEngine, signedContractUpdate);
  }

  /**
   * initializes a new ContractChannel instance based on an arbitrary signed contract update
   * @notice does not validate the provided signed contract update
   * @param {AP} ap AP instance
   * @param {SignedContractUpdate} signedContractUpdate
   * @returns {Promise<ContractChannel>}
   */
  public static async fromSignedContractUpdate_Unsafe (
    ap: AP, 
    signedContractUpdate: SignedContractUpdate
  ): Promise<ContractChannel> {
    const { contractTerms: { contractType } } = signedContractUpdate.contractUpdate;
    
    let ContractEngine;
    switch (contractType) {
      case ContractType.PAM:
        ContractEngine = await PAM.init(ap.web3);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    return new ContractChannel(ap, ContractEngine, signedContractUpdate);
  }
}
