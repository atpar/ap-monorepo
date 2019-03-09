import { ContractTerms, ContractType, ContractOwnership, ContractState } from './types';
import { ContractEngine, PAM } from './engines';
import { AP } from './index';


/**
 * class which provides methods for managing an ACTUS contract 
 * exposes methods for ownership management, settlement of payoffs and 
 * economic lifecycle management for an ACTUS contract
 */
export class Contract {
  
  private ap: AP;
  // @ts-ignore
  private contractEngine: ContractEngine;
  
  public contractId: string;

  private constructor (
    ap: AP,
    contractEngine: ContractEngine,
    contractId: string
  ) {
    this.ap = ap;
    this.contractEngine = contractEngine;

    this.contractId = contractId;
  }

  /**
   * return the terms of the contract
   * @returns {Promise<ContractTerms>}
   */
  public async getContractTerms (): Promise<ContractTerms> { 
    return this.ap.economics.getContractTerms(this.contractId); 
  }

  /**
   * returns the current state of the contract
   * @returns {Promise<ContractState>}
   */
  public async getContractState (): Promise<ContractState> { 
    return this.ap.economics.getContractState(this.contractId); 
  }

  /**
   * returns the current ownership of the contract
   * @param {string} contractId 
   * @returns {Promise<ContractOwnership>}
   */
  public async getContractOwnership (contractId: string): Promise<ContractOwnership> {
    return this.ap.ownership.getContractOwnership(contractId);
  }
 

  /**
   * registers the terms, the initial state and the ownership of a contract 
   * and returns a new Contract instance.
   * computes the initial contract state,
   * stores it together with the terms of the ContractRegistry,
   * stores the ownership of the contract in the OwnershipRegistry and sends it
   * @param {AP} ap AP instance
   * @param {ContractTerms} contractTerms contract terms
   * @param {ContractOwnership} contractOwnership ownership of the contract
   * @returns {Promise<Contract>}
   */
  public static async create (
    ap: AP,
    contractTerms: ContractTerms,
    contractOwnership: ContractOwnership
  ): Promise<Contract> {
    const contractId = 'PAM' + String(Math.floor(Date.now() / 1000));

    let contractEngine;
    switch (contractTerms.contractType) {
      case ContractType.PAM:
        contractEngine = await PAM.init(ap.web3);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const initialContractState = await contractEngine.computeInitialState(contractTerms);

    await ap.ownership.registerContractOwnership(contractId, contractOwnership);
    await ap.economics.registerContract(
      contractId, 
      contractTerms, 
      initialContractState
    );

    return new Contract(ap, contractEngine, contractId);
  }

  /**
   * loads a already registered Contract and returns a new Contract instance from a provided ContactId
   * @param {AP} ap AP instance
   * @param {string} contractId 
   * @returns {Promise<Contract>}
   */
  public static async loadContract (
    ap: AP,
    contractId: string
  ): Promise<Contract> {
    const { contractType, statusDate } = await ap.economics.getContractTerms(contractId);

    if (statusDate == 0) { throw('NOT_FOUND_ERROR: no contract found for given ContractId!'); }

    let contractEngine;
    switch (contractType) {
      case ContractType.PAM:
        contractEngine = await PAM.init(ap.web3);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }
    
    return new Contract(ap, contractEngine, contractId);
  }
}
