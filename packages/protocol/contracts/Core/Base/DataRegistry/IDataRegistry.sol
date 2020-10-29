// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./DataRegistryStorage.sol";


interface IDataRegistry {

    function isRegistered(bytes32 setId)
        external
        view
        returns (bool);

    function getLastUpdatedTimestamp(bytes32 setId)
        external
        view
        returns (uint256);

    function getDataProvider(bytes32 setId)
        external
        view
        returns (address);

    function setDataProvider(
        bytes32 setId,
        address provider
    )
        external;

    function publishDataPoint(
        bytes32 setId,
        uint256 timestamp,
        int256 dataPoint
    )
        external;

    function getDataPoint(
        bytes32 setId,
        uint256 timestamp
    )
        external
        view
        returns (int256, bool);
}
