// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../SharedTypes.sol";


interface IStateRegistry {

    function getState(bytes32 assetId)
        external
        view
        returns (State memory);

    function getFinalizedState(bytes32 assetId)
        external
        view
        returns (State memory);

    function getEnumValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (uint8);

    function getIntValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (int256);

    function getUintValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (uint256);

    function setState(bytes32 assetId, State calldata state)
        external;

    function setFinalizedState(bytes32 assetId, State calldata state)
        external;
}
