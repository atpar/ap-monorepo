import * as web3Utils from 'web3-utils';
import web3EthAbi from 'web3-eth-abi';

import {
  Terms,
  CustomTerms,
  TemplateTerms,
  AssetOwnership,
  OrderData,
  OrderDataAsTypedData,
  EnhancementOrderData,
  EnhancementOrderDataAsTypedData
} from '../types';
import { ZERO_ADDRESS } from './Constants';


export function deriveTemplateId(templateTerms: TemplateTerms, templateSchedules: any): string {
  const templateTermsHash = web3Utils.keccak256(_encodeParameter(
    {  
      "components": [
        {
          "name": "calendar",
          "type": "uint8"
        },
        {
          "name": "contractRole",
          "type": "uint8"
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
          "name": "creditEventTypeCovered",
          "type": "uint8"
        },
        {
          "name": "currency",
          "type": "address"
        },
        {
          "name": "settlementCurrency",
          "type": "address"
        },
        {
          "name": "marketObjectCodeRateReset",
          "type": "bytes32"
        },
        {
          "name": "statusDateOffset",
          "type": "uint256"
        },
        {
          "name": "maturityDateOffset",
          "type": "uint256"
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
              "name": "isSet",
              "type": "bool"
            }
          ],
          "name": "gracePeriod",
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
              "name": "isSet",
              "type": "bool"
            }
          ],
          "name": "delinquencyPeriod",
          "type": "tuple"
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
    },
    templateTerms
  ));

  const templateSchedulesHash = web3Utils.keccak256(_encodeParameter(
    {
      "components": [
        {
          "name": "nonCyclicSchedule",
          "type": "bytes32[64]"
        },
        {
          "name": "cyclicIPSchedule",
          "type": "bytes32[64]"
        },
        {
          "name": "cyclicPRSchedule",
          "type": "bytes32[64]"
        },
        {
          "name": "cyclicRRSchedule",
          "type": "bytes32[64]"
        },
        {
          "name": "cyclicPYSchedule",
          "type": "bytes32[64]"
        },
        {
          "name": "cyclicSCSchedule",
          "type": "bytes32[64]"
        },
        {
          "name": "cyclicFPSchedule",
          "type": "bytes32[64]"
        }
      ],
      "name": "templateSchedules",
      "type": "tuple"
    },
    templateSchedules
  ));

  // @ts-ignore
  return web3Utils.keccak256(web3EthAbi.encodeParameters(
    ['bytes32', 'bytes32'],
    [templateTermsHash, templateSchedulesHash]
  ));
}


export function getOrderDataAsTypedData (
  orderData: OrderData,
  isFilled: boolean,
  verifyingContract: string
): OrderDataAsTypedData {
  const ownershipHash = getOwnershipHash((isFilled === true)
    ? orderData.ownership
    : { ...orderData.ownership, counterpartyObligor: ZERO_ADDRESS, counterpartyBeneficiary: ZERO_ADDRESS }
  );
  const customTermsHash = getCustomTermsHash(orderData.customTerms);
  const enhancementOrderHash_1 = getDraftEnhancementOrderHash(orderData.enhancementOrder_1);
  const enhancementOrderHash_2 = getDraftEnhancementOrderHash(orderData.enhancementOrder_2);

  const typedData: OrderDataAsTypedData = {
    domain: {
      name: 'ACTUS Protocol',
      version: '1',
      chainId: 0,
      verifyingContract
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Order: [
        { name: 'termsHash', type: 'bytes32' },
        { name: 'templateId', type: 'bytes32' },
        { name: 'customTermsHash', type: 'bytes32' },
        { name: 'expirationDate', type: 'uint256' },
        { name: 'ownershipHash', type: 'bytes32' },
        { name: 'engine', type: 'address' },
        { name: 'actor', type: 'address' },
        { name: 'enhancementOrderHash_1', type: 'bytes32' },
        { name: 'enhancementOrderHash_2', type: 'bytes32' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'Order',
    message: {
      termsHash: orderData.termsHash,
      templateId: orderData.templateId,
      customTermsHash: customTermsHash,
      expirationDate: orderData.expirationDate,
      ownershipHash: ownershipHash,
      engine: orderData.engine,
      actor: orderData.actor,
      enhancementOrderHash_1: enhancementOrderHash_1,
      enhancementOrderHash_2: enhancementOrderHash_2,
      salt: orderData.salt
    }
  };

  return typedData;
}

export function getEnhancementOrderDataAsTypedData (
  enhancementOrderData: EnhancementOrderData,
  isFilled: boolean,
  verifyingContract: string
): EnhancementOrderDataAsTypedData {
  const ownershipHash = getOwnershipHash((isFilled === true)
    ? enhancementOrderData.ownership
    : { ...enhancementOrderData.ownership, counterpartyObligor: ZERO_ADDRESS, counterpartyBeneficiary: ZERO_ADDRESS }
  );
  const customTermsHash = getCustomTermsHash(enhancementOrderData.customTerms);

  const typedData: EnhancementOrderDataAsTypedData = {
    domain: {
      name: 'ACTUS Protocol',
      version: '1',
      chainId: 0,
      verifyingContract
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      Order: [
        { name: 'termsHash', type: 'bytes32' },
        { name: 'templateId', type: 'bytes32' },
        { name: 'customTermsHash', type: 'bytes32' },
        { name: 'ownershipHash', type: 'bytes32' },
        { name: 'engine', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'Order',
    message: {
      termsHash: enhancementOrderData.termsHash,
      templateId: enhancementOrderData.templateId,
      customTermsHash: customTermsHash,
      ownershipHash: ownershipHash,
      engine: enhancementOrderData.engine,
      salt: enhancementOrderData.salt
    }
  };

  return typedData;
}

export function getOwnershipHash (ownership: AssetOwnership): string {
  // @ts-ignore
  return web3Utils.keccak256(web3EthAbi.encodeParameters(
    ['address', 'address', 'address', 'address'],
    [
      ownership.creatorObligor,
      ownership.creatorBeneficiary,
      ownership.counterpartyObligor,
      ownership.counterpartyBeneficiary
    ]
  ))
}

export function getDraftEnhancementOrderHash (enhancementOrder: EnhancementOrderData): string {
  const DRAFT_ENHANCEMENT_ORDER_TYPEHASH = web3Utils.keccak256(
    "EnhancementOrder(bytes32 termsHash,bytes32 templateId,bytes32 customTermsHash,address engine,uint256 salt)"
  );

  const customTermsHash = getCustomTermsHash(enhancementOrder.customTerms);
  // @ts-ignore
  return web3Utils.keccak256(web3EthAbi.encodeParameters(
    [
      'bytes32', 'bytes32', 'bytes32', 'uint256', 'address', 'uint256'
    ],
    [
      DRAFT_ENHANCEMENT_ORDER_TYPEHASH,
      enhancementOrder.termsHash,
      enhancementOrder.templateId,
      customTermsHash,
      enhancementOrder.engine,
      enhancementOrder.salt
    ]
  ));
};

export function getCustomTermsHash (customTerms: CustomTerms): string {
  return web3Utils.keccak256(_encodeParameter(
    {
      "components": [
        {
          "name": "anchorDate",
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
          "name": "premiumDiscountAtIED",
          "type": "int256"
        },
        {
          "name": "rateSpread",
          "type": "int256"
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
          "name": "coverageOfCreditEnhancement",
          "type": "int256"
        },
        {
          "components": [
            {
              "name": "object",
              "type": "bytes32"
            },
            {
              "name": "contractReferenceType",
              "type": "uint8"
            },
            {
              "name": "contractReferenceRole",
              "type": "uint8"
            }
          ],
          "name": "contractReference_1",
          "type": "tuple"
        },
        {
          "components": [
            {
              "name": "object",
              "type": "bytes32"
            },
            {
              "name": "contractReferenceType",
              "type": "uint8"
            },
            {
              "name": "contractReferenceRole",
              "type": "uint8"
            }
          ],
          "name": "contractReference_2",
          "type": "tuple"
        }
      ],
      "name": "customTerms",
      "type": "tuple"
    },
    customTerms
  ));
}

export function getTermsHash (terms: Terms): string {
  return web3Utils.keccak256(_encodeParameter(
    {
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
          "name": "creditEventTypeCovered",
          "type": "uint8"
        },
        {
          "components": [
            {
              "name": "object",
              "type": "bytes32"
            },
            {
              "name": "contractReferenceType",
              "type": "uint8"
            },
            {
              "name": "contractReferenceRole",
              "type": "uint8"
            }
          ],
          "name": "contractReference_1",
          "type": "tuple"
        },
        {
          "components": [
            {
              "name": "object",
              "type": "bytes32"
            },
            {
              "name": "contractReferenceType",
              "type": "uint8"
            },
            {
              "name": "contractReferenceRole",
              "type": "uint8"
            }
          ],
          "name": "contractReference_2",
          "type": "tuple"
        },
        {
          "name": "currency",
          "type": "address"
        },
        {
          "name": "settlementCurrency",
          "type": "address"
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
          "name": "marketObjectCodeRateReset",
          "type": "bytes32"
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
          "name": "coverageOfCreditEnhancement",
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
              "name": "isSet",
              "type": "bool"
            }
          ],
          "name": "gracePeriod",
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
              "name": "isSet",
              "type": "bool"
            }
          ],
          "name": "delinquencyPeriod",
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
    },
    terms
  ));
}

function _encodeParameter (paramType: any, paramValue: any): any {
  // @ts-ignore
  return web3EthAbi.encodeParameter(paramType, _toTuple(paramType, paramValue));
}

function _toTuple(paramType: any, paramValue: any): any {
  if (!paramType || paramValue == null || !paramType.name) {
    throw new Error('Provided paramValues does not match paramType.');
  }

  const tuple = [];

  if (paramType.type === 'tuple') {
    if (!paramType.components) {
      throw new Error('Malformed paramType. Expected key components to exist on type tuple.');
    }
    for (const compParamType of paramType.components) {
      if (!compParamType.name) { throw new Error('Malformed paramValue. Expected key name to  exist.'); }
      tuple.push(_toTuple(compParamType, paramValue[compParamType.name]));
    }
  } else if (paramType.type.includes('[]')) {
    for (const value of paramValue) {
      tuple.push(value);
    }
  } else {
    return paramValue;
  }

  return tuple;
}
