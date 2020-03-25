pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./IMarketObjectRegistry.sol";
import "./MarketObjectRegistryStorage.sol";


/**
 * @title MarketObjectRegistry
 * @notice Registry for data corresponding to a market object which is provided
 * by an registered MarketObjectProvider
 */
contract MarketObjectRegistry is MarketObjectRegistryStorage, IMarketObjectRegistry, Ownable {

    event UpdatedMarketObjectProvider(bytes32 indexed marketObjectId, address provider);

    event PublishedDataPoint(bytes32 indexed marketObjectId, int256 dataPoint);


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
        public
        override
        onlyOwner
    {
        marketObjectProviders[marketObjectId] = provider;

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
        public
        override
    {
        require(
            msg.sender == marketObjectProviders[marketObjectId],
            "MarketObjectRegistry.publishMarketObject: UNAUTHORIZED_SENDER"
        );

        dataPoints[marketObjectId][timestamp] = DataPoint(dataPoint, true);
        marketObjectLastUpdatedAt[marketObjectId] = timestamp;

        emit PublishedDataPoint(marketObjectId, dataPoint);
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
        public
        view
        override
        returns (int256, bool)
    {
        return (
            dataPoints[marketObjectId][timestamp].dataPoint,
            dataPoints[marketObjectId][timestamp].isSet
        );
    }

    /**
     * @notice Returns the timestamp on which the last data point for a market object
     * was submitted.
     * @param marketObjectId id of the market object
     * @return last updated timestamp
     */
    function getMarketObjectLastUpdatedTimestamp(bytes32 marketObjectId)
        public
        view
        override
        returns (uint256)
    {
        return marketObjectLastUpdatedAt[marketObjectId];
    }
}
