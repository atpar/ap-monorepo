pragma solidity 0.6.4;


contract CheckpointStorage {

    struct Checkpoint {
        uint256 checkpointId;
        uint256 value;
    }

    // Value of current checkpoint
    uint256 public currentCheckpointId;

    // Times at which each checkpoint was created
    uint256[] checkpointTimes;
}