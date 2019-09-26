pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";

import "./SharedTypes.sol";


contract IDemoAssetActor is SharedTypes, Definitions {

	event AssetProgressed(bytes32 indexed assetId, uint256 eventId);

	/**
	 * proceeds with the next state of the asset based on the terms, the last state and
	 * the status of all obligations, that are due to the specified timestamp. If all obligations are fullfilled
	 * the actor updates the state of the asset in the EconomicsRegistry
	 * @param assetId id of the asset
	 * @param timestamp current timestamp
	 * @return true if state was updated
	 */
	function progress(
		bytes32 assetId,
		uint256 timestamp
	)
		external
		returns (bool);

	/**
	 * derives the initial state of the asset from the provided terms and sets the initial state, the terms
	 * together with the ownership of the asset in the EconomicsRegistry and OwnershipRegistry
	 * @dev can only be called by the whitelisted account
	 * @param assetId id of the asset
	 * @param ownership ownership of the asset
	 * @param terms terms of the asset
	 * @return true on success
	 */
	function initialize(
		bytes32 assetId,
		AssetOwnership memory ownership,
		ContractTerms memory terms,
		address engine
	)
		public
		returns (bool);
}
