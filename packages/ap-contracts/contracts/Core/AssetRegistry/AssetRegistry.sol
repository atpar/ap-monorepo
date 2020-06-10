pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";
import "./IAssetRegistry.sol";
import "./Economics/Economics.sol";
import "./Ownership/Ownership.sol";


/**
 * @title AssetRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract AssetRegistry is AssetRegistryStorage, Economics, Ownership, IAssetRegistry {

    event RegisteredAsset(bytes32 assetId);


    constructor(ITemplateRegistry _templateRegistry)
        public
        AssetRegistryStorage(_templateRegistry)
    {}

    /**
     * @notice Returns if there is an asset registerd for a given assetId
     * @param assetId id of the asset
     * @return true if asset exist
     */
    function isRegistered(bytes32 assetId)
        external
        view
        override
        returns (bool)
    {
        return assets[assetId].isSet;
    }

    // /**
    //  * @notice
    //  * @param assetId id of the asset
    //  * @param ownership ownership of the asset
    //  * @param terms asset specific terms (ANNTerms)
    //  * @param state initial state of the asset
    //  * @param engine ACTUS Engine of the asset
    //  * @param actor account which is allowed to update the asset state
    //  * @param admin account which as admin rights (optional)
    //  */
    // function registerAsset(
    //     bytes32 assetId,
    //     AssetOwnership calldata ownership,
    //     ANNTerms calldata terms,
    //     State calldata state,
    //     address engine,
    //     address actor,
    //     address admin
    // )
    //     external
    //     override
    // {
    //     setAsset(assetId, ownership, state, engine, actor, admin);
    //     assets[_assetId].encodeAndSetANNTerms(terms);
    // }

    // /**
    //  * @notice
    //  * @param assetId id of the asset
    //  * @param ownership ownership of the asset
    //  * @param terms asset specific terms (CECTerms)
    //  * @param state initial state of the asset
    //  * @param engine ACTUS Engine of the asset
    //  * @param actor account which is allowed to update the asset state
    //  * @param admin account which as admin rights (optional)
    //  */
    // function registerAsset(
    //     bytes32 assetId,
    //     AssetOwnership calldata ownership,
    //     CECTerms calldata terms,
    //     State calldata state,
    //     address engine,
    //     address actor,
    //     address admin
    // )
    //     external
    //     override
    // {
    //     setAsset(assetId, ownership, state, engine, actor, admin);
    //     assets[_assetId].encodeAndSetCECTerms(terms);
    // }

    // /**
    //  * @notice
    //  * @param assetId id of the asset
    //  * @param ownership ownership of the asset
    //  * @param terms asset specific terms (CEGTerms)
    //  * @param state initial state of the asset
    //  * @param engine ACTUS Engine of the asset
    //  * @param actor account which is allowed to update the asset state
    //  * @param admin account which as admin rights (optional)
    //  */
    // function registerAsset(
    //     bytes32 assetId,
    //     AssetOwnership calldata ownership,
    //     CEGTerms calldata terms,
    //     State calldata state,
    //     address engine,
    //     address actor,
    //     address admin
    // )
    //     external
    //     override
    // {
    //     setAsset(assetId, ownership, state, engine, actor, admin);
    //     assets[_assetId].encodeAndSetCEGTerms(terms);
    // }

    /**
     * @notice
     * @param assetId id of the asset
     * @param ownership ownership of the asset
     * @param terms asset specific terms (PAMTerms)
     * @param state initial state of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function registerAsset(
        bytes32 assetId,
        AssetOwnership calldata ownership,
        PAMTerms calldata terms,
        State calldata state,
        address engine,
        address actor,
        address admin
    )
        external
        override
    {
        setAsset(assetId, ownership, state, engine, actor, admin);
        assets[_assetId].encodeAndSetPAMTerms(terms);
    }
}
