import Web3 from 'web3';
import sigUtil from 'eth-sig-util';

import { ContractUpdate, SignedContractUpdate } from 'src/types';
import { ContractUpdateAsTypedData } from 'src/types/AFP';


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
   * @param contractUpdate contract update to sign
   * @returns SignedContractUpdate
   */
  public async signContractUpdate (contractUpdate: ContractUpdate) {
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
   * @param signedContractUpdate signed contract update to validate
   * @returns true if signatures are valid
   */
  public async validateContractUpdateSignatures (signedContractUpdate: SignedContractUpdate) {
    const typedData = await this._getContractUpdateAsTypedData(signedContractUpdate.contractUpdate);
    const recordCreatorAddress = signedContractUpdate.contractUpdate.recordCreatorAddress;
    const counterpartyAddress = signedContractUpdate.contractUpdate.counterpartyAddress;

    if (!signedContractUpdate.recordCreatorSignature && !signedContractUpdate.counterpartySignature) { return false }
    if (signedContractUpdate.recordCreatorSignature) {
      if (!this._validateSignature(typedData, recordCreatorAddress, signedContractUpdate.recordCreatorSignature)) {
        return false;
      }
    }
    if (signedContractUpdate.counterpartySignature) {
      if (!this._validateSignature(typedData, counterpartyAddress, signedContractUpdate.counterpartySignature)) {
        return false;
      }
    }
    return true;
  }

  private _validateSignature (typedData: ContractUpdateAsTypedData, address: string, signature: string) {
    try {
      const recoveredAddress = sigUtil.recoverTypedSignature({
        data: typedData,
        sig: signature
      });
      if (sigUtil.normalize(address) !== recoveredAddress) { return false; }
    } catch (error) { return false; }
    return true;
  }

  private async _getContractUpdateAsTypedData (contractUpdate: ContractUpdate) {
    const chainId = await this.web3.eth.net.getId();
    const typedData: ContractUpdateAsTypedData = {
      domain: {
        name: 'afp-poc',
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
          { name: 'recordCreatorAddress', type: 'address' },
          { name: 'counterpartyAddress', type: 'address' },
          { name: 'contractAddress', type: 'address' },
          { name: 'contractTermsHash', type: 'string' },
          { name: 'contractStateHash', type: 'string' },
          { name: 'contractUpdateNonce', type: 'uint256' }
        ]
      },
      primaryType: 'ContractUpdate',
      message: {
        contractId: contractUpdate.contractId,
        recordCreatorAddress: contractUpdate.recordCreatorAddress,
        counterpartyAddress: contractUpdate.counterpartyAddress,
        contractAddress: contractUpdate.contractAddress,
        contractTermsHash: this.web3.utils.keccak256(JSON.stringify(contractUpdate.contractTerms)),
        contractStateHash: this.web3.utils.keccak256(JSON.stringify(contractUpdate.contractState)),
        contractUpdateNonce: contractUpdate.contractUpdateNonce
      }
    };
    return typedData;
  }

  private async _sendJsonRpcRequest (method: string, params: any[]) {
    // @ts-ignore
    return this.web3.currentProvider.send(method, params);
  }
}

export default Signer;
