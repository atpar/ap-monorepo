import Web3 from 'web3';
import sigUtil from 'eth-sig-util';

import AssetIssuerArtifact from '@atpar/ap-contracts/artifacts/AssetIssuer.min.json';

import { 
  TypedData,
  ContractUpdate, 
  SignedContractUpdate, 
  ContractUpdateAsTypedData, 
  OrderData, 
  FilledOrderDataAsTypedData,
  UnfilledOrderDataAsTypedData 
} from '../types';


export class Signer {
  
  private web3: Web3;
  public account: string;

  public constructor (web3: Web3, account: string) {
    this.web3 = web3;
    this.account = account;
  }

  /**
   * signs a given order with the provided account and returns the signature
   * EIP712 compliant (tries both eth_signTypedData_v3 and eth_signTypedData)
   * @param {OrderData} orderData contract update to sign
   * @returns {string}
   */
  public async signOrderAsMaker (orderData: OrderData): Promise<string> {
    return this._signTypedData(await this._getUnfilledOrderDataAsTypedData(orderData));
  }

  /**
   * signs a given order with the provided account and returns the signature
   * EIP712 compliant (tries both eth_signTypedData_v3 and eth_signTypedData)
   * @param {OrderData} orderData contract update to sign
   * @returns {string}
   */
  public async signOrderAsTaker (orderData: OrderData): Promise<string> {
    return this._signTypedData(await this._getFilledOrderDataAsTypedData(orderData));
  }

  /**
   * signs a given contract update with the provided account and returns the signature
   * EIP712 compliant (tries both eth_signTypedData_v3 and eth_signTypedData)
   * @param {ContractUpdate} contractUpdate contract update to sign
   * @returns {string}
   */
  public async signContractUpdate (contractUpdate: ContractUpdate): Promise<string> {    
    return this._signTypedData(await this._getContractUpdateAsTypedData(contractUpdate));
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
    const recordCreatorObligor = signedContractUpdate.contractUpdate.recordCreatorObligor;
    const counterpartyObligor = signedContractUpdate.contractUpdate.counterpartyObligor;

    if (!signedContractUpdate.recordCreatorObligorSignature && !signedContractUpdate.counterpartyObligorSignature) { return false }
    if (signedContractUpdate.recordCreatorObligorSignature) {
      if (!this._validateSignature(typedData, recordCreatorObligor, signedContractUpdate.recordCreatorObligorSignature)) {
        return false;
      }
    }
    if (signedContractUpdate.counterpartyObligorSignature) {
      if (!this._validateSignature(typedData, counterpartyObligor, signedContractUpdate.counterpartyObligorSignature)) {
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

  private async _getUnfilledOrderDataAsTypedData (
    orderData: OrderData
  ): Promise<UnfilledOrderDataAsTypedData> {
    const chainId = await this.web3.eth.net.getId();
    // @ts-ignore
    const verifyingContractAddress = AssetIssuerArtifact.networks[chainId].address;

    const contractTermsHash = this.web3.utils.keccak256(this.web3.eth.abi.encodeParameter(
      ContractTermsABI, this._toTuple(orderData.terms)
    ));

    const typedData: UnfilledOrderDataAsTypedData = {
      domain: {
        name: 'ACTUS Protocol',
        version: '1',
        chainId: 0,
        verifyingContract: verifyingContractAddress
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
          { name: 'actor', type: 'address' },
          { name: 'contractTermsHash', type: 'bytes32' },
          { name: 'makerCreditEnhancement', type: 'address' },
          { name: 'salt', type: 'uint256' }
        ]
      },
      primaryType: 'Order',
      message: {
        maker: orderData.makerAddress,
        actor: orderData.actorAddress,
        contractTermsHash: contractTermsHash,
        makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
        salt: orderData.salt
      }
    };

    return typedData;
  }

  private async _getFilledOrderDataAsTypedData (
    orderData: OrderData
  ): Promise<FilledOrderDataAsTypedData> {
    if (!orderData.takerAddress) { 
      throw(new Error('EXECUTION_ERROR: takerAddress is not set!')); 
    }
    if (!orderData.takerCreditEnhancementAddress) { 
      throw(new Error('EXECUTION_ERROR: takerCreditEnhancementAddress is not set!')); 
    }

    const chainId = await this.web3.eth.net.getId();
    // @ts-ignore
    const verifyingContractAddress = AssetIssuerArtifact.networks[chainId].address;

    const contractTermsHash = this.web3.utils.keccak256(this.web3.eth.abi.encodeParameter(
      ContractTermsABI, this._toTuple(orderData.terms)
    ));

    const typedData: FilledOrderDataAsTypedData = {
      domain: {
        name: 'ACTUS Protocol',
        version: '1',
        chainId: 0,
        verifyingContract: verifyingContractAddress
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
        actor: orderData.actorAddress,
        contractTermsHash: contractTermsHash,
        makerCreditEnhancement: orderData.makerCreditEnhancementAddress,
        takerCreditEnhancement: orderData.takerCreditEnhancementAddress,
        salt: orderData.salt
      }
    };

    return typedData;
  }

  private async _getContractUpdateAsTypedData (
    contractUpdate: ContractUpdate
  ): Promise<ContractUpdateAsTypedData> {
    // const chainId = await this.web3.eth.net.getId();
    const typedData: ContractUpdateAsTypedData = {
      domain: {
        name: 'actus-protocol',
        version: '1',
        chainId: 0,
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
          { name: 'assetId', type: 'string' },
          { name: 'recordCreatorObligor', type: 'address' },
          { name: 'counterpartyObligor', type: 'address' },
          { name: 'contractAddress', type: 'address' },
          { name: 'contractTermsHash', type: 'string' }, // see: for version > 2.1.1 of eth-sig-util: https://github.com/MetaMask/eth-sig-util/commit/0fbac013cf1da2f7bf7a7383fa18535914d279a9
          { name: 'contractStateHash', type: 'string' },
          { name: 'contractUpdateNonce', type: 'uint256' }
        ]
      },
      primaryType: 'ContractUpdate',
      message: {
        assetId: contractUpdate.assetId,
        recordCreatorObligor: contractUpdate.recordCreatorObligor,
        counterpartyObligor: contractUpdate.counterpartyObligor,
        contractAddress: contractUpdate.contractAddress,
        contractTermsHash: this.web3.utils.keccak256(JSON.stringify(contractUpdate.contractTerms)),
        contractStateHash: this.web3.utils.keccak256(JSON.stringify(contractUpdate.contractState)),
        contractUpdateNonce: contractUpdate.contractUpdateNonce
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
      "name": "legalEntityIdRecordCreator",
      "type": "bytes32"
    },
    {
      "name": "legalEntityIdCounterparty",
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
