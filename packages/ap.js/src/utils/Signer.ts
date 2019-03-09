import Web3 from 'web3';
import sigUtil from 'eth-sig-util';

import { ContractUpdate, SignedContractUpdate } from '../types';
import { ContractUpdateAsTypedData } from '../types/AP';


export class Signer {
  
  private web3: Web3;
  public account: string;

  constructor (web3: Web3, account: string) {
    this.web3 = web3;
    this.account = account;
  }

  /**
   * signs a given contract update with the provided account
   * EIP712 compliant (tries both eth_signTypedData_v3 and eth_signTypedData)
   * @param {ContractUpdate} contractUpdate contract update to sign
   * @returns {SignedContractUpdate}
   */
  public async signContractUpdate (contractUpdate: ContractUpdate): Promise<string> {
    const typedData = await this._getContractUpdateAsTypedData(contractUpdate);
    const typedDataString = JSON.stringify(typedData);
    
    try {
      const signature: string = await this._sendJsonRpcRequest('eth_signTypedData_v3', [this.account, typedDataString]); 
      return signature;
    } catch (error) {
      try {
        if (!(String(error.message.toString()).includes('Method eth_signTypedData_v3 not supported.'))) { 
          throw(new Error(error)); 
        }
        const signature: string = await this._sendJsonRpcRequest('eth_signTypedData', [this.account, typedData]);
        return signature;
      } catch (error) {
        if (!(String(error.message.toString()).includes('Method eth_signTypedData not supported.'))) { 
          throw(new Error('NOT_DEFINED_ERROR: eth_signTypedData and eth_signTypedData_v3 not provided by web3 provider.'));
        }
        throw(new Error(error)); 
      }
    }
  }

  /**
   * validates the signatures for a given signed contract update
   * @param {SignedContractUpdate} signedContractUpdate signed contract update to validate
   * @returns {Promise<boolean>} true if signatures are valid
   */
  public async validateContractUpdateSignatures (
    signedContractUpdate: SignedContractUpdate
  ): Promise<boolean> {
    const typedData = await this._getContractUpdateAsTypedData(signedContractUpdate.contractUpdate);
    const recordCreatorObligorAddress = signedContractUpdate.contractUpdate.recordCreatorObligorAddress;
    const counterpartyObligorAddress = signedContractUpdate.contractUpdate.counterpartyObligorAddress;

    if (!signedContractUpdate.recordCreatorObligorSignature && !signedContractUpdate.counterpartyObligorSignature) { return false }
    if (signedContractUpdate.recordCreatorObligorSignature) {
      if (!this._validateSignature(typedData, recordCreatorObligorAddress, signedContractUpdate.recordCreatorObligorSignature)) {
        return false;
      }
    }
    if (signedContractUpdate.counterpartyObligorSignature) {
      if (!this._validateSignature(typedData, counterpartyObligorAddress, signedContractUpdate.counterpartyObligorSignature)) {
        return false;
      }
    }
    return true;
  }

  private _validateSignature (
    typedData: ContractUpdateAsTypedData, 
    address: string, 
    signature: string
  ): boolean {
    try {
      const recoveredAddress = sigUtil.recoverTypedSignature({
        data: typedData,
        sig: signature
      });
      if (sigUtil.normalize(address) !== recoveredAddress) { return false; }
    } catch (error) { return false; }
    return true;
  }

  private async _getContractUpdateAsTypedData (
    contractUpdate: ContractUpdate
  ): Promise<ContractUpdateAsTypedData> {
    const chainId = await this.web3.eth.net.getId();
    const typedData: ContractUpdateAsTypedData = {
      domain: {
        name: 'ap-poc',
        version: '1',
        chainId: chainId,
        verifyingContract: contractUpdate.contractAddress
      },
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        ContractUpdate: [
          { name: 'contractId', type: 'string' },
          { name: 'recordCreatorObligorAddress', type: 'address' },
          { name: 'counterpartyObligorAddress', type: 'address' },
          { name: 'contractAddress', type: 'address' },
          { name: 'contractTermsHash', type: 'string' },
          { name: 'contractStateHash', type: 'string' },
          { name: 'contractUpdateNonce', type: 'uint256' }
        ]
      },
      primaryType: 'ContractUpdate',
      message: {
        contractId: contractUpdate.contractId,
        recordCreatorObligorAddress: contractUpdate.recordCreatorObligorAddress,
        counterpartyObligorAddress: contractUpdate.counterpartyObligorAddress,
        contractAddress: contractUpdate.contractAddress,
        contractTermsHash: this.web3.utils.keccak256(JSON.stringify(contractUpdate.contractTerms)),
        contractStateHash: this.web3.utils.keccak256(JSON.stringify(contractUpdate.contractState)),
        contractUpdateNonce: contractUpdate.contractUpdateNonce
      }
    };
    return typedData;
  }

  private async _sendJsonRpcRequest (method: string, params: any[]): Promise<string> {
    // @ts-ignore
    return this.web3.currentProvider.send(method, params);
  }
}

export default Signer;
