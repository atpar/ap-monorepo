const Web3Utils = require('web3-utils');
const Web3EthAbi = require('web3-eth-abi');

const TemplateTermsABI = require('./abis/TemplateTermsABI');
const CustomTermsABI = require('./abis/CustomTermsABI');
const TermsABI = require('./abis/TermsABI');

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const ZERO_BYTES = '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';


function encodeParameter (paramType, paramValue) {
  return Web3EthAbi.encodeParameter(paramType, toTuple(paramType, paramValue));
}

function toTuple(paramType, paramValue) {
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
      tuple.push(toTuple(compParamType, paramValue[compParamType.name]));
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

function deriveTemplateId (templateTerms, templateSchedule) {
  const templateTermsHash = Web3Utils.keccak256(encodeParameter(
    TemplateTermsABI,
    templateTerms
  ));

  const templateScheduleHash = Web3Utils.keccak256(Web3EthAbi.encodeParameters(
    ['bytes32[]'],
    [templateSchedule]
  ));

  return Web3Utils.keccak256(Web3EthAbi.encodeParameters(
    ['bytes32', 'bytes32'],
    [templateTermsHash, templateScheduleHash]
  ));
}

function getCustomTermsHash (customTerms) {
  return Web3Utils.keccak256(encodeParameter(
    CustomTermsABI,
    customTerms
  ));
}

function getTermsHash (terms) {
  return Web3Utils.keccak256(encodeParameter(
    TermsABI,
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
    "EnhancementOrder(bytes32 termsHash,bytes32 templateId,bytes32 customTermsHash,address engine,address admin,uint256 salt)"
  );

  const customTermsHash = getCustomTermsHash(enhancementOrder.customTerms);

  return Web3Utils.keccak256(Web3EthAbi.encodeParameters(
    [
      'bytes32', 'bytes32', 'bytes32', 'uint256', 'address', 'address', 'uint256'
    ],
    [
      DRAFT_ENHANCEMENT_ORDER_TYPEHASH,
      enhancementOrder.termsHash,
      enhancementOrder.templateId,
      customTermsHash,
      enhancementOrder.engine,
      enhancementOrder.admin,
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
      counterpartyObligor: ZERO_ADDRESS,
      counterpartyBeneficiary: ZERO_ADDRESS
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
        { name: 'admin', type: 'address' },
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
      admin: orderData.admin,
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
        { name: 'admin', type: 'address' },
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
      admin: orderData.admin,
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
      counterpartyObligor: ZERO_ADDRESS,
      counterpartyBeneficiary: ZERO_ADDRESS
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
        { name: 'admin', type: 'address' },
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
      admin: enhancementOrderData.admin,
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
        { name: 'admin', type: 'address' },
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
      admin: enhancementOrderData.admin,
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

function getDefaultDraftData(terms, templateId, customTerms, ownership, engine, admin) {
  return {
    termsHash: getTermsHash(terms),
    templateId: Web3Utils.toHex(templateId),
    customTerms: customTerms,
    ownership: ownership,
    engine: engine,
    admin: admin
  }
}

function getDefaultOrderData(terms, templateId, customTerms, ownership, engine, admin) {
  return { 
    termsHash: getTermsHash(terms),
    templateId: Web3Utils.toHex(templateId),
    customTerms: customTerms,
    expirationDate: '10000000000',
    ownership: ownership,
    engine: engine,
    admin: admin,
    enhancementOrder_1: {
      termsHash: ZERO_BYTES32,
      templateId: ZERO_BYTES32,
      customTerms: customTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
      ownership: {
        creatorObligor: ZERO_ADDRESS,
        creatorBeneficiary: ZERO_ADDRESS,
        counterpartyObligor: ZERO_ADDRESS,
        counterpartyBeneficiary: ZERO_ADDRESS
      },
      engine: ZERO_ADDRESS,
      admin: ZERO_ADDRESS,
      creatorSignature: ZERO_BYTES,
      counterpartySignature: ZERO_BYTES,
      salt: 0
    },
    enhancementOrder_2: {
      termsHash: ZERO_BYTES32,
      templateId: ZERO_BYTES32,
      customTerms: customTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
      ownership: {
        creatorObligor: ZERO_ADDRESS,
        creatorBeneficiary: ZERO_ADDRESS,
        counterpartyObligor: ZERO_ADDRESS,
        counterpartyBeneficiary: ZERO_ADDRESS
      },
      engine: ZERO_ADDRESS,
      admin: ZERO_ADDRESS,
      creatorSignature: ZERO_BYTES,
      counterpartySignature: ZERO_BYTES,
      salt: 0
    },
    creatorSignature: null,
    counterpartySignature: null,
    salt: Math.floor(Math.random() * 1000000)
  };
}

function getDefaultOrderDataWithEnhancement(
  underlyingTerms,  underlyingTemplateId, underlyingCustomTerms, underlyingOwnership, underlyingEngine, underlyingAdmin,
  enhancementTerms, enhancementTemplateId, enhancementCustomTerms, enhancementOwnership, enhancementEngine, enhancementAdmin
) {
  return { 
    termsHash: getTermsHash(underlyingTerms),
    templateId: Web3Utils.toHex(underlyingTemplateId),
    customTerms: underlyingCustomTerms,
    expirationDate: '10000000000',
    ownership: underlyingOwnership,
    engine: underlyingEngine,
    admin: underlyingAdmin,
    enhancementOrder_1: {
      termsHash: getTermsHash(enhancementTerms),
      templateId: Web3Utils.toHex(enhancementTemplateId),
      customTerms: enhancementCustomTerms,
      ownership: enhancementOwnership,
      engine: enhancementEngine,
      admin: enhancementAdmin,
      creatorSignature: null,
      counterpartySignature: null,
      salt: Math.floor(Math.random() * 1000000)
    },
    enhancementOrder_2: {
      termsHash: ZERO_BYTES32,
      templateId: ZERO_BYTES32,
      customTerms: underlyingCustomTerms, // arbitrary terms object to satisfy abi encoder (skipped during issuance)
      ownership: {
        creatorObligor: ZERO_ADDRESS,
        creatorBeneficiary: ZERO_ADDRESS,
        counterpartyObligor: ZERO_ADDRESS,
        counterpartyBeneficiary: ZERO_ADDRESS
      },
      engine: ZERO_ADDRESS,
      admin: ZERO_ADDRESS,
      creatorSignature: ZERO_BYTES,
      counterpartySignature: ZERO_BYTES,
      salt: 0
    },
    creatorSignature: null,
    counterpartySignature: null,
    salt: Math.floor(Math.random() * 1000000)
  };
}

function getDefaultOrderDataWithEnhancements(
  underlyingTerms,  underlyingTemplateId, underlyingCustomTerms, underlyingOwnership, underlyingEngine, underlyingAdmin,
  enhancementTerms_1, enhancementTemplateId_1, enhancementCustomTerms_1, enhancementOwnership_1, enhancementEngine_1, enhancementAdmin_1,
  enhancementTerms_2, enhancementTemplateId_2, enhancementCustomTerms_2, enhancementOwnership_2, enhancementEngine_2, enhancementAdmin_2
) {
  return { 
    termsHash: getTermsHash(underlyingTerms),
    templateId: Web3Utils.toHex(underlyingTemplateId),
    customTerms: underlyingCustomTerms,
    expirationDate: '10000000000',
    ownership: underlyingOwnership,
    engine: underlyingEngine,
    admin: underlyingAdmin,
    enhancementOrder_1: {
      termsHash: getTermsHash(enhancementTerms_1),
      templateId: Web3Utils.toHex(enhancementTemplateId_1),
      customTerms: enhancementCustomTerms_1,
      ownership: enhancementOwnership_1,
      engine: enhancementEngine_1,
      admin: enhancementAdmin_1,
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
      admin: enhancementAdmin_2,
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
