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
  AssetOwnership, 
  EvaluatedEventSchedule
} from '../types';


/**
 * stores all contract updates of the respective financial channel
 * processes contract updates
 */
export class AssetChannel {

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
   * returns the assets terms
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

  /**
   * returns the initial schedule derived from the terms of the asset
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getInitialSchedule (): Promise<EvaluatedEventSchedule> {
    return await this.contractEngine.computeEvaluatedInitialSchedule(this.getContractTerms());
  }

  /**
   * returns the pending schedule derived from the terms and the current state of the asset
   * (contains all events between the last executed state transition and the specified timestamp)
   * @param {number} timestamp current timestamp
   * @returns {Promise<EvaluatedEventSchedule>}
   */
  public async getPendingSchedule (timestamp: number): Promise<EvaluatedEventSchedule> {
    return await this.contractEngine.computeEvaluatedPendingSchedule(
      this.getContractTerms(),
      this.getContractState(),
      timestamp
    );
  }

  // or getTurnTakerStatus, getObligation
  /**
   * returns the state of the AssetChannel based on the 
   * current state of the asset and the provided timestamp
   * @param {number} timestamp current timestamp
   * @returns {Promise<ChannelState>}
   */
  public async getChannelState (timestamp: number): Promise<ChannelState> {
    const account = this.ap.signer.account;
    const signedContractUpdate = this.getLastSignedContractUpdate();
    const terms = this.getContractTerms();
    const state = this.getContractState();

    if (signedContractUpdate.recordCreatorObligorSignature && signedContractUpdate.counterpartyObligorSignature) {
      const pendingEventSchedule = await this.contractEngine.computeEvaluatedPendingSchedule(
        terms, 
        state, 
        timestamp
      );
      const duePayoff = await this.contractEngine.computeDuePayoff(terms, state, timestamp);

      if (pendingEventSchedule.length === 0) { return ChannelState.Idle; }

      if (
        duePayoff.isLessThanOrEqualTo(0) &&
        account === signedContractUpdate.contractUpdate.recordCreatorObligorAddress
      ) { return ChannelState.Updatable; }

      if (
        duePayoff.isGreaterThanOrEqualTo(0) &&
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
   * computes the initial state of the asset, creates a new contract update from it
   * and sends it after receiving a signature from the user
   * @notice calls eth_signedTypedData or eth_signedTypedData_v3, prompting the user to sign a contract update
   * @param {string} assetId 
   * @param {ContractTerms} terms
   * @param {AssetOwnership} ownership 
   * @returns {Promise<void>}
   */
  private async _signAndSendInitialContractUpdate (
    assetId: string,
    terns: ContractTerms,
    ownership: AssetOwnership,
  ): Promise<void> {
    if (!this.ap.client) { 
      throw(new Error('FEATURE_NOT_AVAILABLE: Client is not enabled!')); 
    }
    if (this.signedContractUpdates.length !== 0) { 
      throw(new Error(
        'EXECUTION_ERROR: AssetChannel is already initialized! Use signAndSendNextContractUpdate method instead.'
      )); 
    }

    const initialContractState = await this.contractEngine.computeInitialState(terns);

    const contractUpdate = this._constructInitialContractUpdate(
      assetId,
      ownership,
      terns,
      initialContractState
    );

    const signedContractUpdate = await this._signContractUpdate(contractUpdate);
    this._storeSignedContractUpdate(signedContractUpdate);

    await this.ap.client.sendContractUpdate(signedContractUpdate);

    this._startContractUpdateListener();
  }

  /**
   * computes the next state of the asset for a given timestamp, 
   * creates a new contract update from it and sends it after receiving a signature from the user
   * @notice calls eth_signedTypedData or eth_signedTypedData_v3, prompting the user to sign a contract update
   * @param {number} timestamp current timestamp
   * @returns {Promise<void>} promise when signed contract update was sent
   */
  public async signAndSendNextContractUpdate (timestamp: number): Promise<void> {
    if (!this.ap.client) { 
      throw(new Error('FEATURE_NOT_AVAILABLE: Client is not enabled!')); 
    }

    const previousSignedContractUpdate = this.getLastSignedContractUpdate();
    
    if (!previousSignedContractUpdate) { 
      throw(new Error(
        'EXECUTION_ERROR: AssetChannel is not initialized! Use signAndSendInitialContractUpdate method instead.'
      )); 
    }
  
    let contractUpdateNonce = previousSignedContractUpdate.contractUpdate.contractUpdateNonce;
    if (
      previousSignedContractUpdate.recordCreatorObligorSignature && 
      previousSignedContractUpdate.counterpartyObligorSignature
    ) {
      contractUpdateNonce += 1;
    }

    const terms = this.getContractTerms();
    const state = this.getContractState();

    const nextState = await this.contractEngine.computeNextState(terms, state, timestamp);

    const contractUpdate = this._constructNextContractUpdate(terms, nextState, contractUpdateNonce);
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
        'EXECUTION_ERROR: AssetChannel is not initialized! There has to be at least one previous valid signed contract update in order to start the listener.'
      )); 
    }
    
    const { contractUpdate: { assetId } } = this.getLastSignedContractUpdate();

    this.ap.client.registerContractUpdateListener(
      this.ap.signer.account,
      assetId,
      async (signedContractUpdate: SignedContractUpdate) => {
        if (!(await this._validateSignedContractUpdate(signedContractUpdate))) { return; } 
        this._storeSignedContractUpdate(signedContractUpdate);
      }
    );
  }

  private _constructInitialContractUpdate (
    assetId: string,
    ownership: AssetOwnership,
    terms: ContractTerms,
    initialState: ContractState
  ): ContractUpdate {
    return {
      assetId: assetId,
      recordCreatorObligorAddress: ownership.recordCreatorObligorAddress,
      counterpartyObligorAddress: ownership.counterpartyObligorAddress,
      contractAddress: '',
      contractTerms: terms,
      contractState: initialState,
      contractUpdateNonce: 0
    }
  }

  private _constructNextContractUpdate (
    terms: ContractTerms,
    nextState: ContractState,
    nextContractUpdateNonce: number
  ): ContractUpdate {
    const { contractUpdate } = this.getLastSignedContractUpdate();

    return {
      assetId: contractUpdate.assetId,
      recordCreatorObligorAddress: contractUpdate.recordCreatorObligorAddress,
      counterpartyObligorAddress: contractUpdate.counterpartyObligorAddress,
      contractAddress: '',
      contractTerms: terms,
      contractState: nextState,
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
    const proposedState = signedContractUpdate.contractUpdate.contractState;
    
    if (Assert.isInitialSignedContractUpdate(signedContractUpdate)) {
      if (previousSignedContractUpdate) { return false; }
      const terms = signedContractUpdate.contractUpdate.contractTerms;

      if (!(await this.contractEngine.validateInitialState(terms, proposedState))) { 
        return false; 
      }
    } else {
      if (!previousSignedContractUpdate) { return false; }
      const terms = previousSignedContractUpdate.contractUpdate.contractTerms;
      const state = previousSignedContractUpdate.contractUpdate.contractState;
      
      if (!(Assert.isNewSignedContractUpdate(signedContractUpdate, previousSignedContractUpdate))) { 
        return false; 
      }
      if (!(Assert.areContractUpdateAddressesUnaltered(signedContractUpdate, previousSignedContractUpdate))) {
        return false;
      }
      if (!(Assert.isContractUpdateNonceHigher(signedContractUpdate, previousSignedContractUpdate))) {
        return false;
      }
      if (!(await this.contractEngine.validateNextState(terms, state, proposedState))) { 
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

    const proposedState = signedContractUpdate.contractUpdate.contractState;
    const terms = this.getContractTerms();
    const state = this.getContractState();

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
      if(!this.contractEngine.validateInitialState(terms, proposedState)) { 
        return false; 
      }
    } else {
      if (!this.contractEngine.validateNextState(terms, state, proposedState)) { 
        return false; 
      }
    }

    return true;
  }

  /**
   * returns a new AssetChannel instance
   * @notice calls signAndSendInitialContractUpdate method, whereby eth_signedTypedData or 
   * eth_signedTypedData_v3 is called, prompting the user to sign a contract update
   * @param {AP} ap AP instance
   * @param {ContractTerms} terms
   * @param {AssetOwnership} ownership
   * @returns {Promise<AssetChannel>}
   */
  public static async create (
    ap: AP, 
    terms: ContractTerms,
    ownership: AssetOwnership
  ): Promise<AssetChannel> {    
    const assetId = 'PAM' + String(Math.floor(Date.now() / 1000));

    let contractEngine;
    switch (terms.contractType) {
      case ContractType.PAM:
      contractEngine = await PAM.init(ap.web3);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const assetChannel = new AssetChannel(ap, contractEngine);
    await assetChannel._signAndSendInitialContractUpdate(assetId, terms, ownership);

    return assetChannel;
  }

  /**
   * returns a new AssetChannel instance based on a valid initial signed contract update
   * @notice validates the provided signed contract upodate 
   * (has to be the initial signed contract update)
   * @param {AP} ap AP instance
   * @param {SignedContractUpdate} signedContractUpdate
   * @returns {Promise<AssetChannel>}
   */
  public static async fromSignedContractUpdate (
    ap: AP,
    signedContractUpdate: SignedContractUpdate
  ): Promise<AssetChannel> {
    const { contractTerms: { contractType }} = signedContractUpdate.contractUpdate;
    
    let ContractEngine;
    switch (contractType) {
      case ContractType.PAM:
        ContractEngine = await PAM.init(ap.web3);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const assetChannel = new AssetChannel(ap, ContractEngine);

    if (!(await assetChannel._validateSignedContractUpdate(signedContractUpdate))) {
      throw(new Error('EXECUTION_ERROR: invalid signed contract update provided.'));
    }

    return new AssetChannel(ap, ContractEngine, signedContractUpdate);
  }

  /**
   * initializes a new AssetChannel instance based on an arbitrary signed contract update
   * @notice does not validate the provided signed contract update
   * @param {AP} ap AP instance
   * @param {SignedContractUpdate} signedContractUpdate
   * @returns {Promise<AssetChannel>}
   */
  public static async fromSignedContractUpdate_Unsafe (
    ap: AP, 
    signedContractUpdate: SignedContractUpdate
  ): Promise<AssetChannel> {
    const { contractTerms: { contractType } } = signedContractUpdate.contractUpdate;
    
    let ContractEngine;
    switch (contractType) {
      case ContractType.PAM:
        ContractEngine = await PAM.init(ap.web3);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    return new AssetChannel(ap, ContractEngine, signedContractUpdate);
  }
}
