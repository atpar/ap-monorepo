// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "./external/UMA/OracleInterface.sol";
import "./OracleProxyInterface.sol";

contract UMAProxy is OracleProxyInterface {

    address public umaOracle;

    constructor(address _umaOracle) public {
        umaOracle = _umaOracle;
    }

    function getDataPoint(bytes memory _ref) override public view returns (int256, bool) {
        revert();
    }

    function getDataPointAtTime(bytes memory _ref, uint256 timestamp) override public view returns (int256) {
        (bytes32 id) = abi.decode(_ref, (bytes32));
        return OracleInterface(umaOracle).getPrice(id, timestamp);
    }


    function bytesToAddress(bytes memory b) private pure returns (address addr) {
        assembly {
            addr := mload(add(b,20))
        } 
    }
}