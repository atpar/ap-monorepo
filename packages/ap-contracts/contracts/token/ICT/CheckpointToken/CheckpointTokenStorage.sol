pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import "../Checkpoint/Checkpoint.sol";


contract CheckpointedTokenStorage is Checkpoint {

    // Mapping of checkpoints that relate to total supply
    mapping(uint256 => uint256) checkpointTotalSupply;

    // Map each holder to a series of checkpoints
    mapping(address => Checkpoint[]) checkpointBalances;

    address[] holders;

    mapping(address => bool) holderExists;

    // Number of holders with non-zero balance
    uint256 public holderCount;
}