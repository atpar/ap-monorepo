pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";
import "./IAssetRegistry.sol";
import "./Economics.sol";
import "./Ownership.sol";


/**
 * @title AssetRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract AssetRegistry is AssetRegistryStorage, IAssetRegistry, Economics, Ownership {

    event RegisteredAsset(bytes32 assetId);


    constructor(ITemplateRegistry _templateRegistry)
        public
        AssetRegistryStorage(_templateRegistry)
    {}

    /**
     * @notice Stores the addresses of the owners (owner of creator-side payment obligations,
     * owner of creator-side payment claims), terms and the initial state of an asset
     * and sets the address of the actor (address of account which is allowed to update the state).
     * @dev The state of the asset can only be updates by a whitelisted actor.
     * @param assetId id of the asset
     * @param ownership ownership of the asset
     * @param templateId id of the financial template to use
     * @param customTerms asset specific terms
     * @param state initial state of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     */
    function registerAsset(
        bytes32 assetId,
        AssetOwnership memory ownership,
        bytes32 templateId,
        CustomTerms memory customTerms,
        State memory state,
        address engine,
        address actor
    )
        public
        override
    {
        // revert if an asset with the specified assetId already exists
        require(
            assets[assetId].isSet == false,
            "AssetRegistry.registerAsset: ENTRY_ALREADY_EXISTS"
        );

        // store the asset
        setAsset(
            assetId,
            ownership,
            templateId,
            customTerms,
            state,
            engine,
            actor
        );

        emit RegisteredAsset(assetId);
    }
}
