// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;

contract Whitelist {

    event WhitelistAccountAdded(address indexed account, address indexed caller);
    event WhitelistAccountRemoved(address indexed account, address indexed caller);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    address public owner;
    mapping (address => bool) whitelist;

    constructor () internal {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @dev Throws if caller is not contract owner
     */
    modifier onlyOwner() {
        require(owner == msg.sender, "Whitelist: caller is not the owner");
        _;
    }

    /**
     * @dev Throws if caller is not whitelisted OR the contract owner
     */
    modifier onlyWhitelisted() {
        require(whitelist[msg.sender] || owner == msg.sender, "Whitelist: caller is not whitelisted");
        _;
    }

    /**
     * @dev Returns true if account is whitelisted
     */
    function isWhitelisted(address account) public view returns (bool) {
        return whitelist[account];
    }

    /**
     * @dev Adds an account to the whitelist
     */
    function addToWhitelist(address account)
        external
        onlyWhitelisted
    {
        whitelist[account] = true;
        emit WhitelistAccountAdded(account, msg.sender);
    }

    /**
     * @dev Removes an account from the whitelist
     */
    function removeFromWhitelist(address account)
        external
        onlyWhitelisted
    {
        whitelist[account] = false;
        emit WhitelistAccountRemoved(account, msg.sender);
    }

    /**
     * @dev Transfers ownership of the contract to a new account
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        emit OwnershipTransferred(msg.sender, newOwner);
        owner = newOwner;
    }


}