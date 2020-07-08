// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "./MarketObjectRegistryStorage.sol";


interface IMarketObjectRegistry {

    function isRegistered(bytes32 marketObjectId)
        external
        view
        returns (bool);

    function getMarketObjectLastUpdatedTimestamp(bytes32 marketObjectId)
        external
        view
        returns (uint256);

    function getMarketObjectProvider(bytes32 marketObjectId)
        external
        view
        returns (address);

    function setMarketObjectProvider(
        bytes32 marketObjectId,
        address provider
    )
        external;

    function publishDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp,
        int256 dataPoint
    )
        external;

    function getDataPointOfMarketObject(
        bytes32 marketObjectId,
        uint256 timestamp
    )
        external
        view
        returns (int256, bool);
}
