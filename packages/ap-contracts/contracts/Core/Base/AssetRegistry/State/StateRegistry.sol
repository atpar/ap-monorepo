pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../BaseRegistryStorage.sol";
import "../AccessControl/AccessControl.sol";
import "./IStateRegistry.sol";


/**
 * @title StateRegistry
 */
contract StateRegistry is BaseRegistryStorage, AccessControl, IStateRegistry {

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
        return assets[assetId].decodeAndGetState();
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
        return assets[assetId].decodeAndGetFinalizedState();
    }

    function getEnumValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForStateAttribute(attribute);
    }

    function getIntValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForForStateAttribute(attribute);
    }

    function getUintValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForForStateAttribute(attribute);
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
        assets[assetId].encodeAndSetState(state);
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
        assets[assetId].encodeAndSetFinalizedState(state);
        emit UpdatedFinalizedState(assetId, state.statusDate);
    }
}
