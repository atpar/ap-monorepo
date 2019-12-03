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
        { name: 'maker', type: 'address' },
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
      maker: orderData.maker,
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
        { name: 'maker', type: 'address' },
        { name: 'taker', type: 'address' },
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
      maker: orderData.maker,
      taker: orderData.taker,
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
        { name: 'maker', type: 'address' },
        { name: 'engine', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'EnhancementOrder',
    message: {
      termsHash: enhancementOrderData.termsHash,
      productId: enhancementOrderData.productId,
      customTermsHash: customTermsHash,
      maker: enhancementOrderData.maker,
      engine: enhancementOrderData.engine,
      salt: enhancementOrderData.salt
    }
  };

  return typedData;
}

function getFilledEnhancementOrderDataAsTypedData (enhancementOrderData, verifyingContractAddress) {
  const verifyingContract = verifyingContractAddress;

  const customTermsHash = getCustomTermsHash(enhancementOrderData.customTerms);

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
        { name: 'maker', type: 'address' },
        { name: 'taker', type: 'address' },
        { name: 'engine', type: 'address' },
        { name: 'salt', type: 'uint256' }
      ]
    },
    primaryType: 'EnhancementOrder',
    message: {
      termsHash: enhancementOrderData.termsHash,
      productId: enhancementOrderData.productId,
      customTermsHash: customTermsHash,
      maker: enhancementOrderData.maker,
      taker: enhancementOrderData.taker,
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
      [orderData.makerSignature, orderData.takerSignature]
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

module.exports = {
  getAssetIdFromOrderData,
  getUnfilledOrderDataAsTypedData,
  getFilledOrderDataAsTypedData,
  getUnfilledEnhancementOrderDataAsTypedData,
  getFilledEnhancementOrderDataAsTypedData,
  sign
}
