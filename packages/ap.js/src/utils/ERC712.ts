import * as web3Utils from 'web3-utils';
import web3EthAbi from 'web3-eth-abi';

import CustomTermsABI from '@atpar/ap-contracts/test/helper/abis/CustomTermsABI.json';
import TermsABI from '@atpar/ap-contracts/test/helper/abis/TermsABI.json';
import TemplateTermsABI from '@atpar/ap-contracts/test/helper/abis/TemplateTermsABI.json';
import TemplateScheduleABI from '@atpar/ap-contracts/test/helper/abis/TemplateScheduleABI.json';

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
  const templateTermsHash = web3Utils.keccak256(_encodeParameter(TemplateTermsABI, templateTerms));
  const templateSchedulesHash = web3Utils.keccak256(_encodeParameter(TemplateScheduleABI, templateSchedules));

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
  return web3Utils.keccak256(_encodeParameter(CustomTermsABI, customTerms));
}

export function getTermsHash (terms: Terms): string {
  return web3Utils.keccak256(_encodeParameter(TermsABI, terms));
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
