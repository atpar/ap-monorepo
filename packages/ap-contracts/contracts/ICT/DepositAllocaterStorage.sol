// "SPDX-License-Identifier: Apache-2.0"
pragma solidity 0.6.11;

/**
 * @title Holds the storage variable for the FDTCheckpoint (i.e ERC20, Ether)
 * @dev abstract contract
 */
contract DepositAllocaterStorage {

    struct Deposit {
        // Time at which the deposit is scheduled for
        uint256 scheduledFor;
        // Deposit amount in WEI
        uint256 amount;
        // Amount of funds claimed so far
        uint256 claimedAmount;
        // Sum of the signaled tokens of whitelisted token holders (only used if isWhitelisted == true)
        uint256 totalAmountSignaled;
        // Address of the token in which the deposit is made
        address token;
        // Indicates whether hodlers have to signal in advance to claim their share of the deposit
        bool onlySignaled;
        // List of addresses which have withdrawn their share of funds of the deposit
        mapping (address => bool) claimed;
        // Subset of holders which can claim their share of funds of the deposit
        mapping (address => uint256) signaledAmounts;
    }

    // depositId => Deposit
    mapping(bytes32 => Deposit) public deposits;
    mapping(address => uint256) public totalAmountSignaledByHolder;

    // Reserved
    uint256[10] private __gap;
}
