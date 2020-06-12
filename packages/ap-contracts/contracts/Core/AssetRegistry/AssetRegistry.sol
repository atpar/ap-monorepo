pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";

import "./AssetRegistryStorage.sol";
import "./IAssetRegistry.sol";
import "./Terms/TermsRegistry.sol";
import "./State/StateRegistry.sol";
import "./Schedule/ScheduleRegistry.sol";
import "./Ownership/OwnershipRegistry.sol";


/**
 * @title AssetRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract AssetRegistry is
    AssetRegistryStorage,
    TermsRegistry,
    StateRegistry,
    ScheduleRegistry,
    OwnershipRegistry,
    IAssetRegistry 
{

    event RegisteredAsset(bytes32 assetId);
    event UpdatedEngine(bytes32 indexed assetId, address prevEngine, address newEngine);
    event UpdatedActor(bytes32 indexed assetId, address prevActor, address newActor);


    constructor()
        public
        AssetRegistryStorage()
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

    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (ANNTerms)
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function registerAsset(
        bytes32 assetId,
        ANNTerms calldata terms,
        State calldata state,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address actor,
        address admin
    )
        external
        override
    {
        setAsset(assetId, state, schedule, ownership, engine, actor, admin);
        assets[assetId].encodeAndSetANNTerms(terms);
    }

    // /**
    //  * @notice
    //  * @param assetId id of the asset
    //  * @param terms asset specific terms (CECTerms)
    //  * @param state initial state of the asset
    //  * @param schedule schedule of the asset
    //  * @param ownership ownership of the asset
    //  * @param engine ACTUS Engine of the asset
    //  * @param actor account which is allowed to update the asset state
    //  * @param admin account which as admin rights (optional)
    //  */
    // function registerAsset(
    //     bytes32 assetId,
    //     CECTerms calldata terms,
    //     State calldata state,
    //     bytes32[] calldata schedule,
    //     AssetOwnership calldata ownership,
    //     address engine,
    //     address actor,
    //     address admin
    // )
    //     external
    //     override
    // {
    //     setAsset(assetId, state, schedule, ownership, engine, actor, admin);
    //     assets[assetId].encodeAndSetCECTerms(terms);
    // }

    // /**
    //  * @notice
    //  * @param assetId id of the asset
    //  * @param terms asset specific terms (CEGTerms)
    //  * @param state initial state of the asset
    //  * @param schedule schedule of the asset
    //  * @param ownership ownership of the asset
    //  * @param engine ACTUS Engine of the asset
    //  * @param actor account which is allowed to update the asset state
    //  * @param admin account which as admin rights (optional)
    //  */
    // function registerAsset(
    //     bytes32 assetId,
    //     CEGTerms calldata terms,
    //     State calldata state,
    //     bytes32[] calldata schedule,
    //     AssetOwnership calldata ownership,
    //     address engine,
    //     address actor,
    //     address admin
    // )
    //     external
    //     override
    // {
    //     setAsset(assetId, state, schedule, ownership, engine, actor, admin);
    //     assets[assetId].encodeAndSetCEGTerms(terms);
    // }

    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (PAMTerms)
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function registerAsset(
        bytes32 assetId,
        PAMTerms calldata terms,
        State calldata state,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address actor,
        address admin
    )
        external
        override
    {
        setAsset(assetId, state, schedule, ownership, engine, actor, admin);
        assets[assetId].encodeAndSetPAMTerms(terms);
    }

    /**
     * @notice Stores the addresses of the owners (owner of creator-side payment obligations,
     * owner of creator-side payment claims), the initial state of an asset, the schedule of the asset
     * and sets the address of the actor (address of account which is allowed to update the state).
     * @dev The state of the asset can only be updates by a whitelisted actor.
     * @param assetId id of the asset
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function setAsset(
        bytes32 assetId,
        State memory state,
        bytes32[] memory schedule,
        AssetOwnership memory ownership,
        address engine,
        address actor,
        address admin
    )
        internal
    {
        Asset storage asset = assets[assetId];

        // revert if an asset with the specified assetId already exists
        require(
            asset.isSet == false,
            "AssetRegistry.setAsset: ASSET_ALREADY_EXISTS"
        );

        asset.isSet = true;
        asset.ownership = ownership;
        asset.engine = engine;
        asset.actor = actor;

        asset.encodeAndSetState(state);
        asset.encodeAndSetFinalizedState(state);
        asset.encodeAndSetSchedule(schedule);

        // set external admin if specified
        if (admin != address(0)) {
            setDefaultRoot(assetId, admin);
        }

        emit RegisteredAsset(assetId);
    }

    /**
     * @notice Returns the address of a the ACTUS engine corresponding to the ContractType of an asset.
     * @param assetId id of the asset
     * @return address of the engine of the asset
     */
    function getEngine(bytes32 assetId)
        external
        view
        override
        returns (address)
    {
        return assets[assetId].engine;
    }

    /**
     * @notice Returns the address of the actor which is allowed to update the state of the asset.
     * @param assetId id of the asset
     * @return address of the asset actor
     */
    function getActor(bytes32 assetId)
        external
        view
        override
        returns (address)
    {
        return assets[assetId].actor;
    }

    /**
     * @notice Set the engine address which should be used for the asset going forward.
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param engine new engine address
     */
    function setEngine(bytes32 assetId, address engine)
        external
        override
        isAuthorized (assetId)
    {
        address prevEngine = assets[assetId].engine;

        assets[assetId].engine = engine;

        emit UpdatedEngine(assetId, prevEngine, engine);
    }

    /**
     * @notice Set the address of the Actor contract which should be going forward.
     * @param assetId id of the asset
     * @param actor address of the Actor contract
     */
    function setActor(bytes32 assetId, address actor)
        external
        override
        isAuthorized (assetId)
    {
        address prevActor = assets[assetId].actor;

        assets[assetId].actor = actor;

        emit UpdatedActor(assetId, prevActor, actor);
    }
}
