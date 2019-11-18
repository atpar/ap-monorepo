pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";
import "../Core/IAssetActor.sol";
import "./VerifyOrder.sol";


contract IAssetIssuer is SharedTypes, VerifyOrder {

	event AssetIssued(bytes32 indexed assetId, address indexed recordCreator, address indexed counterparty);

	struct AssetDraft {
		bytes32 termsHash;
		LifecycleTerms terms;
		ProtoEventSchedules protoEventSchedules;
		address creator;
		address counterparty;
		address engine;
		address actor;
	}

	/**
	 * issues an asset from an order which was signed by the maker and taker
	 * @dev verifies both signatures and calls the init code defined in the actor contract
	 * @param order order for which to issue the asset
	 */
	function issueFromOrder(Order memory order) public;

	function issueFromDraft(AssetDraft memory draft) public;

	function issueAsset(
		bytes32 assetId,
		AssetOwnership memory ownership,
		LifecycleTerms memory terms,
		ProtoEventSchedules memory protoEventSchedules,
		address actor,
		address engine
	)
		public
		returns (bool);
}
