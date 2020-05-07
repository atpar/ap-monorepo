pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./MarketObjectRegistryStorage.sol";


abstract contract IMarketObjectRegistry is MarketObjectRegistryStorage {

    function isRegistered(bytes32 marketObjectId)
        external
        view
        virtual
        returns (bool);

    function getMarketObjectLastUpdatedTimestamp(bytes32 marketObjectId)
        external
        view
        virtual
        returns (uint256);

    function getMarketObjectProvider(bytes32 marketObjectId)
        external
        view
        virtual  
        returns (address);

    function setMarketObjectProvider(
        bytes32 marketObjectId,
        address provider
    )
        external
        virtual;

    function publishDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp,
        int256 dataPoint
    )
        external
        virtual;

    function getDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp
    )
        external
        view
        virtual
        returns (int256, bool);
}
