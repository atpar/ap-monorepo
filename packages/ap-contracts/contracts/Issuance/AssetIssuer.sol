pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";
import "../Core/IAssetActor.sol";
import "../Core/ICustodian.sol";
import "../Core/ProductRegistry/IProductRegistry.sol";
import "./IAssetIssuer.sol";
import "./VerifyOrder.sol";


contract AssetIssuer is SharedTypes, VerifyOrder, IAssetIssuer {

	ICustodian public custodian;
	IProductRegistry public productRegistry;


	constructor(ICustodian _custodian, IProductRegistry _productRegistry) public {
		custodian = _custodian;
		productRegistry = _productRegistry;
	}

	/**
	 * issues an asset from an order which was signed by a maker and taker
	 * @dev verifies both signatures and initializes by calling the specified asset actor
	 * @param order order for which to issue the asset
	 */
	function issueFromOrder(Order memory order)
		public
	{
		// verify signatures of order (and enhancement orders)
		require(
			assertOrderSignatures(order),
			"AssetIssuer.issueFromOrder: INVALID_SIGNATURE"
		);

		// issue asset (underlying)
		issueAsset(
			keccak256(
				abi.encode(
					order.makerSignature,
					order.takerSignature
				)
			),
			AssetOwnership(
				order.maker,
				order.maker,
				order.taker,
				order.taker
			),
			order.productId,
			order.customTerms,
			order.actor,
			order.engine
		);

		// check if first enhancement order is specified
		if (order.enhancementOrder_1.termsHash != bytes32(0)) {
			issueAsset(
				keccak256(
					abi.encode(
						order.enhancementOrder_1.makerSignature,
						order.enhancementOrder_1.takerSignature
					)
				),
				AssetOwnership(
					order.enhancementOrder_1.maker,
					order.enhancementOrder_1.maker,
					order.enhancementOrder_1.taker,
					order.enhancementOrder_1.taker
				),
				order.enhancementOrder_1.productId,
				order.enhancementOrder_1.customTerms,
				order.actor,
				order.enhancementOrder_1.engine
			);
		}

		// check if second enhancement order is specified
		if (order.enhancementOrder_2.termsHash != bytes32(0)) {
			issueAsset(
				keccak256(
					abi.encode(
						order.enhancementOrder_2.makerSignature,
						order.enhancementOrder_2.takerSignature
					)
				),
				AssetOwnership(
					order.enhancementOrder_2.maker,
					order.enhancementOrder_2.maker,
					order.enhancementOrder_2.taker,
					order.enhancementOrder_2.taker
				),
				order.enhancementOrder_2.productId,
				order.enhancementOrder_2.customTerms,
				order.actor,
				order.enhancementOrder_2.engine
			);
		}
	}

	/**
	 * issues an asset from an asset draft
	 * @dev no signature verification
	 * @param draft asset draft which to issue an asset from
	 */
	function issueFromDraft(AssetDraft memory draft)
		public
	{
		issueAsset(
			keccak256(abi.encode(draft)),
			AssetOwnership(
				draft.creator,
				draft.creator,
				draft.counterparty,
				draft.counterparty
			),
			draft.productId,
			draft.customTerms,
			draft.actor,
			draft.engine
		);
	}

	function issueAsset(
		bytes32 assetId,
		AssetOwnership memory ownership,
		bytes32 productId,
		CustomTerms memory customTerms,
		address actor,
		address engine
	)
		internal
	{
		// contract references
		executeContractualConditions(
			assetId,
			ownership,
			productId,
			customTerms
		);

		// initialize the asset by calling the asset actor
		require(
			IAssetActor(actor).initialize(
				assetId,
				ownership,
				productId,
				customTerms,
				engine
			),
			"AssetIssuer.issueAsset: EXECUTION_ERROR"
		);

		emit AssetIssued(assetId, ownership.creatorObligor, ownership.counterpartyObligor);
	}

	function executeContractualConditions(
		bytes32 assetId,
		AssetOwnership memory ownership,
		bytes32 productId,
		CustomTerms memory customTerms
	)
		internal
	{
		// derive terms from product terms and custom terms
		LifecycleTerms memory terms = deriveLifecycleTerms(
			productRegistry.getProductTerms(productId),
			customTerms
		);

		// check if terms contain a reference to collateral
		if (terms.contractReferences[1].object != bytes32(0)) {
			// try transferring collateral to the custodian
			custodian.lockCollateral(assetId, terms, ownership);
		}
	}
}
