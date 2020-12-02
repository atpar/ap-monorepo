// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;


contract OpenOracleMock {


    struct Datum {
        uint64 value;
        uint64 timestamp;
    }

    mapping (address => mapping(string => Datum)) public data;

    
    function set(address source, string memory key, uint64 value, uint64 timestamp) external {
        data[source][key] = Datum(value, timestamp);
    }
    
    function get(address source, string memory key) external view returns (uint64, uint64) {
        return (data[source][key].value, data[source][key].timestamp);  
    }
}

