pragma solidity 0.6.4;
pragma experimental ABIEncoderV2;

import "./CheckpointStorage.sol";


contract Checkpoint is CheckpointStorage {

    // Emit when new checkpoint created
    event CheckpointCreated(uint256 indexed checkpointId);

    /**
     * @notice Queries a value at a defined checkpoint
     * @param checkpoints array of Checkpoint objects
     * @param timestamp timestamp to retrieve the value at
     * @return uint256
     */
    function getValueAt(
        Checkpoint[] storage checkpoints,
        uint256 timestamp
    ) 
        internal
        view 
        returns (uint256)
    {
        // initially return 0
        if (checkpoints.length == 0) return 0;

        // Shortcut for the actual value
        if (timestamp >= checkpoints[checkpoints.length - 1].timestamp)
            return checkpoints[checkpoints.length - 1].value;
        if (timestamp < checkpoints[0].timestamp) return 0;

        // Binary search of the value in the array
        uint256 min = 0;
        uint256 max = checkpoints.length - 1;
        while (max > min) {
            uint256 mid = (max + min + 1) / 2;
            if (checkpoints[mid].timestamp <= timestamp) {
                min = mid;
            } else {
                max = mid - 1;
            }
        }
        return checkpoints[min].value;
    }

    /**
     * @notice Create a new checkpoint for a value if
     * there does not exist a checkpoint for the current block timestamp,
     * otherwise updates the value of the current checkpoint.
     * @param checkpoints Checkpointed values
     * @param value Value to be updated
     */ 
    function updateValueAtNow(
        Checkpoint[] storage checkpoints,
        uint value
    )
        internal
    {
        // create a new checkpoint if:
        // - there are no checkpoints
        // - the current block has a greater timestamp than the last checkpoint
        // otherwise update value at current checkpoint
        if (
            checkpoints.length == 0
            || (block.timestamp > checkpoints[checkpoints.length - 1].timestamp)
        ) {
            // create checkpoint with value
            checkpoints.push(Checkpoint({ timestamp: uint128(block.timestamp), value: value }));

            emit CheckpointCreated(checkpoints.length - 1);
            
        } else {
            // update value at current checkpoint
            Checkpoint storage oldCheckPoint = checkpoints[checkpoints.length - 1];
            oldCheckPoint.value = value;
        }
    }
}