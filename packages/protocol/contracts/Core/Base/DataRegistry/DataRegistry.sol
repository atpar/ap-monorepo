// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./IDataRegistry.sol";
import "./DataRegistryStorage.sol";


/**
 * @title DataRegistry
 * @notice Registry for data which is published by an registered MarketObjectProvider
 */
contract DataRegistry is DataRegistryStorage, IDataRegistry, Ownable {

    event UpdatedDataProvider(bytes32 indexed setId, address provider);
    event PublishedDataPoint(bytes32 indexed setId, int256 dataPoint, uint256 timestamp);


    /**
     * @notice @notice Returns true if there is data registered for a given setId
     * @param setId setId of the data set
     * @return true if market object exists
     */
    function isRegistered(bytes32 setId)
        external
        view
        override
        returns (bool)
    {
        return sets[setId].isSet;
    }

    /**
     * @notice Returns a data point of a market object for a given timestamp.
     * @param setId id of the data set
     * @param timestamp timestamp of the data point
     * @return data point, bool indicating whether data point exists
     */
    function getDataPoint(
        bytes32 setId,
        uint256 timestamp
    )
        external
        view
        override
        returns (int256, bool)
    {
        return (
            sets[setId].dataPoints[timestamp].dataPoint,
            sets[setId].dataPoints[timestamp].isSet
        );
    }

    /**
     * @notice Returns the timestamp on which the last data point for a data set
     * was submitted.
     * @param setId id of the data set
     * @return last updated timestamp
     */
    function getLastUpdatedTimestamp(bytes32 setId)
        external
        view
        override
        returns (uint256)
    {
        return sets[setId].lastUpdatedTimestamp;
    }

    /**
     * @notice Returns the provider for a market object
     * @param setId id of the data set
     * @return address of provider
     */
    function getDataProvider(bytes32 setId)
        external
        view
        override
        returns (address)
    {
        return sets[setId].provider;
    }

    /**
     * @notice Registers / updates a market object provider.
     * @dev Can only be called by the owner of the DataRegistry.
     * @param setId id of the data set
     * @param provider address of the provider
     */
    function setDataProvider(
        bytes32 setId,
        address provider
    )
        external
        override
        onlyOwner
    {
        sets[setId].provider = provider;

        if (sets[setId].isSet == false) {
            sets[setId].isSet = true;
        }

        emit UpdatedDataProvider(setId, provider);
    }

    /**
     * @notice Stores a new data point of a data set for a given timestamp.
     * @dev Can only be called by a whitelisted data provider.
     * @param setId id of the data set
     * @param timestamp timestamp of the data point
     * @param dataPoint the data point of the data set
     */
    function publishDataPoint(
        bytes32 setId,
        uint256 timestamp,
        int256 dataPoint
    )
        external
        override
    {
        require(
            msg.sender == sets[setId].provider,
            "DataRegistry.publishDataPoint: UNAUTHORIZED_SENDER"
        );

        sets[setId].dataPoints[timestamp] = DataPoint(dataPoint, true);

        if (sets[setId].isSet == false) {
            sets[setId].isSet = true;
        }

        if (sets[setId].lastUpdatedTimestamp < timestamp) {
            sets[setId].lastUpdatedTimestamp = timestamp;
        }

        emit PublishedDataPoint(setId, dataPoint, timestamp);
    }
}
