import { AFP } from '../index'; 
import { ContractEngine, PAM } from '../engines';
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

  private afp: AFP;
  private contractEngine: ContractEngine;

  private signedContractUpdates: SignedContractUpdate[];

  private constructor (
    afp: AFP, 
    contractEngine: ContractEngine,
    signedContractUpdate?: SignedContractUpdate
  ) {
    if (!afp.client) { throw('FEATURE_UNAVAILABLE_ERROR: Client is not enabled!'); }

    this.afp = afp;
    this.contractEngine = contractEngine;
    this.signedContractUpdates = [];

    if (signedContractUpdate) { 
      this._storeSignedContractUpdate(signedContractUpdate); 
      this._startContractUpdateListener();
    }
  }

  // or getTurnTakerStatus, getObligation
  /**
   * returns the state of the ContractChannel based on the 
   * current state of the contract and the provided timestamp
   * @param {number} timestamp current timestamp
   * @returns {Promise<ChannelState>}
   */
  public async getChannelState (timestamp: number): Promise<ChannelState> {
    const account = this.afp.signer.account;
    const signedContractUpdate = this.getLastSignedContractUpdate();

    if (signedContractUpdate.recordCreatorObligorSignature && signedContractUpdate.counterpartyObligorSignature) {
      const pendingEventSchedule = await this.contractEngine.computePendingSchedule(timestamp);
      const duePayOff = await this.contractEngine.computeDuePayoff(timestamp);

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
   * creates a new contract update for the initial state of the contract
   * and sends it after receiving a signature
   * @notice calls eth_signedTypedData or eth_signedTypedData_v3, prompting the user to sign a contract update
   * @param contractId 
   * @param contractOwnership 
   * @returns {Promise<void>}
   */
  public async signAndSendInitialContractUpdate (
    contractId: string,
    contractOwnership: ContractOwnership,
  ): Promise<void> {
    if (!this.afp.client) { throw('FEATURE_NOT_AVAILABLE: Client is not enabled!'); }
    if (this.signedContractUpdates.length !== 0) { throw(''); }

    const initialContractTerms = this.contractEngine.getContractTerms();
    const initialContractState = this.contractEngine.getContractState();

    this.contractEngine.setContractState(initialContractState);

    const contractUpdate = this._constructInitialContractUpdate(
      contractId,
      contractOwnership,
      initialContractTerms,
      initialContractState
    );

    const signedContractUpdate = await this._signContractUpdate(contractUpdate);
    this._storeSignedContractUpdate(signedContractUpdate);

    await this.afp.client.sendContractUpdate(signedContractUpdate);

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
    if (!this.afp.client) { throw('FEATURE_NOT_AVAILABLE: Client is not enabled!'); }

    const previousSignedContractUpdate = this.getLastSignedContractUpdate();
    
    if (!previousSignedContractUpdate) { throw(''); }
  
    let contractUpdateNonce = previousSignedContractUpdate.contractUpdate.contractUpdateNonce;
    if (previousSignedContractUpdate.recordCreatorObligorSignature && previousSignedContractUpdate.counterpartyObligorSignature) {
      contractUpdateNonce += 1;
    }
    
    const nextContractTerms = this.contractEngine.getContractTerms();
    const nextContractState = await this.contractEngine.computeNextState(timestamp);
    
    this.contractEngine.setContractState(nextContractState);

    const contractUpdate = this._constructNextContractUpdate(
      nextContractTerms,
      nextContractState, 
      contractUpdateNonce
    );
    // const contractUpdateHash = JSON.stringify(contractUpdate);

    const signedContractUpdate = await this._signContractUpdate(contractUpdate);
    this._storeSignedContractUpdate(signedContractUpdate);
    await this.afp.client.sendContractUpdate(signedContractUpdate);
  }

  /**
   * returns the current (last) signed contract update
   * @returns {SignedContractUpdate}
   */
  public getLastSignedContractUpdate (): SignedContractUpdate {
    return this.signedContractUpdates[this.signedContractUpdates.length - 1]; 
  }

  private _startContractUpdateListener (): void  {
    if (!this.afp.client) { throw('FEATURE_NOT_AVAILABLE: Client is not enabled!'); }
    if (this.signedContractUpdates.length == 0) { throw(''); }
    
    const { contractUpdate: { contractId } } = this.getLastSignedContractUpdate();

    this.afp.client.registerContractListener(
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
    const signature = await this.afp.signer.signContractUpdate(contractUpdate);
    const signer = this.afp.signer.account;

    if (signer === contractUpdate.recordCreatorObligorAddress) {
      signedContractUpdate.recordCreatorObligorSignature = signature;
    } else if (signer === contractUpdate.counterpartyObligorAddress) {
      signedContractUpdate.counterpartyObligorSignature = signature;
    } else {
      throw(new Error(
        'Addresses do not match. Address of sender has to be equal to recordCreatorObligorAddress or counterpartyObligorAddress.'
      ));
    }

    return signedContractUpdate;
  }

  private _storeSignedContractUpdate (signedContractUpdate: SignedContractUpdate): void {
    this.signedContractUpdates.push(signedContractUpdate);
  }

  private async _validateSignedContractUpdate (signedContractUpdate: SignedContractUpdate): Promise<boolean> {
    if (!(await this.afp.signer.validateContractUpdateSignatures(signedContractUpdate))) { return false }

    const previousSignedContractUpdate = this.getLastSignedContractUpdate();

    if (!signedContractUpdate.recordCreatorObligorSignature !== !signedContractUpdate.counterpartyObligorSignature) {
      if (!this._validateProposal(signedContractUpdate, previousSignedContractUpdate)) { return false; }
    } else if (signedContractUpdate.recordCreatorObligorSignature && signedContractUpdate.counterpartyObligorSignature) {
      if (!this._validateAcknowledgement(signedContractUpdate, previousSignedContractUpdate)) { return false; }
    } else { 
      return false;
    }
  
    return true;
  }

  private async _validateProposal (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate?: SignedContractUpdate
  ): Promise<boolean> {
    if (this._isInitialSignedContractUpdate(signedContractUpdate)) {
      if (previousSignedContractUpdate) { 
        return false; 
      }
      if (!this.contractEngine.validateInitialState(signedContractUpdate.contractUpdate.contractState)) { 
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
      if (!this.contractEngine.validateNextState(signedContractUpdate.contractUpdate.contractState)) { 
        return false;
      }
    }

    return true;
  }

  private async _validateAcknowledgement (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate?: SignedContractUpdate
  ): Promise<boolean> {
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
      if(!this.contractEngine.validateInitialState(signedContractUpdate.contractUpdate.contractState)) { 
        return false; 
      }
    } else {
      if (!this.contractEngine.validateNextState(signedContractUpdate.contractUpdate.contractState)) { 
        return false; 
      }
    }

    return true;
  }

  private _areContractUpdateAddressesUnaltered (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ): boolean {
    return (
      !(
        previousSignedContractUpdate.contractUpdate.recordCreatorObligorAddress === 
        signedContractUpdate.contractUpdate.recordCreatorObligorAddress &&
        previousSignedContractUpdate.contractUpdate.counterpartyObligorAddress === 
        signedContractUpdate.contractUpdate.counterpartyObligorAddress
      )
    );
  }

  private _isNewSignedContractUpdate (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ): boolean {
    return (JSON.stringify(previousSignedContractUpdate) === JSON.stringify(signedContractUpdate));
  }

  private _areContractUpdateSignaturesUnaltered (
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

  private _isContractUpdateNonceHigher (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ): boolean {
    return (
      previousSignedContractUpdate.contractUpdate.contractUpdateNonce >= 
      signedContractUpdate.contractUpdate.contractUpdateNonce
    );
  }

  private _isContractUpdateNonceUnaltered (
    signedContractUpdate: SignedContractUpdate, 
    previousSignedContractUpdate: SignedContractUpdate
  ): boolean {
    return (
      previousSignedContractUpdate.contractUpdate.contractUpdateNonce !== 
      signedContractUpdate.contractUpdate.contractUpdateNonce
    );
  }

  private _isInitialSignedContractUpdate (signedContractUpdate: SignedContractUpdate): boolean {
    return (signedContractUpdate.contractUpdate.contractUpdateNonce === 0);
  }

  /**
   * returns a new ContractChannel instance
   * @notice to initialize the ContractChannel call signAndSendInitialContractUpdate
   * @param {AFP} afp AFP instance
   * @param {ContractTerms} contractTerms
   * @returns {Promise<ContractChannel>}
   */
  public static  async create (
    afp: AFP, 
    contractTerms: ContractTerms,
  ): Promise<ContractChannel> {    
    let contractEngine;
    switch (contractTerms.contractType) {
      case ContractType.PAM:
      contractEngine = await PAM.create(afp.web3, contractTerms);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    return new ContractChannel(afp, contractEngine);
  }

  /**
   * returns a new ContractChannel instance based on a valid initial signed contract update
   * @notice validates the provided signed contract upodate 
   * (has to be the initial signed contract update)
   * @param {AFP} afp AFP instance
   * @param {SignedContractUpdate} signedContractUpdate
   * @returns {Promise<ContractChannel>}
   */
  public static async fromSignedContractUpdate (
    afp: AFP,
    signedContractUpdate: SignedContractUpdate
  ): Promise<ContractChannel> {
    const { contractTerms, contractState } = signedContractUpdate.contractUpdate;
    
    let ContractEngine;
    switch (contractTerms.contractType) {
      case ContractType.PAM:
        ContractEngine = await PAM.init(afp.web3, contractTerms, contractState);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const channel = new ContractChannel(afp, ContractEngine);

    if (!(await channel._validateSignedContractUpdate(signedContractUpdate))) {
      throw(new Error('EXECUTION_ERROR: invalid signed contract update provided.'));
    }

    return new ContractChannel(afp, ContractEngine, signedContractUpdate);
  }

  /**
   * initializes a new ContractChannel instance based on an arbitrary signed contract update
   * @notice does not validate the provided signed contract update
   * @param {AFP} afp AFP instance
   * @param {SignedContractUpdate} signedContractUpdate
   * @returns {Promise<ContractChannel>}
   */
  public static async fromSignedContractUpdate_Unsafe (
    afp: AFP, 
    signedContractUpdate: SignedContractUpdate
  ): Promise<ContractChannel> {
    const { contractTerms, contractState } = signedContractUpdate.contractUpdate;
    
    let ContractEngine;
    switch (contractTerms.contractType) {
      case ContractType.PAM:
        ContractEngine = await PAM.init(afp.web3, contractTerms, contractState);        
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    return new ContractChannel(afp, ContractEngine, signedContractUpdate);
  }
}
