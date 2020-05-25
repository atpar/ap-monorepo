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

    struct MarketObject {
        // timestamp => DataPoint
        mapping(uint256 => DataPoint) dataPoints;
        uint256 lastUpdatedTimestamp;
        address provider;
        bool isSet;
    }

    mapping(bytes32 => MarketObject) internal marketObjects;
}