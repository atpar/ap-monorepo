pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";

import "../Core/SharedTypes.sol";


contract VerifyOrder is SharedTypes {

	struct EIP712Domain {
		string name;
		string version;
		uint256 chainId;
		address verifyingContract;
	}

	struct EnhancementOrder {
		bytes32 termsHash;
		bytes32 productId;
		CustomTerms customTerms;
		AssetOwnership ownership;
		address engine;
		bytes creatorSignature;
		bytes counterpartySignature;
		uint256 salt;
	}

	struct Order {
		bytes32 termsHash;
		bytes32 productId;
		CustomTerms customTerms;
		uint256 expirationDate;
		AssetOwnership ownership;
		address engine;
		address actor;
		EnhancementOrder enhancementOrder_1;
		EnhancementOrder enhancementOrder_2;
		bytes creatorSignature;
		bytes counterpartySignature;
		uint256 salt;
	}

	bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256(
		"EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
	);

	// signed by the creator of the Order which includes the Enhancement Order
	bytes32 constant DRAFT_ENHANCEMENT_ORDER_TYPEHASH = keccak256(
		"EnhancementOrder(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,address engine,uint256 salt)"
	);

	bytes32 constant ENHANCEMENT_ORDER_TYPEHASH = keccak256(
		"EnhancementOrder(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,bytes32 ownershipHash,address engine,uint256 salt)"
	);

	bytes32 constant ORDER_TYPEHASH = keccak256(
		"Order(bytes32 termsHash,bytes32 productId,bytes32 customTermsHash,uint256 expirationDate,bytes32 ownershipHash,address engine,address actor,bytes32 enhancementOrderHash_1,bytes32 enhancementOrderHash_2,uint256 salt)"
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

	function hashSchedules(ProductSchedules memory productSchedules)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(productSchedules));
	}

	function hashOwnership(AssetOwnership memory ownership)
		internal
		pure
		returns (bytes32)
	{
		return keccak256(abi.encode(ownership));
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
			ENHANCEMENT_ORDER_TYPEHASH,
			enhancementOrder.termsHash,
			enhancementOrder.productId,
			hashCustomTerms(enhancementOrder.customTerms),
			hashOwnership(
				AssetOwnership(
					enhancementOrder.ownership.creatorObligor,
					enhancementOrder.ownership.creatorBeneficiary,
					address(0),
					address(0)
				)
			),
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
			ENHANCEMENT_ORDER_TYPEHASH,
			enhancementOrder.termsHash,
			enhancementOrder.productId,
			hashCustomTerms(enhancementOrder.customTerms),
			hashOwnership(enhancementOrder.ownership),
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
			ORDER_TYPEHASH,
			order.termsHash,
			order.productId,
			hashCustomTerms(order.customTerms),
			order.expirationDate,
			hashOwnership(
				AssetOwnership(
					order.ownership.creatorObligor,
					order.ownership.creatorBeneficiary,
					address(0),
					address(0)
				)
			),
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
			ORDER_TYPEHASH,
			order.termsHash,
			order.productId,
			hashCustomTerms(order.customTerms),
			order.expirationDate,
			hashOwnership(order.ownership),
			order.engine,
			order.actor,
			hashDraftEnhancementOrder(order.enhancementOrder_1),
			hashDraftEnhancementOrder(order.enhancementOrder_2),
			order.salt
		));
	}

	/**
	 * Verifies the signature of the Order with all Enhancement Orders.
	 * The creator and counterparty signatures of the parent Order (or just Order)
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
		bytes32 creatorOrderDigest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledOrder(order)
		));
		bytes32 counterpartyOrderDigest = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledOrder(order)
		));

		if (
			ECDSA.recover(
				creatorOrderDigest,
				order.creatorSignature
			) != order.ownership.creatorObligor
		) { return false; }
		if (
			ECDSA.recover(
				counterpartyOrderDigest,
				order.counterpartySignature
			) != order.ownership.counterpartyObligor
		) { return false; }


		// verify signature of first Enhancement Order
		bytes32 creatorEnhancementOrderDigest_1 = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledEnhancementOrder(order.enhancementOrder_1)
		));
		bytes32 counterpartyEnhancementOrderDigest_1 = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledEnhancementOrder(order.enhancementOrder_1)
		));

		if (
			ECDSA.recover(
				creatorEnhancementOrderDigest_1,
				order.enhancementOrder_1.creatorSignature
			) != order.enhancementOrder_1.ownership.creatorObligor
		) { return false; }
		if (
			ECDSA.recover(
				counterpartyEnhancementOrderDigest_1,
				order.enhancementOrder_1.counterpartySignature
			) != order.enhancementOrder_1.ownership.counterpartyObligor
		) { return false; }


		// verify signature of second Enhancement Order
		bytes32 creatorEnhancementOrderDigest_2 = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashUnfilledEnhancementOrder(order.enhancementOrder_2)
		));
		bytes32 counterpartyEnhancementOrderDigest_2 = keccak256(abi.encodePacked(
			"\x19\x01",
			DOMAIN_SEPARATOR,
			hashFilledEnhancementOrder(order.enhancementOrder_2)
		));

		if (
			ECDSA.recover(
				creatorEnhancementOrderDigest_2,
				order.enhancementOrder_2.creatorSignature
			) != order.enhancementOrder_2.ownership.creatorObligor
		) { return false; }
		if (
			ECDSA.recover(
				counterpartyEnhancementOrderDigest_2,
				order.enhancementOrder_2.counterpartySignature
			) != order.enhancementOrder_2.ownership.counterpartyObligor
		) { return false; }

		return true;
	}
}
