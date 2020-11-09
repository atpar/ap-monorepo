// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./OracleProxyInterface.sol";
import "./IOracleRegistry.sol";

contract OracleRegistry is IOracleRegistry, Ownable {

    mapping (address => bool) public oracleWhitelist;

    address public dataRegistry;

    function registerOracle(address _oracle) external override onlyOwner {
        oracleWhitelist[_oracle] = true;
    }
    
    function removeOracle(address _oracle) external override onlyOwner {
        oracleWhitelist[_oracle] = false;
    }

    function setDataRegistry(address _dataRegistry) external override onlyOwner {
        oracleWhitelist[_dataRegistry] = true;
        dataRegistry = _dataRegistry;
    }

    function getDataPoint(address _oracleProxy, bytes memory _ref) external override view returns (int256, bool) {
        if (_oracleProxy == address(0)) {
            require(oracleWhitelist[dataRegistry], "OracleRegistry.getDataPoint: dataRegistry not whitelisted");
            return OracleProxyInterface(dataRegistry).getDataPoint(_ref);
        } else {
            require(oracleWhitelist[_oracleProxy], "OracleRegistry.getDataPoint: Oracle not whitelisted");
            return OracleProxyInterface(_oracleProxy).getDataPoint(_ref);
        }
    }
    
}