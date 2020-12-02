// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../IObserverOracleProxy.sol";
import "./IDataRegistryProxy.sol";


/**
 * @title DataRegistryProxy
 * @notice Registry for data which is published by an registered MarketObjectProvider
 */
contract DataRegistryProxy is IDataRegistryProxy, IObserverOracleProxy, Ownable {

    event UpdatedDataProvider(bytes32 indexed setId, address provider);
    event PublishedDataPoint(bytes32 indexed setId, int256 dataPoint, uint256 timestamp);

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

    // SetId => Set
    mapping(bytes32 => Set) internal sets;


    /**
     * @notice @notice Returns true if there is data registered for a given setId
     * @param setId setId of the data set
     * @return true if data set exists
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
     * @notice Returns a data point of a data set for a given timestamp.
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
        override(IDataRegistryProxy, IObserverOracleProxy)
        returns (int256, bool)
    {
        return (
            sets[setId].dataPoints[timestamp].dataPoint,
            sets[setId].dataPoints[timestamp].isSet
        );
    }

    /**
     * @notice Returns most recent data point of a data set.
     * @param setId id of the data set
     * @return data point, bool indicating whether data point exists
     */
    function getMostRecentDataPoint(bytes32 setId)
        external
        view
        override(IDataRegistryProxy, IObserverOracleProxy)
        returns (int256, bool)
    {
        uint256 lastUpdatedTimestamp = sets[setId].lastUpdatedTimestamp;

        return (
            sets[setId].dataPoints[lastUpdatedTimestamp].dataPoint,
            sets[setId].dataPoints[lastUpdatedTimestamp].isSet
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
     * @notice Returns the provider for a data set
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
     * @notice Registers / updates a data set provider.
     * @dev Can only be called by the owner of the DataRegistryProxy.
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
