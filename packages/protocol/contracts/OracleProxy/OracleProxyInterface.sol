// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

interface OracleProxyInterface {

    function getDataPoint(bytes memory) external view returns (int256, bool);

    function getDataPointAtTime(bytes memory, uint256 timestamp) external view returns (int256);

}