pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";

import "./SharedTypes.sol";


contract IAssetActor is Definitions, SharedTypes {

	event AssetProgressed(bytes32 indexed assetId, bytes32 eventId, uint256 scheduleTime);

	/**
	 * proceeds with the next state of the asset based on the terms, the last state and
	 * the status of all obligations, that are due. If all obligations are fullfilled
	 * the actor updates the state of the asset in the EconomicsRegistry
	 * @param assetId id of the asset
	 */
	function progress(
		bytes32 assetId
	)
		external;

	/**
	 * derives the initial state of the asset from the provided terms and sets the initial state, the terms
	 * together with the ownership of the asset in the EconomicsRegistry and OwnershipRegistry
	 * @dev can only be called by the whitelisted account
	 * @param assetId id of the asset
	 * @param ownership ownership of the asset
	 * @param productId id of the financial product to use
	 * @param customTerms asset specific terms
	 * @param engine address of the actus engine
	 * @return true on success
	 */
	function initialize(
		bytes32 assetId,
		AssetOwnership memory ownership,
		bytes32 productId,
		CustomTerms memory customTerms,
		address engine
	)
		public
		returns (bool);
}
