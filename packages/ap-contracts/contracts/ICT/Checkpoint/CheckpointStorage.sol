// "SPDX-License-Identifier: Apache-2.0"
pragma solidity 0.6.10;


contract CheckpointStorage {

    /** 
     * @dev `Checkpoint` is the structure that attaches a timestamp to a 
     * given value, the timestamp attached is the one that last changed the value
     */
    struct Checkpoint {
        // `timestamp` is the timestamp that the value was generated from
        uint128 timestamp;
        // `value` is the amount of tokens at a specific timestamp
        uint256 value;
    }
}