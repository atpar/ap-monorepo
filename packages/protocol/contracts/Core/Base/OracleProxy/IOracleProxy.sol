// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;


interface IOracleProxy {

    /**
     * @notice Returns a data point for given id and timestamp.
     * @dev Has to be implement by each Oracle Proxy. It should never revert.
     * @param identifier identifier of the data
     * @param timestamp timestamp of
     * @return Int256 value, isSet
     */
    function getDataPoint(bytes32 identifier, uint256 timestamp) external view returns (int256, bool);

    /**
     * @notice Returns the most recent data point for given id.
     * @dev Has to be implement by each Oracle Proxy. It should never revert.
     * @param identifier identifier of the data
     * @return Int256 value, isSet
     */
    function getMostRecentDataPoint(bytes32 identifier) external view returns (int256, bool);
}