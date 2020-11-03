// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../Lib.sol";
import "../BaseFacet.sol";
import "./IStateFacet.sol";
import "./StateEncoder.sol";


/**
 * @title StateRegistry
 */
contract StateFacet is BaseFacet, IStateFacet {

    using StateEncoder for Asset;

    event UpdatedState(bytes32 indexed assetId, uint256 statusDate);
    event UpdatedFinalizedState(bytes32 indexed assetId, uint256 statusDate);


    /**
     * @notice Returns the state of an asset.
     * @param assetId id of the asset
     * @return state of the asset
     */
    function getState(bytes32 assetId)
        external
        view
        override
        returns (State memory)
    {
        return assetStorage().assets[assetId].decodeAndGetState();
    }

    /**
     * @notice Returns the state of an asset.
     * @param assetId id of the asset
     * @return state of the asset
     */
    function getFinalizedState(bytes32 assetId)
        external
        view
        override
        returns (State memory)
    {
        return assetStorage().assets[assetId].decodeAndGetFinalizedState();
    }

    function getEnumValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint8)
    {
        return assetStorage().assets[assetId].decodeAndGetEnumValueForStateAttribute(attribute);
    }

    function getIntValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (int256)
    {
        return assetStorage().assets[assetId].decodeAndGetIntValueForForStateAttribute(attribute);
    }

    function getUintValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint256)
    {
        return assetStorage().assets[assetId].decodeAndGetUIntValueForForStateAttribute(attribute);
    }

    /**
     * @notice Sets next state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setState(bytes32 assetId, State calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assetStorage().assets[assetId].encodeAndSetState(state);
        emit UpdatedState(assetId, state.statusDate);
    }

    /**
     * @notice Sets next finalized state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setFinalizedState(bytes32 assetId, State calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assetStorage().assets[assetId].encodeAndSetFinalizedState(state);
        emit UpdatedFinalizedState(assetId, state.statusDate);
    }
}
