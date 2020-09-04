// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;


/**
 * @title StateRegistry
 */
abstract contract StateRegistry {

    event UpdatedState(bytes32 indexed assetId, uint256 statusDate);
    event UpdatedFinalizedState(bytes32 indexed assetId, uint256 statusDate);


    function getEnumValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (uint8);

    function getIntValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (int256);

    function getUintValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        virtual
        returns (uint256);
}
