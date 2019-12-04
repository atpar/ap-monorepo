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
			keccak256(abi.encode(order.creatorSignature, order.counterpartySignature)),
			order.ownership,
			order.productId,
			order.customTerms,
			order.actor,
			order.engine
		);

		// check if first enhancement order is specified
		if (order.enhancementOrder_1.termsHash != bytes32(0)) {
			(
				bytes32 assetId,
				AssetOwnership memory ownership,
				bytes32 productId,
				CustomTerms memory customTerms,
				address engine,
				address actor
			) = finalizeEnhancementOrder(order.enhancementOrder_1, order);

			issueAsset(
				assetId, ownership, productId, customTerms, engine, actor
			);
		}

		// check if second enhancement order is specified
		if (order.enhancementOrder_2.termsHash != bytes32(0)) {
			(
				bytes32 assetId,
				AssetOwnership memory ownership,
				bytes32 productId,
				CustomTerms memory customTerms,
				address engine,
				address actor
			) = finalizeEnhancementOrder(order.enhancementOrder_2, order);

			issueAsset(
				assetId, ownership, productId, customTerms, engine, actor
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
			draft.ownership,
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

	function finalizeEnhancementOrder(EnhancementOrder memory enhancementOrder, Order memory order)
		internal
		returns (bytes32, AssetOwnership memory, bytes32, CustomTerms memory, address, address)
	{
		bytes32 assetId = keccak256(abi.encode(enhancementOrder.creatorSignature, enhancementOrder.counterpartySignature));

		// check if first contract reference in enhancement terms reference a underlying asset
		if (enhancementOrder.customTerms.contractReference_1.contractReferenceRole == ContractReferenceRole.CVE) {
			// derive assetId of underlying and set as object in the first contract reference
			enhancementOrder.customTerms.contractReference_1.object = keccak256(abi.encode(
				order.creatorSignature,
				order.counterpartySignature
			));
		}

		// check if second contract reference in enhancement terms contain a reference to collateral
		if (enhancementOrder.customTerms.contractReference_2.contractReferenceRole == ContractReferenceRole.CVI) {
			// derive assetId
			assetId = keccak256(abi.encode(order.creatorSignature, order.counterpartySignature, address(custodian)));

			// derive terms of underlying from product terms and custom terms
			LifecycleTerms memory underlyingTerms = deriveLifecycleTerms(
				productRegistry.getProductTerms(order.productId),
				order.customTerms
			);
			// derive terms of enhancement from product terms and custom terms
			LifecycleTerms memory enhancementTerms = deriveLifecycleTerms(
				productRegistry.getProductTerms(enhancementOrder.productId),
				enhancementOrder.customTerms
			);

			// set ownership of enhancement according to contract role of underlying
			if (enhancementTerms.contractRole == ContractRole.BUY && underlyingTerms.contractRole == ContractRole.RPA) {
				enhancementOrder.ownership = AssetOwnership(
					order.ownership.creatorObligor,
					order.ownership.creatorBeneficiary,
					address(custodian),
					order.ownership.counterpartyBeneficiary
				);
			} else if (enhancementTerms.contractRole == ContractRole.SEL && underlyingTerms.contractRole == ContractRole.RPL) {
				enhancementOrder.ownership = AssetOwnership(
					address(custodian),
					order.ownership.creatorBeneficiary,
					order.ownership.counterpartyObligor,
					order.ownership.counterpartyBeneficiary
				);
			} else {
				// only BUY, RPA and SEL, RPL allowed for CEC
				revert("AssetIssuer.finalizeEnhancementOrder: INVALID_CONTRACT_ROLES");
			}

			// execute contractual conditions
			require(
				enhancementTerms.contractReference_2.object != bytes32(0),
				"AssetIssuer.finalizeEnhancementOrder: INVALID_OBJECT"
			);
			// try transferring collateral to the custodian
			custodian.lockCollateral(assetId, enhancementTerms, enhancementOrder.ownership);
		}

		return (
			assetId,
			enhancementOrder.ownership,
			enhancementOrder.productId,
			enhancementOrder.customTerms,
			order.actor,
			enhancementOrder.engine
		);
	}
}
