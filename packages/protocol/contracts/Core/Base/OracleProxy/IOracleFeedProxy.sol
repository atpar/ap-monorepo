
// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;


interface IOracleFeedProxy {

    /**
     * @notice Returns a data point for given id.
     * @dev Has to be implement by each Oracle Feed Proxy. It should never revert.
     * @param identifier identifier of the data
     * @return Int256 value, isSet
     */
    function getData(bytes32 identifier) external view returns (int256, bool);
}

