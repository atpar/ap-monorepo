pragma solidity 0.6.4;

/**
 * @title Holds the storage variable for the FDTCheckpoint (i.e ERC20, Ether)
 * @dev abstract contract
 */
contract DepositCheckpointStorage {

    struct Deposit {
        // Id of CheckpointedToken checkpoint
        uint256 checkpointId;
        // Event which corresponds to the Deposit 
        bytes32 _event;
        // Time at which the deposit was created
        uint256 created;
        // Deposit amount in WEI 
        uint256 amount;
        // Amount of funds claimed so far
        uint256 claimedAmount;
        // Total supply at the associated checkpoint (avoids recalculating this)
        uint256 totalSupply;
        // Total supply of the whitelisted token holders (only used if Deposit is marked as restricted)
        uint256 totalSupplyOfWhitelistedHolders;
        // Indicates whether only a subset of holders can claim their share of the deposit
        bool isRestrictedDeposit;
        // List of addresses which have withdrawn their share of funds of the deposit
        mapping (address => bool) claimed;
        // Subset of holders which can claim their share of funds of the deposit
        mapping (address => bool) whitelistedHolders;
    }

    // List of all deposits
    Deposit[] public deposits;
}