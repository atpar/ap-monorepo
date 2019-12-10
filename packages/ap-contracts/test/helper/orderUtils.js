const _toTuple = (obj) => {
  if (!(obj instanceof Object)) { return []; }
  var output = [];
  var i = 0;
  Object.keys(obj).forEach((k) => {
    if (obj[k] instanceof Object) {
      output[i] = _toTuple(obj[k]);
    } else if (obj[k] instanceof Array) {
      let j1 = 0;
      let temp1 = [];
      obj[k].forEach((ak) => {
        temp1[j1] = _toTuple(obj[k]);
        j1++;
      });
      output[i] = temp1;
    } else {
      output[i] = obj[k];
    }
    i++;
  });
  return output;
};

function deriveProductId (productTerms, productSchedules) {
  const productTermsHash = web3.utils.keccak256(web3.eth.abi.encodeParameter(
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
    _toTuple(productTerms)
  ));

  const productSchedulesHash = web3.utils.keccak256(web3.eth.abi.encodeParameter(
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
      "name": "productSchedules",
      "type": "tuple"
    },
    _toTuple(productSchedules)
  ));

  return web3.utils.keccak256(web3.eth.abi.encodeParameters(
    ['bytes32', 'bytes32'],
    [productTermsHash, productSchedulesHash]
  ));
}

function getCustomTermsHash (customTerms) {
  return web3.utils.keccak256(web3.eth.abi.encodeParameter(
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
    _toTuple(customTerms)
  ));
}

function getTermsHash (terms) {
  return web3.utils.keccak256(web3.eth.abi.encodeParameter(
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
    _toTuple(terms)
  ));
}

function getOwnershipHash (ownership) {
  return web3.utils.keccak256(web3.eth.abi.encodeParameters(
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
  const DRAFT_ENHANCEMENT_ORDER_TYPEHASH = web3.utils.keccak256(
    "EnhancementOrder(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,address engine,uint256 salt)"
  );

  const customTermsHash = getCustomTermsHash(enhancementOrder.customTerms);

  return web3.utils.keccak256(web3.eth.abi.encodeParameters(
    [
      'bytes32', 'bytes32', 'bytes32', 'uint256', 'address', 'uint256'
    ],
    [
      DRAFT_ENHANCEMENT_ORDER_TYPEHASH,
      enhancementOrder.termsHash,
      enhancementOrder.productId,
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
        { name: 'productId', type: 'bytes32' },
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
      productId: orderData.productId,
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
        { name: 'productId', type: 'bytes32' },
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
      productId: orderData.productId,
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
        { name: 'productId', type: 'bytes32' },
        { name: 'customTermsHash', type: 'bytes32' },
        { name: 'ownershipHash', type: 'bytes32' },
        { name: 'engine', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'EnhancementOrder',
    message: {
      termsHash: enhancementOrderData.termsHash,
      productId: enhancementOrderData.productId,
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
        { name: 'productId', type: 'bytes32' },
        { name: 'customTermsHash', type: 'bytes32' },
        { name: 'ownershipHash', type: 'bytes32' },
        { name: 'engine', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'EnhancementOrder',
    message: {
      termsHash: enhancementOrderData.termsHash,
      productId: enhancementOrderData.productId,
      customTermsHash: customTermsHash,
      ownershipHash: ownershipHash,
      engine: enhancementOrderData.engine,
      salt: enhancementOrderData.salt
    }
  };

  return typedData;
};

function getAssetIdFromOrderData (orderData) {
  return web3.utils.keccak256(
    web3.eth.abi.encodeParameters(
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

function getDefaultOrderData(terms, productId, customTerms, ownership, engine, actor) {
  return { 
    termsHash: getTermsHash(terms),
    productId: web3.utils.toHex(productId),
    customTerms: customTerms,
    expirationDate: '10000000000',
    ownership: ownership,
    engine: engine,
    actor: actor,
    enhancementOrder_1: {
      termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      productId: '0x0000000000000000000000000000000000000000000000000000000000000000',
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
      productId: '0x0000000000000000000000000000000000000000000000000000000000000000',
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
  underlyingTerms,  underlyingProductId, underlyingCustomTerms, underlyingOwnership, underlyingEngine, underlyingActor,
  enhancementTerms, enhancementProductId, enhancementCustomTerms, enhancementOwnership, enhancementEngine
) {
  return { 
    termsHash: getTermsHash(underlyingTerms),
    productId: web3.utils.toHex(underlyingProductId),
    customTerms: underlyingCustomTerms,
    expirationDate: '10000000000',
    ownership: underlyingOwnership,
    engine: underlyingEngine,
    actor: underlyingActor,
    enhancementOrder_1: {
      termsHash: getTermsHash(enhancementTerms),
      productId: web3.utils.toHex(enhancementProductId),
      customTerms: enhancementCustomTerms,
      ownership: enhancementOwnership,
      engine: enhancementEngine,
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000)
    },
    enhancementOrder_2: {
      termsHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
      productId: '0x0000000000000000000000000000000000000000000000000000000000000000',
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
  underlyingTerms,  underlyingProductId, underlyingCustomTerms, underlyingOwnership, underlyingEngine, underlyingActor,
  enhancementTerms_1, enhancementProductId_1, enhancementCustomTerms_1, enhancementOwnership_1, enhancementEngine_1,
  enhancementTerms_2, enhancementProductId_2, enhancementCustomTerms_2, enhancementOwnership_2, enhancementEngine_2
) {
  return { 
    termsHash: getTermsHash(underlyingTerms),
    productId: web3.utils.toHex(underlyingProductId),
    customTerms: underlyingCustomTerms,
    expirationDate: '10000000000',
    ownership: underlyingOwnership,
    engine: underlyingEngine,
    actor: underlyingActor,
    enhancementOrder_1: {
      termsHash: getTermsHash(enhancementTerms_1),
      productId: web3.utils.toHex(enhancementProductId_1),
      customTerms: enhancementCustomTerms_1,
      ownership: enhancementOwnership_1,
      engine: enhancementEngine_1,
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000)
    },
    enhancementOrder_2: {
      termsHash: getTermsHash(enhancementTerms_2),
      productId: web3.utils.toHex(enhancementProductId_2),
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
  deriveProductId,
  getAssetIdFromOrderData,
  getUnfilledOrderDataAsTypedData,
  getFilledOrderDataAsTypedData,
  getUnfilledEnhancementOrderDataAsTypedData,
  getFilledEnhancementOrderDataAsTypedData,
  getTermsHash,
  getDefaultOrderData,
  getDefaultOrderDataWithEnhancement,
  getDefaultOrderDataWithEnhancements,
  sign
}
