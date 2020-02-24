const Web3Utils = require('web3-utils');
const Web3EthAbi = require('web3-eth-abi');


function _encodeParameter (paramType, paramValue) {
  return Web3EthAbi.encodeParameter(paramType, _toTuple(paramType, paramValue));
}

function _toTuple(paramType, paramValue) {
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

function deriveTemplateId (templateTerms, templateSchedules) {
  const templateTermsHash = Web3Utils.keccak256(_encodeParameter(
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
          "name": "periodCap",
          "type": "int256"
        },
        {
          "name": "periodFloor",
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
        }
      ],
      "name": "terms",
      "type": "tuple"
    },
    templateTerms
  ));

  const templateSchedulesHash = Web3Utils.keccak256(Web3EthAbi.encodeParameter(
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
    _toTuple(templateSchedules)
  ));

  return Web3Utils.keccak256(Web3EthAbi.encodeParameters(
    ['bytes32', 'bytes32'],
    [templateTermsHash, templateSchedulesHash]
  ));
}

function getCustomTermsHash (customTerms) {
  // console.log(customTerms);
  return Web3Utils.keccak256(_encodeParameter(
    {
      "components": [
        {
          "name": "anchorDate",
          "type": "uint256"
        },
        {
          "name": "overwrittenAttributesMap",
          "type": "uint256"
        },
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
              "name": "statusDate",
              "type": "uint256"
            },
            {
              "name": "maturityDate",
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
          "name": "overwrittenTerms",
          "type": "tuple"
        }
      ],
      "name": "customTerms",
      "type": "tuple"
    },
    customTerms
  ));
}

function getTermsHash (terms) {
  return Web3Utils.keccak256(_encodeParameter(
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
      "name": "terms",
      "type": "tuple"
    },
    terms
  ));
}

function getOwnershipHash (ownership) {
  return Web3Utils.keccak256(Web3EthAbi.encodeParameters(
    ['address', 'address', 'address', 'address'],
    [
      ownership.creatorObligor,
      ownership.creatorBeneficiary,
      ownership.counterpartyObligor,
      ownership.counterpartyBeneficiary
    ]
  ))
}

function getDraftEnhancementOrderHash (enhancementOrder) {
  const DRAFT_ENHANCEMENT_ORDER_TYPEHASH = Web3Utils.keccak256(
    "EnhancementOrder(bytes32 termsHash,bytes32 templateId,bytes32 customTermsHash,address engine,uint256 salt)"
  );

  const customTermsHash = getCustomTermsHash(enhancementOrder.customTerms);

  return Web3Utils.keccak256(Web3EthAbi.encodeParameters(
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

function getUnfilledOrderDataAsTypedData (orderData, verifyingContractAddress) {
  const enhancementOrderHash_1 = getDraftEnhancementOrderHash(orderData.enhancementOrder_1);
  const enhancementOrderHash_2 = getDraftEnhancementOrderHash(orderData.enhancementOrder_2);

  const customTermsHash = getCustomTermsHash(orderData.customTerms);
  const ownershipHash = getOwnershipHash(
    {
      creatorObligor: orderData.ownership.creatorObligor,
      creatorBeneficiary: orderData.ownership.creatorBeneficiary,
      counterpartyObligor: '0x0000000000000000000000000000000000000000',
      counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
    }
  );

  const typedData = {
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
};

function getFilledOrderDataAsTypedData (orderData, verifyingContractAddress) {
  const verifyingContract = verifyingContractAddress;

  const enhancementOrderHash_1 = getDraftEnhancementOrderHash(orderData.enhancementOrder_1);
  const enhancementOrderHash_2 = getDraftEnhancementOrderHash(orderData.enhancementOrder_2);

  const customTermsHash = getCustomTermsHash(orderData.customTerms);
  const ownershipHash = getOwnershipHash(orderData.ownership);

  const typedData = {
    domain: {
      name: 'ACTUS Protocol',
      version: '1',
      chainId: 0,
      verifyingContract: verifyingContract
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
};

function getUnfilledEnhancementOrderDataAsTypedData (enhancementOrderData, verifyingContractAddress) {
  const verifyingContract = verifyingContractAddress;

  const customTermsHash = getCustomTermsHash(enhancementOrderData.customTerms);
  const ownershipHash = getOwnershipHash(
    {
      creatorObligor: enhancementOrderData.ownership.creatorObligor,
      creatorBeneficiary: enhancementOrderData.ownership.creatorBeneficiary,
      counterpartyObligor: '0x0000000000000000000000000000000000000000',
      counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
    }
  );

  const typedData = {
    domain: {
      name: 'ACTUS Protocol',
      version: '1',
      chainId: 0,
      verifyingContract: verifyingContract
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      EnhancementOrder: [
        { name: 'termsHash', type: 'bytes32' },
        { name: 'templateId', type: 'bytes32' },
        { name: 'customTermsHash', type: 'bytes32' },
        { name: 'ownershipHash', type: 'bytes32' },
        { name: 'engine', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'EnhancementOrder',
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

function getFilledEnhancementOrderDataAsTypedData (enhancementOrderData, verifyingContractAddress) {
  const verifyingContract = verifyingContractAddress;

  const customTermsHash = getCustomTermsHash(enhancementOrderData.customTerms);
  const ownershipHash = getOwnershipHash(enhancementOrderData.ownership);

  const typedData = {
    domain: {
      name: 'ACTUS Protocol',
      version: '1',
      chainId: 0,
      verifyingContract: verifyingContract
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' }
      ],
      EnhancementOrder: [
        { name: 'termsHash', type: 'bytes32' },
        { name: 'templateId', type: 'bytes32' },
        { name: 'customTermsHash', type: 'bytes32' },
        { name: 'ownershipHash', type: 'bytes32' },
        { name: 'engine', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'EnhancementOrder',
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
};

function getAssetIdFromOrderData (orderData) {
  return Web3Utils.keccak256(
    Web3EthAbi.encodeParameters(
      ['bytes', 'bytes'],
      [orderData.creatorSignature, orderData.counterpartySignature]
    )
  );
};

function sign(typedData, account) {
  return new Promise((resolve, reject) => {
    web3.currentProvider.send({
      method: 'eth_signTypedData',
      params: [account, typedData],
      from: account,
      id: new Date().getSeconds()
    }, (error, result) => {
      if (error) { return reject(error) }
      resolve(result.result)
    });
  });
};

function getDefaultDraftData(terms, templateId, customTerms, ownership, engine, actor) {
  return {
    termsHash: getTermsHash(terms),
    templateId: Web3Utils.toHex(templateId),
    customTerms: customTerms,
    expirationDate: '10000000000',
    ownership: ownership,
    engine: engine,
    actor: actor
  }
}

function getDefaultOrderData(terms, templateId, customTerms, ownership, engine, actor) {
  return { 
    termsHash: getTermsHash(terms),
    templateId: Web3Utils.toHex(templateId),
    customTerms: customTerms,
    expirationDate: '10000000000',
    ownership: ownership,
    engine: engine,
    actor: actor,
    enhancementOrder_1: {
      termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      templateId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      customTerms: customTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
      ownership: {
        creatorObligor: '0x0000000000000000000000000000000000000000',
        creatorBeneficiary: '0x0000000000000000000000000000000000000000',
        counterpartyObligor: '0x0000000000000000000000000000000000000000',
        counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
      },
      engine: '0x0000000000000000000000000000000000000000',
      creatorSignature: '0x0',
      counterpartySignature: '0x0',
      salt: 0
    },
    enhancementOrder_2: {
      termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      templateId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      customTerms: customTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
      ownership: {
        creatorObligor: '0x0000000000000000000000000000000000000000',
        creatorBeneficiary: '0x0000000000000000000000000000000000000000',
        counterpartyObligor: '0x0000000000000000000000000000000000000000',
        counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
      },
      engine: '0x0000000000000000000000000000000000000000',
      creatorSignature: '0x0',
      counterpartySignature: '0x0',
      salt: 0
    },
    creatorSignature: null,
    counterpartySignature: null,
    salt: Math.floor(Math.random() * 1000000)
  };
}

function getDefaultOrderDataWithEnhancement(
  underlyingTerms,  underlyingTemplateId, underlyingCustomTerms, underlyingOwnership, underlyingEngine, underlyingActor,
  enhancementTerms, enhancementTemplateId, enhancementCustomTerms, enhancementOwnership, enhancementEngine
) {
  return { 
    termsHash: getTermsHash(underlyingTerms),
    templateId: Web3Utils.toHex(underlyingTemplateId),
    customTerms: underlyingCustomTerms,
    expirationDate: '10000000000',
    ownership: underlyingOwnership,
    engine: underlyingEngine,
    actor: underlyingActor,
    enhancementOrder_1: {
      termsHash: getTermsHash(enhancementTerms),
      templateId: Web3Utils.toHex(enhancementTemplateId),
      customTerms: enhancementCustomTerms,
      ownership: enhancementOwnership,
      engine: enhancementEngine,
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000)
    },
    enhancementOrder_2: {
      termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      templateId: '0x0000000000000000000000000000000000000000000000000000000000000000',
      customTerms: underlyingCustomTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
      ownership: {
        creatorObligor: '0x0000000000000000000000000000000000000000',
        creatorBeneficiary: '0x0000000000000000000000000000000000000000',
        counterpartyObligor: '0x0000000000000000000000000000000000000000',
        counterpartyBeneficiary: '0x0000000000000000000000000000000000000000'
      },
      engine: '0x0000000000000000000000000000000000000000',
      creatorSignature: '0x0',
      counterpartySignature: '0x0',
      salt: 0
    },
    creatorSignature: null,
    counterpartySignature: null,
    salt: Math.floor(Math.random() * 1000000)
  };
}

function getDefaultOrderDataWithEnhancements(
  underlyingTerms,  underlyingTemplateId, underlyingCustomTerms, underlyingOwnership, underlyingEngine, underlyingActor,
  enhancementTerms_1, enhancementTemplateId_1, enhancementCustomTerms_1, enhancementOwnership_1, enhancementEngine_1,
  enhancementTerms_2, enhancementTemplateId_2, enhancementCustomTerms_2, enhancementOwnership_2, enhancementEngine_2
) {
  return { 
    termsHash: getTermsHash(underlyingTerms),
    templateId: Web3Utils.toHex(underlyingTemplateId),
    customTerms: underlyingCustomTerms,
    expirationDate: '10000000000',
    ownership: underlyingOwnership,
    engine: underlyingEngine,
    actor: underlyingActor,
    enhancementOrder_1: {
      termsHash: getTermsHash(enhancementTerms_1),
      templateId: Web3Utils.toHex(enhancementTemplateId_1),
      customTerms: enhancementCustomTerms_1,
      ownership: enhancementOwnership_1,
      engine: enhancementEngine_1,
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000)
    },
    enhancementOrder_2: {
      termsHash: getTermsHash(enhancementTerms_2),
      templateId: Web3Utils.toHex(enhancementTemplateId_2),
      customTerms: enhancementCustomTerms_2,
      ownership: enhancementOwnership_2,
      engine: enhancementEngine_2,
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000)
    },
    creatorSignature: null,
    counterpartySignature: null,
    salt: Math.floor(Math.random() * 1000000)
  };
}

module.exports = {
  deriveTemplateId,
  getAssetIdFromOrderData,
  getUnfilledOrderDataAsTypedData,
  getFilledOrderDataAsTypedData,
  getUnfilledEnhancementOrderDataAsTypedData,
  getFilledEnhancementOrderDataAsTypedData,
  getTermsHash,
  getDefaultDraftData,
  getDefaultOrderData,
  getDefaultOrderDataWithEnhancement,
  getDefaultOrderDataWithEnhancements,
  sign
}
