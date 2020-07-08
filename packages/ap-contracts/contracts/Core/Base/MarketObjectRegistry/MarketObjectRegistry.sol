// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/access/Ownable.sol";

import "./IMarketObjectRegistry.sol";
import "./MarketObjectRegistryStorage.sol";


/**
 * @title MarketObjectRegistry
 * @notice Registry for data corresponding to a market object which is provided
 * by an registered MarketObjectProvider
 */
contract MarketObjectRegistry is MarketObjectRegistryStorage, IMarketObjectRegistry, Ownable {

    event UpdatedMarketObjectProvider(bytes32 indexed marketObjectId, address provider);

    event PublishedDataPoint(bytes32 indexed marketObjectId, int256 dataPoint, uint256 timestamp);


    /**
     * @notice @notice Returns true if there is a market object registered for a given marketObjectId
     * @param marketObjectId id of the market object
     * @return true if market object exists
     */
    function isRegistered(bytes32 marketObjectId)
        external
        view
        override
        returns (bool)
    {
        return marketObjects[marketObjectId].isSet;
    }

    /**
     * @notice Returns a data point of a market object for a given timestamp.
     * @param marketObjectId id of the market object
     * @param timestamp timestamp of the data point
     * @return data point, bool indicating whether data point exists
     */
    function getDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp
    )
        external
        view
        override
        returns (int256, bool)
    {
        return (
            marketObjects[marketObjectId].dataPoints[timestamp].dataPoint,
            marketObjects[marketObjectId].dataPoints[timestamp].isSet
        );
    }

    /**
     * @notice Returns the timestamp on which the last data point for a market object
     * was submitted.
     * @param marketObjectId id of the market object
     * @return last updated timestamp
     */
    function getMarketObjectLastUpdatedTimestamp(bytes32 marketObjectId)
        external
        view
        override
        returns (uint256)
    {
        return marketObjects[marketObjectId].lastUpdatedTimestamp;
    }

    /**
     * @notice Returns the provider for a market object
     * @param marketObjectId id of the market object
     * @return address of provider
     */
    function getMarketObjectProvider(bytes32 marketObjectId)
        external
        view
        override
        returns (address)
    {
        return marketObjects[marketObjectId].provider;
    }

    /**
     * @notice Registers / updates a market object provider.
     * @dev Can only be called by the owner of the MarketObjectRegistry.
     * @param marketObjectId id of the market object
     * @param provider address of the provider
     */
    function setMarketObjectProvider(
        bytes32 marketObjectId,
        address provider
    )
        external
        override
        onlyOwner
    {
        marketObjects[marketObjectId].provider = provider;

        if (marketObjects[marketObjectId].isSet == false) {
            marketObjects[marketObjectId].isSet = true;
        }

        emit UpdatedMarketObjectProvider(marketObjectId, provider);
    }

    /**
     * @notice Stores a new data point of a market object for a given timestamp.
     * @dev Can only be called by a whitelisted market object provider.
     * @param marketObjectId id of the market object (see ACTUS spec.)
     * @param timestamp timestamp of the data point
     * @param dataPoint the data point for the market object
     */
    function publishDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp,
        int256 dataPoint
    )
        external
        override
    {
        require(
            msg.sender == marketObjects[marketObjectId].provider,
            "MarketObjectRegistry.publishMarketObject: UNAUTHORIZED_SENDER"
        );

        marketObjects[marketObjectId].dataPoints[timestamp] = DataPoint(dataPoint, true);

        if (marketObjects[marketObjectId].isSet == false) {
            marketObjects[marketObjectId].isSet = true;
        }

        if (marketObjects[marketObjectId].lastUpdatedTimestamp < timestamp) {
            marketObjects[marketObjectId].lastUpdatedTimestamp = timestamp;
        }

        emit PublishedDataPoint(marketObjectId, dataPoint, timestamp);
    }
}
