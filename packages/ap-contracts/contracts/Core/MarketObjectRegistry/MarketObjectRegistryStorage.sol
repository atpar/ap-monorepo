pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


/**
 * @title MarketObjectRegistryStorage
 * @notice Describes the storage of the MarketObjectRegistry
 */
contract MarketObjectRegistryStorage is SharedTypes {

    struct DataPoint {
        int256 dataPoint;
        bool isSet;
    }

    // marketObjectId => timestamp => DataPoint
    mapping(bytes32 => mapping(uint256 => DataPoint)) dataPoints;
    // marketObjectId => lastUpdatedTimestamp
    mapping(bytes32 => uint256) marketObjectLastUpdatedAt;
    // marketObjectId => marketObjectProvider
    mapping(bytes32 => address) marketObjectProviders;
}