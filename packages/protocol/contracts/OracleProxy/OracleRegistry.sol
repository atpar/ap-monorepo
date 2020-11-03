// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./OracleProxyInterface.sol";

contract OracleRegistry is Ownable {

    mapping (address => bool) public oracleWhitelist;

    function registerOracle(address _oracle) public onlyOwner {
        oracleWhitelist[_oracle] = true;
    }
    
    function removeOracle(address _oracle) public onlyOwner {
        oracleWhitelist[_oracle] = false;
    }

    function getDataPoint(address _oracleProxy, bytes memory _ref) public view returns (int256) {
        require(oracleWhitelist[_oracleProxy], "OracleRegistry.getDataPoint: Oracle not whitelisted");
        return OracleProxyInterface(_oracleProxy).getDataPoint(_ref);
    }
    
}