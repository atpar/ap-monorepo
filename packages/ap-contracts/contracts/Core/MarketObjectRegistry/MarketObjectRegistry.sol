pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./IMarketObjectRegistry.sol";
import "./MarketObjectRegistryStorage.sol";


contract MarketObjectRegistry is MarketObjectRegistryStorage, IMarketObjectRegistry, Ownable {

    event UpdatedMarketObjectProvider(bytes32 indexed marketObjectId, address provider);

    event PublishedDataPoint(bytes32 indexed marketObjectId, int256 dataPoint);


    /**
     * registers / updates a market object provider
     * @dev can only be called by the owner of the MarketObjectRegistry
     * @param marketObjectId id of the market object
     * @param provider address of the provider
     */
    function setMarketObjectProvider(
        bytes32 marketObjectId,
        address provider
    )
        public
        onlyOwner
    {
        marketObjectProviders[marketObjectId] = provider;

        emit UpdatedMarketObjectProvider(marketObjectId, provider);
    }

    /**
     * stores a new data point of a market object for a given timestamp
     * @dev can only be called by a whitelisted market object provider
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
     * returns a data point of a market object for a given timestamp
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
        returns (int256, bool)
    {
        return (
            dataPoints[marketObjectId][timestamp].dataPoint,
            dataPoints[marketObjectId][timestamp].isSet
        );
    }

    /**
     * returns the timestamp on which the last data point for a market object
     * was submitted
     * @param marketObjectId id of the market object
     * @return last updated timestamp
     */
    function getMarketObjectLastUpdatedTimestamp(bytes32 marketObjectId)
        public
        view
        returns (uint256)
    {
        return marketObjectLastUpdatedAt[marketObjectId];
    }
}
