pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";
import "./IAssetRegistry.sol";
import "./Economics.sol";
import "./Ownership.sol";


contract AssetRegistry is AssetRegistryStorage, IAssetRegistry, Economics, Ownership {

	constructor(IProductRegistry _productRegistry)
		public
		AssetRegistryStorage(_productRegistry)
	{}

	/**
	 * Stores the addresses of the owners (owner of creator-side payment obligations,
	 * owner of creator-side payment claims), terms and the initial state of an asset
	 * and sets the address of the actor (address of account which is allowed to update the state).
	 * @dev the terms and state can only be called by a whitelisted actor
	 * @param assetId id of the asset
	 * @param ownership ownership of the asset
	 * @param productId id of the financial product to use
	 * @param customTerms asset specific terms
	 * @param state initial state of the asset
	 * @param engine ACTUS Engine of the asset
	 * @param actor account which is allowed to update the asset state
	 */
	function registerAsset(
		bytes32 assetId,
		AssetOwnership memory ownership,
		bytes32 productId,
		CustomTerms memory customTerms,
		State memory state,
    address engine,
		address actor
	)
		public
	{
		require(
			assets[assetId].assetId == bytes32(0),
			"AssetRegistry.registerAsset: ENTRY_ALREADY_EXISTS"
		);

		setAsset(
			assetId,
			ownership,
			productId,
			customTerms,
			state,
      engine,
			actor
		);
	}
}
