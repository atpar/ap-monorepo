pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";
import "../Core/IAssetActor.sol";
import "./IAssetIssuer.sol";
import "./VerifyOrder.sol";


contract AssetIssuer is SharedTypes, VerifyOrder, IAssetIssuer {

	/**
	 * issues an asset from an order which was signed by the maker and taker
	 * @dev verifies both signatures and calls the init code defined in the actor contract
	 * @param order order for which to issue the asset
	 */
	function issueFromOrder(Order memory order)
		public
	{
		require(
			assertOrderSignatures(order),
			"AssetIssuer.issueFromOrder: INVALID_SIGNATURE"
		);

		require(
			issueAsset(
				keccak256(abi.encode(order.makerSignature, order.takerSignature)),
				AssetOwnership(order.maker, order.maker, order.taker, order.taker),
				order.terms,
				order.protoEventSchedules,
				order.actor,
				order.engine
			),
			"AssetIssuer.issueFromOrder: Could not issue asset"
		);

		if (order.enhancements[0].termsHash != bytes32(0)) {
			require(
				issueAsset(
					keccak256(abi.encode(order.enhancements[0].makerSignature, order.enhancements[0].takerSignature)),
					AssetOwnership(order.enhancements[0].maker, order.enhancements[0].maker, order.enhancements[0].taker, order.enhancements[0].taker),
					order.enhancements[0].terms,
					order.enhancements[0].protoEventSchedules,
					order.actor,
					order.engine
				),
				"AssetIssuer.issueFromOrder: Could not issue enhancement"
			);
		}

		if (order.enhancements[1].termsHash != bytes32(0)) {
			require(
				issueAsset(
					keccak256(abi.encode(order.enhancements[1].makerSignature, order.enhancements[1].takerSignature)),
					AssetOwnership(order.enhancements[1].maker, order.enhancements[1].maker, order.enhancements[1].taker, order.enhancements[1].taker),
					order.enhancements[1].terms,
					order.enhancements[1].protoEventSchedules,
					order.actor,
					order.engine
				),
				"AssetIssuer.issueFromOrder: Could not issue enhancement"
			);
		}
	}

	function issueFromDraft(AssetDraft memory draft) 
		public
	{
		require(
			issueAsset(
				keccak256(abi.encode(draft)),
				AssetOwnership(draft.creator, draft.creator, draft.counterparty, draft.counterparty),
				draft.terms,
				draft.protoEventSchedules,
				draft.actor,
				draft.engine
			),
			"AssetIssuer.issueFromDraft: Could not issue asset"
		);
	}

	function issueAsset(
		bytes32 assetId,
		AssetOwnership memory ownership,
		LifecycleTerms memory terms,
		ProtoEventSchedules memory protoEventSchedules,
		address actor,
		address engine
	)
		public
		returns (bool)
	{
		require(
			IAssetActor(actor).initialize(
				assetId,
				ownership,
				terms,
				protoEventSchedules,
				engine
			),
			"AssetIssuer.issueAsset: EXECUTION_ERROR"
		);

		emit AssetIssued(assetId, ownership.recordCreatorObligor, ownership.counterpartyObligor);

		return true;
	}
}
