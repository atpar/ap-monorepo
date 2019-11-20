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
		bytes32 productId;
		CustomTerms customTerms;
		address maker;
		address taker;
		address engine;
		bytes makerSignature;
		bytes takerSignature;
		uint256 salt;
	}

	struct Order {
		bytes32 termsHash;
		bytes32 productId;
		CustomTerms customTerms;
		uint256 expirationDate;
		address maker;
		address taker;
		address engine;
		address actor;
		EnhancementOrder enhancementOrder_1;
		EnhancementOrder enhancementOrder_2;
		bytes makerSignature;
		bytes takerSignature;
		uint256 salt;
	}

	bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
		"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
	);

	// signed by the maker of the Order which includes the Enhancement Order
	bytes32 constant DRAFT_ENHANCEMENT_ORDER_TYPEHASH = keccak256(
		"EnhancementOrder(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,address engine,uint256 salt)"
	);

	bytes32 constant UNFILLED_ENHANCEMENT_ORDER_TYPEHASH = keccak256(
		"EnhancementOrder(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,address maker,address engine,uint256 salt)"
	);

	bytes32 constant FILLED_ENHANCEMENT_ORDER_TYPEHASH = keccak256(
		"EnhancementOrder(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,address maker,address taker,address engine,uint256 salt)"
	);

	bytes32 constant UNFILLED_ORDER_TYPEHASH = keccak256(
		"Order(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,uint256 expirationDate,address maker,address engine,address actor,bytes32 enhancementOrderHash_1,bytes32 enhancementOrderHash_2,uint256 salt)"
	);

	bytes32 constant FILLED_ORDER_TYPEHASH = keccak256(
		"Order(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,uint256 expirationDate,address maker,address taker,address engine,address actor,bytes32 enhancementOrderHash_1,bytes32 enhancementOrderHash_2,uint256 salt)"
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

	function hashCustomTerms(CustomTerms memory terms)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(terms));
	}

	function hashSchedules(ProtoSchedules memory protoSchedules)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(protoSchedules));
	}

	function hashDraftEnhancementOrder(EnhancementOrder memory enhancementOrder)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			DRAFT_ENHANCEMENT_ORDER_TYPEHASH,
			enhancementOrder.termsHash,
			enhancementOrder.productId,
			hashCustomTerms(enhancementOrder.customTerms),
			enhancementOrder.engine,
			enhancementOrder.salt
		));
	}

	function hashUnfilledEnhancementOrder(EnhancementOrder memory enhancementOrder)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			UNFILLED_ENHANCEMENT_ORDER_TYPEHASH,
			enhancementOrder.termsHash,
			enhancementOrder.productId,
			hashCustomTerms(enhancementOrder.customTerms),
			enhancementOrder.maker,
			enhancementOrder.engine,
			enhancementOrder.salt
		));
	}

	function hashFilledEnhancementOrder(EnhancementOrder memory enhancementOrder)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(
			FILLED_ENHANCEMENT_ORDER_TYPEHASH,
			enhancementOrder.termsHash,
			enhancementOrder.productId,
			hashCustomTerms(enhancementOrder.customTerms),
			enhancementOrder.maker,
			enhancementOrder.taker,
			enhancementOrder.engine,
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
			order.productId,
			hashCustomTerms(order.customTerms),
			order.expirationDate,
			order.maker,
			order.engine,
			order.actor,
			hashDraftEnhancementOrder(order.enhancementOrder_1),
			hashDraftEnhancementOrder(order.enhancementOrder_2),
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
			order.productId,
			hashCustomTerms(order.customTerms),
			order.expirationDate,
			order.maker,
			order.taker,
			order.engine,
			order.actor,
			hashDraftEnhancementOrder(order.enhancementOrder_1),
			hashDraftEnhancementOrder(order.enhancementOrder_2),
			order.salt
		));
	}

	/**
	 * Verifies the signature of the Order with all Enhancement Orders.
	 * The maker and taker signatures of the parent Order (or just Order)
	 * are verified using the hash of the drafted version of the enhancement orders
	 * in order to verify that the terms of the Enhancement Order where not changed.
	 * The signatures of the Enhancement Orders are verified on their own.
	 */
	function assertOrderSignatures(Order memory order)
		internal
		view
		returns (bool)
	{
		// verify signatures of Order
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

		if (ECDSA.recover(makerOrderDigest, order.makerSignature) != order.maker) { return false; }
		if (ECDSA.recover(takerOrderDigest, order.takerSignature) != order.taker) { return false; }

		// verify signature of first Enhancement Order
		bytes32 makerEnhancementOrderDigest_1 = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledEnhancementOrder(order.enhancementOrder_1)
		));
		bytes32 takerEnhancementOrderDigest_1 = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledEnhancementOrder(order.enhancementOrder_1)
		));

		if (ECDSA.recover(makerEnhancementOrderDigest_1, order.enhancementOrder_1.makerSignature) != order.enhancementOrder_1.maker) { return false; }
		if (ECDSA.recover(takerEnhancementOrderDigest_1, order.enhancementOrder_1.takerSignature) != order.enhancementOrder_1.taker) { return false; }

		// // verify signature of second Enhancement Order
		bytes32 makerEnhancementOrderDigest_2 = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledEnhancementOrder(order.enhancementOrder_2)
		));
		bytes32 takerEnhancementOrderDigest_2 = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledEnhancementOrder(order.enhancementOrder_2)
		));

		if (ECDSA.recover(makerEnhancementOrderDigest_2, order.enhancementOrder_2.makerSignature) != order.enhancementOrder_2.maker) { return false; }
		if (ECDSA.recover(takerEnhancementOrderDigest_2, order.enhancementOrder_2.takerSignature) != order.enhancementOrder_2.taker) { return false; }

		return true;
	}
}
