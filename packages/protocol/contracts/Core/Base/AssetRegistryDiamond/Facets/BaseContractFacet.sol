// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../SharedTypes.sol";

import "../Lib.sol";

import "./BaseFacet.sol";
import "./State/StateEncoder.sol";
import "./Schedule/ScheduleEncoder.sol";


/**
 * @title BaseContractFacet
 * @notice Registry for ACTUS Protocol assets
 */
abstract contract BaseContractFacet is BaseFacet {

    using StateEncoder for Asset;
    using ScheduleEncoder for Asset;

    event RegisteredAsset(bytes32 indexed assetId);
    event UpdatedTerms(bytes32 indexed assetId);


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
        onlyApprovedActors
    {
        Asset storage asset = assetStorage().assets[assetId];

        // revert if an asset with the specified assetId already exists
        require(
            asset.isSet == false,
            "BaseContractFacet.setAsset: ASSET_ALREADY_EXISTS"
        );
        // revert if specified address of the actor is not approved
        require(
            permissionStorage().approvedActors[actor] == true,
            "BaseContractFacet.setAsset: ACTOR_NOT_APPROVED"
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
            asset.access[ROOT_ACCESS][admin] = true;
        }

        emit RegisteredAsset(assetId);
    }
}
