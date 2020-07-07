// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "./FundsDistributionToken.sol";
import "./IFundsDistributionToken.sol";
import "./IInitializableFDT.sol";

/**
 * @notice This contract allows a list of administrators to be tracked. This list can then be enforced
 * on functions with administrative permissions.  Only the owner of the contract should be allowed
 * to modify the administrator list.
 */
contract Administratable is OwnableUpgradeSafe {
    // The mapping to track administrator accounts - true is reserved for admin addresses.
    mapping(address => bool) public administrators;

    // Events to allow tracking add/remove.
    event AdminAdded(address indexed addedAdmin, address indexed addedBy);
    event AdminRemoved(address indexed removedAdmin, address indexed removedBy);

    /**
     * @notice Function modifier to enforce administrative permissions.
     */
    modifier onlyAdministrator() {
        require(
            isAdministrator(msg.sender),
            "Calling account is not an administrator."
        );
        _;
    }

    /**
     * @notice Add an admin to the list.  This should only be callable by the owner of the contract.
     */
    function addAdmin(address adminToAdd) public onlyOwner {
        // Verify the account is not already an admin
        require(
            administrators[adminToAdd] == false,
            "Account to be added to admin list is already an admin"
        );

        // Set the address mapping to true to indicate it is an administrator account.
        administrators[adminToAdd] = true;

        // Emit the event for any watchers.
        emit AdminAdded(adminToAdd, msg.sender);
    }

    /**
     * @notice Remove an admin from the list.  This should only be callable by the owner of the contract.
     */
    function removeAdmin(address adminToRemove) public onlyOwner {
        // Verify the account is an admin
        require(
            administrators[adminToRemove] == true,
            "Account to be removed from admin list is not already an admin"
        );

        // Set the address mapping to false to indicate it is NOT an administrator account.
        administrators[adminToRemove] = false;

        // Emit the event for any watchers.
        emit AdminRemoved(adminToRemove, msg.sender);
    }

    /**
     * @notice Determine if the message sender is in the administrators list.
     */
    function isAdministrator(address addressToTest) public view returns (bool) {
        return administrators[addressToTest];
    }
}

/**
 * @notice Keeps track of whitelists and can check if sender and reciever are configured to allow a transfer.
 * Only administrators can update the whitelists.
 * Any address can only be a member of one whitelist at a time.
 */
contract Whitelistable is Administratable {
    // Zero is reserved for indicating it is not on a whitelist
    uint8 constant internal NO_WHITELIST = 0;

    // The mapping to keep track of which whitelist any address belongs to.
    // 0 is reserved for no whitelist and is the default for all addresses.
    mapping(address => uint8) public addressWhitelists;

    // The mapping to keep track of each whitelist's outbound whitelist flags.
    // Boolean flag indicates whether outbound transfers are enabled.
    mapping(uint8 => mapping(uint8 => bool)) public outboundWhitelistsEnabled;

    // Events to allow tracking add/remove.
    event AddressAddedToWhitelist(
        address indexed addedAddress,
        uint8 indexed whitelist,
        address indexed addedBy
    );
    event AddressRemovedFromWhitelist(
        address indexed removedAddress,
        uint8 indexed whitelist,
        address indexed removedBy
    );
    event OutboundWhitelistUpdated(
        address indexed updatedBy,
        uint8 indexed sourceWhitelist,
        uint8 indexed destinationWhitelist,
        bool from,
        bool to
    );

    /**
     * @notice Sets an address's white list ID.  Only administrators should be allowed to update this.
     * If an address is on an existing whitelist, it will just get updated to the new value (removed from previous).
     */
    function addToWhitelist(address addressToAdd, uint8 whitelist)
        public
        onlyAdministrator
    {
        // Verify the whitelist is valid
        require(whitelist != NO_WHITELIST, "Invalid whitelist ID supplied");

        // Save off the previous white list
        uint8 previousWhitelist = addressWhitelists[addressToAdd];

        // Set the address's white list ID
        addressWhitelists[addressToAdd] = whitelist;

        // If the previous whitelist existed then we want to indicate it has been removed
        if (previousWhitelist != NO_WHITELIST) {
            // Emit the event for tracking
            emit AddressRemovedFromWhitelist(
                addressToAdd,
                previousWhitelist,
                msg.sender
            );
        }

        // Emit the event for new whitelist
        emit AddressAddedToWhitelist(addressToAdd, whitelist, msg.sender);
    }

    /**
     * @notice Clears out an address's white list ID.  Only administrators should be allowed to update this.
     */
    function removeFromWhitelist(address addressToRemove)
        public
        onlyAdministrator
    {
        // Save off the previous white list
        uint8 previousWhitelist = addressWhitelists[addressToRemove];

        // Zero out the previous white list
        addressWhitelists[addressToRemove] = NO_WHITELIST;

        // Emit the event for tracking
        emit AddressRemovedFromWhitelist(
            addressToRemove,
            previousWhitelist,
            msg.sender
        );
    }

    /**
     * @notice Sets the flag to indicate whether source whitelist is allowed to send to destination whitelist.
     * Only administrators should be allowed to update this.
     */
    function updateOutboundWhitelistEnabled(
        uint8 sourceWhitelist,
        uint8 destinationWhitelist,
        bool newEnabledValue
    ) public onlyAdministrator {
        // Get the old enabled flag
        bool oldEnabledValue = outboundWhitelistsEnabled[sourceWhitelist][destinationWhitelist];

        // Update to the new value
        outboundWhitelistsEnabled[sourceWhitelist][destinationWhitelist] = newEnabledValue;

        // Emit event for tracking
        emit OutboundWhitelistUpdated(
            msg.sender,
            sourceWhitelist,
            destinationWhitelist,
            oldEnabledValue,
            newEnabledValue
        );
    }

    /**
     * @notice Determine if the a sender is allowed to send to the receiver.
     * The source whitelist must be enabled to send to the whitelist where the receive exists.
     */
    function checkWhitelistAllowed(address sender, address receiver)
        public
        view
        returns (bool)
    {
        // First get each address white list
        uint8 senderWhiteList = addressWhitelists[sender];
        uint8 receiverWhiteList = addressWhitelists[receiver];

        // If either address is not on a white list then the check should fail
        if (
            senderWhiteList == NO_WHITELIST || receiverWhiteList == NO_WHITELIST
        ) {
            return false;
        }

        // Determine if the sending whitelist is allowed to send to the destination whitelist
        return outboundWhitelistsEnabled[senderWhiteList][receiverWhiteList];
    }
}

/**
 * @notice Restrictions start off as enabled. Once they are disabled, they cannot be re-enabled.
 * Only the owner may disable restrictions.
 */
contract Restrictable is OwnableUpgradeSafe {
    // State variable to track whether restrictions are enabled.  Defaults to true.
    bool private _restrictionsEnabled = true;

    // Event emitted when flag is disabled
    event RestrictionsDisabled(address indexed owner);

    /**
     * @notice Function to update the enabled flag on restrictions to disabled.  Only the owner should be able to call.
     * This is a permanent change that cannot be undone
     */
    function disableRestrictions() public onlyOwner {
        require(_restrictionsEnabled, "Restrictions are already disabled.");

        // Set the flag
        _restrictionsEnabled = false;

        // Trigger the event
        emit RestrictionsDisabled(msg.sender);
    }

    /**
     * @notice View function to determine if restrictions are enabled
     */
    function isRestrictionEnabled() public view returns (bool) {
        return _restrictionsEnabled;
    }
}

abstract contract ERC1404 is IERC20 {

    /**
     * @notice Detects if a transfer will be reverted and if so returns an appropriate reference code
     * @param from Sending address
     * @param to Receiving address
     * @param value Amount of tokens being transferred
     * @return Code by which to reference message for rejection reasoning
     * @dev Overwrite with your custom transfer restriction logic
     */
    function detectTransferRestriction(address from, address to, uint256 value)
        public
        view
        virtual
        returns (uint8);

    /**
     * @notice Returns a human-readable message for a given restriction code
     * @param restrictionCode Identifier for looking up a message
     * @return Text showing the restriction's reasoning
     * @dev Overwrite with your custom message and restrictionCode handling
     */
    function messageForTransferRestriction(uint8 restrictionCode)
        public
        view
        virtual
        returns (string memory);
}

contract SimpleRestrictedUpgradeSafeFDT is
    IFundsDistributionToken,
    IInitializableFDT,
    FundsDistributionToken,
    ERC1404,
    Whitelistable,
    Restrictable
{
    using SafeMathUint for uint256;
    using SafeMathInt for int256;

    // ERC1404 Error codes and messages
    uint8 public constant SUCCESS_CODE = 0;
    uint8 public constant FAILURE_NON_WHITELIST = 1;
    string public constant SUCCESS_MESSAGE = "SUCCESS";
    string public constant FAILURE_NON_WHITELIST_MESSAGE = "The transfer was restricted due to white list configuration.";
    string public constant UNKNOWN_ERROR = "Unknown Error Code";

    // token in which the funds can be sent to the FundsDistributionToken
    IERC20 public fundsToken;

    // balance of fundsToken that the FundsDistributionToken currently holds
    uint256 public fundsTokenBalance;

    modifier onlyFundsToken() {
        require(
            msg.sender == address(fundsToken),
            "SimpleRestrictedFDT.onlyFundsToken: UNAUTHORIZED_SENDER"
        );
        _;
    }

    /**
  	 * @notice Evaluates whether a transfer should be allowed or not.
  	 */
    modifier notRestricted(address from, address to, uint256 value) {
        uint8 restrictionCode = detectTransferRestriction(from, to, value);
        require(
            restrictionCode == SUCCESS_CODE,
            messageForTransferRestriction(restrictionCode)
        );
        _;
    }

    /**
	 * @notice Withdraws all available funds for a token holder
	 */
    function withdrawFunds() external override {
        _withdrawFundsFor(msg.sender);
    }

    /**
	 * @notice Register a payment of funds in tokens. May be called directly after a deposit is made.
	 * @dev Calls _updateFundsTokenBalance(), whereby the contract computes the delta of the previous and the new
	 * funds token balance and increments the total received funds (cumulative) by delta by calling _registerFunds()
	 */
    function updateFundsReceived() external {
        int256 newFunds = _updateFundsTokenBalance();

        if (newFunds > 0) {
            _distributeFunds(newFunds.toUint256Safe());
        }
    }

    /**
     * @notice Initialize a new Proxy instance storage
     * @dev "constructor" the Proxy shall delegatecall on deployment
     */
    function initialize(
        string memory name,
        string memory symbol,
        IERC20 _fundsToken,
        address owner,
        uint256 initialAmount
    ) public override initializer {
        require(
            address(_fundsToken) != address(0),
            "SimpleRestrictedFDT: INVALID_FUNDS_TOKEN_ADDRESS"
        );

        super.__ERC20_init(name, symbol);
        super.__Ownable_init();

        fundsToken = _fundsToken;
        transferOwnership(owner);
        _mint(owner, initialAmount);
    }

    /**
     * @notice Withdraws funds for a set of token holders
     */
    function pushFunds(address[] memory owners) public {
        for (uint256 i = 0; i < owners.length; i++) {
            _withdrawFundsFor(owners[i]);
        }
    }

    /**
  	 * @notice Overrides the parent class token transfer function to enforce restrictions.
  	 */
    function transfer(address to, uint256 value)
        public
        notRestricted(msg.sender, to, value)
        override(IERC20, ERC20UpgradeSafe)
        returns (bool success)
    {
        success = super.transfer(to, value);
    }

    /**
  	 * @notice Overrides the parent class token transferFrom function to enforce restrictions.
  	 */
    function transferFrom(address from, address to, uint256 value)
        public
        notRestricted(from, to, value)
        override(IERC20, ERC20UpgradeSafe)
        returns (bool success)
    {
        success = super.transferFrom(from, to, value);
    }

    /**
     * @notice Exposes the ability to mint new FDTs for a given account. Caller has to be the owner of the FDT.
     */
    function mint(address account, uint256 amount) public onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }

    /**
     * @notice Exposes the ability to burn exisiting FDTs for a given account. Caller has to be the owner of the FDT.
     */
    function burn(address account, uint256 amount) public onlyOwner returns (bool) {
        _burn(account, amount);
        return true;
    }

    /**
  	 * @notice This function detects whether a transfer should be restricted and not allowed.
  	 * If the function returns SUCCESS_CODE (0) then it should be allowed.
  	 */
    function detectTransferRestriction(address from, address to, uint256)
        public
        view
        override
        returns (uint8)
    {
        // If the restrictions have been disabled by the owner, then just return success
        // Logic defined in Restrictable parent class
        if (!isRestrictionEnabled()) {
            return SUCCESS_CODE;
        }

        // If the contract owner is transferring, then ignore reistrictions
        if (from == owner()) {
            return SUCCESS_CODE;
        }

        // Restrictions are enabled, so verify the whitelist config allows the transfer.
        // Logic defined in Whitelistable parent class
        if (!checkWhitelistAllowed(from, to)) {
            return FAILURE_NON_WHITELIST;
        }

        // If no restrictions were triggered return success
        return SUCCESS_CODE;
    }

    /**
  	 * @notice This function allows a wallet or other client to get a human readable string to show
  	 * a user if a transfer was restricted.  It should return enough information for the user
  	 * to know why it failed.
  	 */
    function messageForTransferRestriction(uint8 restrictionCode)
        public
        view
        override
        returns (string memory)
    {
        if (restrictionCode == SUCCESS_CODE) {
            return SUCCESS_MESSAGE;
        }

        if (restrictionCode == FAILURE_NON_WHITELIST) {
            return FAILURE_NON_WHITELIST_MESSAGE;
        }

        // An unknown error code was passed in.
        return UNKNOWN_ERROR;
    }

    /**
     * @notice Withdraws all available funds for a token holder
     */
    function _withdrawFundsFor(address owner) internal {
        uint256 withdrawableFunds = _prepareWithdrawFor(owner);

        require(
            fundsToken.transfer(owner, withdrawableFunds),
            "SimpleRestrictedFDT.withdrawFunds: TRANSFER_FAILED"
        );

        _updateFundsTokenBalance();
    }

    /**
	 * @dev Updates the current funds token balance
	 * and returns the difference of new and previous funds token balances
	 * @return A int256 representing the difference of the new and previous funds token balance
	 */
    function _updateFundsTokenBalance() internal returns (int256) {
        uint256 prevFundsTokenBalance = fundsTokenBalance;

        fundsTokenBalance = fundsToken.balanceOf(address(this));

        return int256(fundsTokenBalance).sub(int256(prevFundsTokenBalance));
    }
}
