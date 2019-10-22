import Web3 from 'web3';
import sigUtil from 'eth-sig-util';

import { 
  TypedData,
  OrderData, 
  FilledOrderDataAsTypedData,
  UnfilledOrderDataAsTypedData 
} from '../types';


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
    return this._signTypedData(this._getUnfilledOrderDataAsTypedData(orderData));
  }

  /**
   * signs a given order with the provided account and returns the signature
   * EIP712 compliant (tries both eth_signTypedData_v3 and eth_signTypedData)
   * @param {OrderData} orderData contract update to sign
   * @returns {string}
   */
  public async signOrderAsTaker (orderData: OrderData): Promise<string> {
    return this._signTypedData(this._getFilledOrderDataAsTypedData(orderData));
  }

  /**
   * validates the signatures of OrderData
   * @param {OrderData} orderData orderData containing signature to validate
   * @returns {Promise<boolean>} true if signatures are valid
   */
  public validateOrderDataSignatures (
    orderData: OrderData
  ): boolean {
    if (!orderData.signatures.makerSignature) { return false; }

    const unfilledOrderDataTypedData = this._getUnfilledOrderDataAsTypedData(orderData);
    const isValid = this._validateOrderDataSignature(
      unfilledOrderDataTypedData, 
      orderData.makerAddress, 
      orderData.signatures.makerSignature
    );

    if (!isValid) { return false; }

    if (orderData.signatures.takerSignature) {
      if (!orderData.takerAddress) { throw(new Error('EXECUTION_ERROR: takerAddress is undefined.')); }

      const filledOrderDataTypedData = this._getFilledOrderDataAsTypedData(orderData);
      const isValid = this._validateOrderDataSignature(
        filledOrderDataTypedData, 
        orderData.takerAddress, 
        orderData.signatures.takerSignature
      );

      if (!isValid) { return false; }
    }

    return true;
  }

  private _validateOrderDataSignature (
    typedData: UnfilledOrderDataAsTypedData | FilledOrderDataAsTypedData, 
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

  private _getUnfilledOrderDataAsTypedData (
    orderData: OrderData
  ): UnfilledOrderDataAsTypedData {
    const contractTermsHash = this.web3.utils.keccak256(this.web3.eth.abi.encodeParameter(
      ContractTermsABI, this._toTuple(orderData.terms)
    ));

    const typedData: UnfilledOrderDataAsTypedData = {
      domain: {
        name: 'ACTUS Protocol',
        version: '1',
        chainId: 0,
        verifyingContract: this.verifyingContractAddress
      },
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Order: [
          { name: 'maker', type: 'address' },
          { name: 'engine', type: 'address' },
          { name: 'actor', type: 'address' },
          { name: 'contractTermsHash', type: 'bytes32' },
          { name: 'makerCreditEnhancement', type: 'address' },
          { name: 'salt', type: 'uint256' }
        ]
      },
      primaryType: 'Order',
      message: {
        maker: orderData.makerAddress,
        engine: orderData.engineAddress,
        actor: orderData.actorAddress,
        contractTermsHash: contractTermsHash,
        makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
        salt: orderData.salt
      }
    };

    return typedData;
  }

  private _getFilledOrderDataAsTypedData (
    orderData: OrderData
  ): FilledOrderDataAsTypedData {
    if (!orderData.takerAddress) { 
      throw(new Error('EXECUTION_ERROR: takerAddress is not set!')); 
    }
    if (!orderData.takerCreditEnhancementAddress) { 
      throw(new Error('EXECUTION_ERROR: takerCreditEnhancementAddress is not set!')); 
    }

    const contractTermsHash = this.web3.utils.keccak256(this.web3.eth.abi.encodeParameter(
      ContractTermsABI, this._toTuple(orderData.terms)
    ));

    const typedData: FilledOrderDataAsTypedData = {
      domain: {
        name: 'ACTUS Protocol',
        version: '1',
        chainId: 0,
        verifyingContract: this.verifyingContractAddress
      },
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' }
        ],
        Order: [
          { name: 'maker', type: 'address' },
          { name: 'taker', type: 'address' },
          { name: 'engine', type: 'address' },
          { name: 'actor', type: 'address' },
          { name: 'contractTermsHash', type: 'bytes32' },
          { name: 'makerCreditEnhancement', type: 'address' },
          { name: 'takerCreditEnhancement', type: 'address' },
          { name: 'salt', type: 'uint256' }
        ]
      },
      primaryType: 'Order',
      message: {
        maker: orderData.makerAddress,
        taker: orderData.takerAddress,
        engine: orderData.engineAddress,
        actor: orderData.actorAddress,
        contractTermsHash: contractTermsHash,
        makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
        takerCreditEnhancement: orderData.takerCreditEnhancementAddress,
        salt: orderData.salt
      }
    };

    return typedData;
  }

  private async _signTypedData (typedData: TypedData): Promise<string> {
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

  private async _sendJsonRpcRequest (method: string, params: any[]): Promise<string> {
    // @ts-ignore
    return this.web3.currentProvider.send(method, params);
  }

  // @ts-ignore
  private _toTuple (obj) {
    if (!(obj instanceof Object)) {
      return [];
    }
    // @ts-ignore
    var output = [];
    var i = 0;
    Object.keys(obj).forEach((k) => {
      if (obj[k] instanceof Object) {
        // @ts-ignore
        output[i] = this._toTuple(obj[k]);
      } else if (obj[k] instanceof Array) {
        let j1 = 0;
        // @ts-ignore
        let temp1 = [];
        // @ts-ignore
        obj[k].forEach((ak) => {
          // @ts-ignore
          temp1[j1] = this._toTuple(obj[k]);
          j1++;
        });
        // @ts-ignore
        output[i] = temp1;
      } else {
        output[i] = obj[k];
      }
      i++;
    });
    // @ts-ignore
    return output;
  }
}

// @ts-ignore 
const ContractTermsABI = {
  "components": [
    {
      "name": "contractType",
      "type": "uint8"
    },
    {
      "name": "calendar",
      "type": "uint8"
    },
    {
      "name": "contractRole",
      "type": "uint8"
    },
    {
      "name": "creatorID",
      "type": "bytes32"
    },
    {
      "name": "counterpartyID",
      "type": "bytes32"
    },
    {
      "name": "dayCountConvention",
      "type": "uint8"
    },
    {
      "name": "businessDayConvention",
      "type": "uint8"
    },
    {
      "name": "endOfMonthConvention",
      "type": "uint8"
    },
    {
      "name": "currency",
      "type": "address"
    },
    {
      "name": "scalingEffect",
      "type": "uint8"
    },
    {
      "name": "penaltyType",
      "type": "uint8"
    },
    {
      "name": "feeBasis",
      "type": "uint8"
    },
    {
      "name": "contractDealDate",
      "type": "uint256"
    },
    {
      "name": "statusDate",
      "type": "uint256"
    },
    {
      "name": "initialExchangeDate",
      "type": "uint256"
    },
    {
      "name": "maturityDate",
      "type": "uint256"
    },
    {
      "name": "terminationDate",
      "type": "uint256"
    },
    {
      "name": "purchaseDate",
      "type": "uint256"
    },
    {
      "name": "capitalizationEndDate",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfInterestPayment",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfRateReset",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfScalingIndex",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfFee",
      "type": "uint256"
    },
    {
      "name": "cycleAnchorDateOfPrincipalRedemption",
      "type": "uint256"
    },
    {
      "name": "notionalPrincipal",
      "type": "int256"
    },
    {
      "name": "nominalInterestRate",
      "type": "int256"
    },
    {
      "name": "feeAccrued",
      "type": "int256"
    },
    {
      "name": "accruedInterest",
      "type": "int256"
    },
    {
      "name": "rateMultiplier",
      "type": "int256"
    },
    {
      "name": "rateSpread",
      "type": "int256"
    },
    {
      "name": "feeRate",
      "type": "int256"
    },
    {
      "name": "nextResetRate",
      "type": "int256"
    },
    {
      "name": "penaltyRate",
      "type": "int256"
    },
    {
      "name": "premiumDiscountAtIED",
      "type": "int256"
    },
    {
      "name": "priceAtPurchaseDate",
      "type": "int256"
    },
    {
      "name": "nextPrincipalRedemptionPayment",
      "type": "int256"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfInterestPayment",
      "type": "tuple"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfRateReset",
      "type": "tuple"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfScalingIndex",
      "type": "tuple"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfFee",
      "type": "tuple"
    },
    {
      "components": [
        {
          "name": "i",
          "type": "uint256"
        },
        {
          "name": "p",
          "type": "uint8"
        },
        {
          "name": "s",
          "type": "uint8"
        },
        {
          "name": "isSet",
          "type": "bool"
        }
      ],
      "name": "cycleOfPrincipalRedemption",
      "type": "tuple"
    },
    {
      "name": "lifeCap",
      "type": "int256"
    },
    {
      "name": "lifeFloor",
      "type": "int256"
    },
    {
      "name": "periodCap",
      "type": "int256"
    },
    {
      "name": "periodFloor",
      "type": "int256"
    }
  ],
  "name": "terms",
  "type": "tuple"
}
