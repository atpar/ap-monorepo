const Web3Utils = require('web3-utils');
const Web3EthAbi = require('web3-eth-abi');

const TemplateTermsABI = require('./abis/TemplateTermsABI');
const TemplateScheduleABI = require('./abis/TemplateScheduleABI');
const CustomTermsABI = require('./abis/CustomTermsABI');
const TermsABI = require('./abis/TermsABI');


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
    TemplateTermsABI,
    templateTerms
  ));

  const templateSchedulesHash = Web3Utils.keccak256(_encodeParameter(
    TemplateScheduleABI,
    templateSchedules
  ));

  return Web3Utils.keccak256(Web3EthAbi.encodeParameters(
    ['bytes32', 'bytes32'],
    [templateTermsHash, templateSchedulesHash]
  ));
}

function getCustomTermsHash (customTerms) {
  return Web3Utils.keccak256(_encodeParameter(
    CustomTermsABI,
    customTerms
  ));
}

function getTermsHash (terms) {
  return Web3Utils.keccak256(_encodeParameter(
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
