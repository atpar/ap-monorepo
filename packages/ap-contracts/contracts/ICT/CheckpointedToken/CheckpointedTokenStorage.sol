// "SPDX-License-Identifier: Apache-2.0"
pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import "../Checkpoint/Checkpoint.sol";


contract CheckpointedTokenStorage is Checkpoint {

    Checkpoint[] checkpointTotalSupply;

    // Map each holder to a series of checkpoints
    mapping(address => Checkpoint[]) checkpointBalances;

    address[] holders;

    mapping(address => bool) holderExists;

    // Number of holders with non-zero balance
    uint256 public holderCount;
}