pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

import "actus-solidity/contracts/Core/Definitions.sol";
import "../Core/SharedTypes.sol";


contract VerifyOrder is Definitions, SharedTypes {

	struct EIP712Domain {
		string  name;
		string  version;
		uint256 chainId;
		address verifyingContract;
	}

	struct EnhancementOrder {
		bytes32 termsHash;
		LifecycleTerms terms;
		ProtoEventSchedules protoEventSchedules;
		address maker;
    address taker;
		uint256 salt;
		bytes makerSignature;
		bytes takerSignature;
	}

  struct Order {
		bytes32 termsHash;
    LifecycleTerms terms;
		ProtoEventSchedules protoEventSchedules;
		uint256 expirationDate;
    address maker;
    address taker;
    address engine;
    address actor;
		address issuer;
		EnhancementOrder[2] enhancements;
    uint256 salt;
		bytes makerSignature;
		bytes takerSignature;
  }

	bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
		"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
	);

	bytes32 constant UNFILLED_ENHANCEMENT_ORDER_TYPEHASH = keccak256(
		"EnhancementOrder(bytes32 termsHash,bytes32 lifecycleTermsHash,bytes32 protoEventSchedulesHash,uint256 salt)"
	);

	bytes32 constant FILLED_ENHANCEMENT_ORDER_TYPEHASH = keccak256(
		"EnhancementOrder(bytes32 termsHash,bytes32 lifecycleTermsHash,bytes32 protoEventSchedulesHash,address maker,address taker,uint256 salt)"
	);

	bytes32 constant UNFILLED_ORDER_TYPEHASH = keccak256(
		"Order(bytes32 termsHash,bytes32 lifecycleTermsHash,uint256 expirationDate,bytes32 protoEventSchedulesHash,address maker,address engine,address actor,address issuer,bytes32[2] unfilledEnhancementOrderHashes,uint256 salt)"
	);

	bytes32 constant FILLED_ORDER_TYPEHASH = keccak256(
		"Order(bytes32 termsHash,bytes32 lifecycleTermsHash,uint256 expirationDate,bytes32 protoEventSchedulesHash,address maker,address taker,address engine,address actor,address issuer,bytes32[2] filledEnhancementOrderHashes,uint256 salt)"
	);

	bytes32 DOMAIN_SEPARATOR;

	constructor () public {
		DOMAIN_SEPARATOR = hashEIP712Domain(EIP712Domain({
			name: "ACTUS Protocol",
			version: "1",
			chainId: 0,
			verifyingContract: address(this)
		}));
	}

	function hashEIP712Domain(EIP712Domain memory eip712Domain)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			EIP712DOMAIN_TYPEHASH,
			keccak256(bytes(eip712Domain.name)),
			keccak256(bytes(eip712Domain.version)),
			eip712Domain.chainId,
			eip712Domain.verifyingContract
		));
	}

  function hashTerms(LifecycleTerms memory terms)
    internal
    pure
    returns (bytes32)
  {
    return keccak256(abi.encode(terms));
  }

	function hashProtoEventSchedules(ProtoEventSchedules memory protoEventSchedules)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(protoEventSchedules));
	}

	function hashUnfilledEnhancementOrder(EnhancementOrder memory enhancementOrder)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			UNFILLED_ENHANCEMENT_ORDER_TYPEHASH,
			enhancementOrder.termsHash,
			hashTerms(enhancementOrder.terms),
			hashProtoEventSchedules(enhancementOrder.protoEventSchedules),
			enhancementOrder.salt
		));
	}

	function hashFilledEnhancementOrder(EnhancementOrder memory enhancementOrder)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			UNFILLED_ENHANCEMENT_ORDER_TYPEHASH,
			enhancementOrder.termsHash,
			hashTerms(enhancementOrder.terms),
			hashProtoEventSchedules(enhancementOrder.protoEventSchedules),
			enhancementOrder.maker,
			enhancementOrder.taker,
			enhancementOrder.salt
		));
	}

	function hashUnfilledOrder(Order memory order)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			UNFILLED_ORDER_TYPEHASH,
			order.termsHash,
			hashTerms(order.terms),
			hashProtoEventSchedules(order.protoEventSchedules),
			order.maker,
      order.engine,
			order.actor,
			order.issuer,
			[hashUnfilledEnhancementOrder(order.enhancements[0]), hashUnfilledEnhancementOrder(order.enhancements[1])],
			order.salt
		));
	}

	function hashFilledOrder(Order memory order)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			FILLED_ORDER_TYPEHASH,
			order.termsHash,
			hashTerms(order.terms),
			hashProtoEventSchedules(order.protoEventSchedules),
			order.maker,
			order.taker,
      order.engine,
			order.actor,
			order.issuer,
			[hashFilledEnhancementOrder(order.enhancements[0]), hashFilledEnhancementOrder(order.enhancements[1])],
			order.salt
		));
	}

	function assertOrderSignatures(Order memory order)
		internal
		view
    returns (bool)
	{
		bytes32 makerOrderDigest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledOrder(order)
		));

		bytes32 takerOrderDigest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledOrder(order)
		));

		bytes32 makerEnhancementOrder0Digest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledEnhancementOrder(order.enhancements[0])
		));

		bytes32 takerEnhancementOrder0Digest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledEnhancementOrder(order.enhancements[0])
		));

		bytes32 makerEnhancementOrder1Digest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledEnhancementOrder(order.enhancements[1])
		));

		bytes32 takerEnhancementOrder1Digest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledEnhancementOrder(order.enhancements[1])
		));

		if (ECDSA.recover(makerOrderDigest, order.makerSignature) != order.maker) { return false; }
		if (ECDSA.recover(takerOrderDigest, order.takerSignature) != order.taker) { return false; }

		if (ECDSA.recover(makerEnhancementOrder0Digest, order.enhancements[0].makerSignature) != order.enhancements[0].maker) { return false; }
		if (ECDSA.recover(takerEnhancementOrder0Digest, order.enhancements[0].takerSignature) != order.enhancements[0].taker) { return false; }

		if (ECDSA.recover(makerEnhancementOrder1Digest, order.enhancements[1].makerSignature) != order.enhancements[1].maker) { return false; }
		if (ECDSA.recover(takerEnhancementOrder1Digest, order.enhancements[1].takerSignature) != order.enhancements[1].taker) { return false; }

    return true;
	}
}
