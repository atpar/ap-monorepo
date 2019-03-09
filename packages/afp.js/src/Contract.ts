import { ContractTerms, ContractType, ContractOwnership, ContractState } from './types';
import { ContractEngine, PAM } from './engines';
import { AFP } from './index';


/**
 * class which provides methods for managing an ACTUS contract 
 * exposes methods for ownership management, settlement of payoffs and 
 * economic lifecycle management for an ACTUS contract
 */
export class Contract {
  
  private afp: AFP;
  // @ts-ignore
  private contractEngine: ContractEngine;
  
  public contractId: string;

  private constructor (
    afp: AFP,
    contractEngine: ContractEngine,
    contractId: string
  ) {
    this.afp = afp;
    this.contractEngine = contractEngine;

    this.contractId = contractId;
  }

  /**
   * return the terms of the contract
   * @returns {Promise<ContractTerms>}
   */
  public async getContractTerms (): Promise<ContractTerms> { 
    return this.afp.economics.getContractTerms(this.contractId); 
  }

  /**
   * returns the current state of the contract
   * @returns {Promise<ContractState>}
   */
  public async getContractState (): Promise<ContractState> { 
    return this.afp.economics.getContractState(this.contractId); 
  }

  /**
   * returns the current ownership of the contract
   * @param {string} contractId 
   * @returns {Promise<ContractOwnership>}
   */
  public async getContractOwnership (contractId: string): Promise<ContractOwnership> {
    return this.afp.ownership.getContractOwnership(contractId);
  }
 

  /**
   * registers the terms, the initial state and the ownership of a contract 
   * and returns a new Contract instance.
   * computes the initial contract state,
   * stores it together with the terms of the ContractRegistry,
   * stores the ownership of the contract in the OwnershipRegistry and sends it
   * @param {AFP} afp AFP instance
   * @param {ContractTerms} contractTerms contract terms
   * @param {ContractOwnership} contractOwnership ownership of the contract
   * @returns {Promise<Contract>}
   */
  public static async create (
    afp: AFP,
    contractTerms: ContractTerms,
    contractOwnership: ContractOwnership
  ): Promise<Contract> {
    const contractId = 'PAM' + String(Math.floor(Date.now() / 1000));

    let contractEngine;
    switch (contractTerms.contractType) {
      case ContractType.PAM:
        contractEngine = await PAM.init(afp.web3);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }

    const initialContractState = await contractEngine.computeInitialState(contractTerms);

    await afp.ownership.registerContractOwnership(contractId, contractOwnership);
    await afp.economics.registerContract(
      contractId, 
      contractTerms, 
      initialContractState
    );

    return new Contract(afp, contractEngine, contractId);
  }

  /**
   * loads a already registered Contract and returns a new Contract instance from a provided ContactId
   * @param {AFP} afp AFP instance
   * @param {string} contractId 
   * @returns {Promise<Contract>}
   */
  public static async loadContract (
    afp: AFP,
    contractId: string
  ): Promise<Contract> {
    const { contractType, statusDate } = await afp.economics.getContractTerms(contractId);

    if (statusDate == 0) { throw('NOT_FOUND_ERROR: no contract found for given ContractId!'); }

    let contractEngine;
    switch (contractType) {
      case ContractType.PAM:
        contractEngine = await PAM.init(afp.web3);
        break;
      default:
        throw(new Error('NOT_IMPLEMENTED_ERROR: unsupported contract type!'));
    }
    
    return new Contract(afp, contractEngine, contractId);
  }
}
