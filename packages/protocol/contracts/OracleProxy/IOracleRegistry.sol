// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

interface IOracleRegistry {

    function registerOracle(address _oracle) external;
    
    function removeOracle(address _oracle) external;

    function setDataRegistry(address _dataRegistry) external;

    function getDataPoint(address _oracleProxy, bytes memory _ref) external view returns (int256, bool);
}