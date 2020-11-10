// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "../IOracleProxy.sol";
import "./OracleInterface.sol";


contract UMAProxy is IOracleProxy {

    address public umaOracle;


    constructor(address _umaOracle) {
        umaOracle = _umaOracle;
    }

    function getDataPoint(bytes32 identifier, uint256 timestamp)
        override
        public
        view
        returns (int256, bool)
    {
        if (OracleInterface(umaOracle).hasPrice(identifier, timestamp) == false) {
            return (int256(0), false);
        }

        return (
            OracleInterface(umaOracle).getPrice(identifier, timestamp),
            true
        );
    }
}