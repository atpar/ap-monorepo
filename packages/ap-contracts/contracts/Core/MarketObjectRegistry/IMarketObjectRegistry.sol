pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./MarketObjectRegistryStorage.sol";


abstract contract IMarketObjectRegistry is MarketObjectRegistryStorage {

    function setMarketObjectProvider(
        bytes32 marketObjectId,
        address provider
    )
        public
        virtual;

    function publishDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp,
        int256 dataPoint
    )
        public
        virtual;

    function getDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp
    )
        public
        view
        virtual
        returns (int256, bool);

    function getMarketObjectLastUpdatedTimestamp(bytes32 marketObjectId)
        public
        view
        virtual
        returns (uint256);
}
