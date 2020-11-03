// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "diamond-3/contracts/libraries/LibDiamond.sol";

import "../../Lib.sol";
import "../BaseFacet.sol";
import "./IMetaFacet.sol";


/**
 * @title MetaFacet
 * @notice Asset meta methods
 */
contract MetaFacet is BaseFacet, IMetaFacet {

    event UpdatedEngine(bytes32 indexed assetId, address prevEngine, address newEngine);
    event UpdatedActor(bytes32 indexed assetId, address prevActor, address newActor);


    /**
     * @notice Approves the address of an actor contract e.g. for registering assets.
     * @dev Can only be called by the owner of the contract.
     * @param actor address of the actor
     */
    function approveActor(address actor) external override {
        LibDiamond.enforceIsContractOwner();
        permissionStorage().approvedActors[actor] = true;
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
        return assetStorage().assets[assetId].isSet;
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
        return assetStorage().assets[assetId].engine;
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
        return assetStorage().assets[assetId].actor;
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
        address prevEngine = assetStorage().assets[assetId].engine;
        assetStorage().assets[assetId].engine = engine;

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
        address prevActor = assetStorage().assets[assetId].actor;
        assetStorage().assets[assetId].actor = actor;

        emit UpdatedActor(assetId, prevActor, actor);
    }
}
