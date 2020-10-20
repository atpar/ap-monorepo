// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "../SharedTypes.sol";

import "./BaseRegistryStorage.sol";
import "./IBaseRegistry.sol";
import "./Ownership/OwnershipRegistry.sol";
import "./Terms/TermsRegistry.sol";
import "./State/StateRegistry.sol";
import "./Schedule/ScheduleRegistry.sol";


/**
 * @title BaseRegistry
 * @notice Registry for ACTUS Protocol assets
 */
abstract contract BaseRegistry is
    Ownable,
    BaseRegistryStorage,
    TermsRegistry,
    StateRegistry,
    ScheduleRegistry,
    OwnershipRegistry,
    IBaseRegistry
{
    event RegisteredAsset(bytes32 assetId);
    event UpdatedEngine(bytes32 indexed assetId, address prevEngine, address newEngine);
    event UpdatedActor(bytes32 indexed assetId, address prevActor, address newActor);

    mapping(address => bool) public approvedActors;


    modifier onlyApprovedActors {
        require(
            approvedActors[msg.sender],
            "BaseRegistry.onlyApprovedActors: UNAUTHORIZED_SENDER"
        );
        _;
    }

    constructor()
        public
        BaseRegistryStorage()
    {}

    /**
     * @notice Approves the address of an actor contract e.g. for registering assets.
     * @dev Can only be called by the owner of the contract.
     * @param actor address of the actor
     */
    function approveActor(address actor) external onlyOwner {
        approvedActors[actor] = true;
    }

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
            "BaseRegistry.setAsset: ASSET_ALREADY_EXISTS"
        );
        // revert if specified address of the actor is not approved
        require(
            approvedActors[actor] == true,
            "BaseRegistry.setAsset: ACTOR_NOT_APPROVED"
        );

        asset.isSet = true;
        asset.ownership = ownership;
        asset.engine = engine;
        asset.actor = actor;

        asset.encodeAndSetState(state);
        asset.encodeAndSetFinalizedState(state);
        asset.encodeAndSetSchedule(schedule);

        // set external admin if specified
        if (admin != address(0)) setDefaultRoot(assetId, admin);

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
