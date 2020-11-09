// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;


import "../Core/Base/DataRegistry/IDataRegistry.sol";
import "./OracleProxyInterface.sol";

contract DataRegistryProxy is OracleProxyInterface {

    address public dataRegistry;

    constructor(address _dataRegistry) public {
        dataRegistry = _dataRegistry;
    }

    function setDataRegistryAddress(address _a) public {
        dataRegistry = _a;
    }

    function getDataPoint(bytes memory _refData) override public view returns (int256, bool) {
        (bytes32 id, uint256 timestamp) = abi.decode(_refData,(bytes32,uint256));
        return IDataRegistry(dataRegistry).getDataPoint(id, timestamp);
    }

    
    function getDataPointAtTime(bytes memory _ref, uint256 timestamp) override public view returns (int256) {
        revert("Not supported");
    }
}