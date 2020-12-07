

// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../IPriceOracleProxy.sol";


interface IOpenOraclePriceData {

    /**
     * @notice Read a single key from an authenticated source
     * @param source The verifiable author of the data
     * @param key The selector for the value to return
     * @return The claimed Unix timestamp for the data and the price value (defaults to (0, 0))
     */
    function get(address source, string calldata key) external view returns (uint64, uint64);
}

contract OpenOracleProxy is IPriceOracleProxy, Ownable {

    IOpenOraclePriceData public openOracle;
    address public source;


    constructor(IOpenOraclePriceData _openOracle, address _source) {
        openOracle = _openOracle;
        source = _source;
    }

    function updateSource(address _source) external onlyOwner {
        source = _source;
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }

    /**
     * @notice Returns a data point for given id.
     * @dev Has to be implement by each Oracle Feed Proxy. It should never revert.
     * @param identifier identifier of the data
     * @return Int256 value, isSet
     */
    function getData(bytes32 identifier) external view override returns (int256, bool) {
        (uint64 timestamp, uint64 value) = openOracle.get(source, bytes32ToString(identifier));
        if (timestamp == 0) return (0, false);
        return (int256(value), true);
    }
}

