import Web3 from 'web3';
import sigUtil from 'eth-sig-util';

import { 
  TypedData,
  OrderData, 
  OrderDataAsTypedData,
  EnhancementOrderDataAsTypedData,
  EnhancementOrderData,
  isOrderData,
  isEnhancementOrderData
} from '../types';
import { getOrderDataAsTypedData, getEnhancementOrderDataAsTypedData } from '../utils/ERC712';
import { ZERO_BYTES, ZERO_ADDRESS } from '../utils/Constants';


export class Signer {
  
  private web3: Web3;
  public account: string;
  private verifyingContractAddress: string;

  public constructor (web3: Web3, account: string, verifyingContractAddress: string) {
    this.web3 = web3;
    this.account = account;
    this.verifyingContractAddress = verifyingContractAddress;
  }

  /**
   * signs a given order with the provided account and returns the signature
   * EIP712 compliant (tries both eth_signTypedData_v3 and eth_signTypedData)
   * @param {OrderData} orderData contract update to sign
   * @returns {string}
   */
  public async signOrderAsMaker (orderData: OrderData): Promise<string> {
    return this._signTypedData(getOrderDataAsTypedData(orderData, false, this.verifyingContractAddress));
  }

  /**
   * signs a given order with the provided account and returns the signature
   * EIP712 compliant (tries both eth_signTypedData_v3 and eth_signTypedData)
   * @param {OrderData} orderData contract update to sign
   * @returns {string}
   */
  public async signOrderAsTaker (orderData: OrderData): Promise<string> {
    return this._signTypedData(getOrderDataAsTypedData(orderData, true, this.verifyingContractAddress));
  }

  /**
   * validates the signatures of OrderData
   * @param {OrderData} orderData orderData containing signature to validate
   * @returns {boolean} true if signatures are valid
   */
  public validateSignatures (
    orderDataOrEnhancementOrderData: OrderData | EnhancementOrderData
  ): boolean {
    let unfilledTypedData;
    let filledTypedData;

    if (isOrderData(orderDataOrEnhancementOrderData)) {
      unfilledTypedData = getOrderDataAsTypedData(orderDataOrEnhancementOrderData, false, this.verifyingContractAddress);
      filledTypedData = getOrderDataAsTypedData(orderDataOrEnhancementOrderData, true, this.verifyingContractAddress);
    } else if (isEnhancementOrderData(orderDataOrEnhancementOrderData)) {
      unfilledTypedData = getEnhancementOrderDataAsTypedData(orderDataOrEnhancementOrderData, false, this.verifyingContractAddress);
      filledTypedData = getEnhancementOrderDataAsTypedData(orderDataOrEnhancementOrderData, true, this.verifyingContractAddress);
    } else {
      throw new Error('Malformed OrderData or EnhancementOrderData provided.');
    }

    if (!this._validateSignature(
      unfilledTypedData,
      orderDataOrEnhancementOrderData.ownership.creatorObligor, 
      orderDataOrEnhancementOrderData.creatorSignature
    )) { return false; }

    if (
      orderDataOrEnhancementOrderData.counterpartySignature
      && orderDataOrEnhancementOrderData.counterpartySignature !== ZERO_BYTES
    ) {
      if (!this._validateSignature(
        filledTypedData, 
        orderDataOrEnhancementOrderData.ownership.counterpartyObligor, 
        orderDataOrEnhancementOrderData.counterpartySignature
      )) { return false; }
    }

    if (isOrderData(orderDataOrEnhancementOrderData)) {
      if (!this.validateSignatures(orderDataOrEnhancementOrderData.enhancementOrder_1)) {
        return false;
      }
      if (!this.validateSignatures(orderDataOrEnhancementOrderData.enhancementOrder_2)) {
        return false;
      }
    }

    return true;
  }

  private _validateSignature (
    typedData: OrderDataAsTypedData | EnhancementOrderDataAsTypedData, 
    address: string, 
    signature: string
  ): boolean {
    if (address === ZERO_ADDRESS && signature === ZERO_BYTES) { return true; }

    try {
      const recoveredAddress = sigUtil.recoverTypedSignature({
        data: typedData,
        sig: signature
      });
      if (sigUtil.normalize(address) !== recoveredAddress) { return false; }
    } catch (error) {
      return false; 
    }
    return true;
  }
  
  private async _signTypedData (typedData: TypedData): Promise<string> {
    const typedDataString = JSON.stringify(typedData);

    try {
      const signature: string = await this._sendJsonRpcRequest('eth_signTypedData_v3', [this.account, typedDataString]); 
      return signature;
    } catch (error) {
      try {
        if (!(String(error.message.toString()).includes('Method eth_signTypedData_v3 not supported.'))) {
          throw error;
        }
        const signature: string = await this._sendJsonRpcRequest('eth_signTypedData', [this.account, typedData]);
        return signature;
      } catch (error) {
        if (!(String(error.message.toString()).includes('Method eth_signTypedData not supported.'))) { 
          throw(new Error('Mehtods eth_signTypedData and eth_signTypedData_v3 are not provided by web3 provider.'));
        }
        throw error; 
      }
    }
  }

  private async _sendJsonRpcRequest (method: string, params: any[]): Promise<string> {
    return new Promise((resolve: any, reject: any): void => {
      if (!this.web3.currentProvider) { throw new Error('No web3 provider found.'); }

      // @ts-ignore
      this.web3.currentProvider.send({
        method,
        params,
        id: new Date().getSeconds(),
        jsonrpc: "2.0"
      // @ts-ignore
      }, function (error: any, result: any): any {
        if (result.error) { return reject(result.error); }
        resolve(result.result);
      });    
    })
  }
}
