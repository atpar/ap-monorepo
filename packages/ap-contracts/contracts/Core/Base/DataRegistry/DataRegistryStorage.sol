// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;


/**
 * @title DataRegistryStorage
 * @notice Describes the storage of the DataRegistry
 */
contract DataRegistryStorage {

    struct DataPoint {
        int256 dataPoint;
        bool isSet;
    }

    struct Set {
        // timestamp => DataPoint
        mapping(uint256 => DataPoint) dataPoints;
        uint256 lastUpdatedTimestamp;
        address provider;
        bool isSet;
    }

    mapping(bytes32 => Set) internal sets;
}