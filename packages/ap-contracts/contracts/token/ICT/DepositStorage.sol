pragma solidity 0.6.4;

/**
 * @title Holds the storage variable for the FDTCheckpoint (i.e ERC20, Ether)
 * @dev abstract contract
 */
contract DepositStorage {

    struct Deposit {
        // Time at which the deposit was created
        uint256 created;
        // Deposit amount in WEI 
        uint256 amount;
        // Amount of funds claimed so far
        uint256 claimedAmount;
        // Sum of the balances of the whitelisted token holders (only used if Deposit is marked as restricted)
        uint256 totalBalanceOfWhitelistedHolders;
        // Indicates whether only a subset of holders can claim their share of the deposit
        bool isRestrictedDeposit;
        // Address of the token in which the deposit is made
        address token;
        // List of addresses which have withdrawn their share of funds of the deposit
        mapping (address => bool) claimed;
        // Subset of holders which can claim their share of funds of the deposit
        mapping (address => bool) whitelistedHolders;
    }

    // event => Deposit
    mapping(bytes32 => Deposit) public depositForEvent;
}