pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./MarketObjectRegistryStorage.sol";


contract IMarketObjectRegistry is MarketObjectRegistryStorage {

    function setMarketObjectProvider(
        bytes32 marketObjectId,
        address provider
    )
        public;

    function publishDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp,
        int256 dataPoint
    )
        public;

    function getDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp
    )
        public
        view
        returns (int256, bool);

    function getMarketObjectLastUpdatedTimestamp(bytes32 marketObjectId)
        public
        view
        returns (uint256);
}