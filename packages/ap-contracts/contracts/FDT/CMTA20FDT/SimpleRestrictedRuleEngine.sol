// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";


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

/**
 * @title IRule
 * @dev IRule interface.
 */
interface IRule {
  function isTransferValid(address _from, address _to, uint256 _amount) external view returns (bool isValid);
  function detectTransferRestriction(address _from, address _to, uint256 _amount) external view returns (uint8);
  function canReturnTransferRestrictionCode(uint8 _restrictionCode) external view returns (bool);
  function messageForTransferRestriction(uint8 _restrictionCode) external view returns (string memory);
}

/**
 * @title IRuleEngine
 * @dev IRuleEngine 
 */
interface IRuleEngine {
  function setRules(IRule[] calldata rules) external;
  function ruleLength() external view returns (uint256);
  function rule(uint256 ruleId) external view returns (IRule);
  function rules() external view returns(IRule[] memory);
  function validateTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
  function detectTransferRestriction(address _from, address _to, uint256 _value) external view returns (uint8);
  function messageForTransferRestriction (uint8 _restrictionCode) external view returns (string memory);
}

contract SimpleRestrictedRuleEngine is IRuleEngine, Whitelistable, Restrictable {

    // ERC1404 Error codes and messages
    uint8 public constant SUCCESS_CODE = 0;
    uint8 public constant FAILURE_NON_WHITELIST = 1;
    string public constant SUCCESS_MESSAGE = "SUCCESS";
    string public constant FAILURE_NON_WHITELIST_MESSAGE = "The transfer was restricted due to white list configuration.";
    string public constant UNKNOWN_ERROR = "Unknown Error Code";


    constructor(address owner) public {
        super.__Ownable_init();
        transferOwnership(owner);
    }

    function setRules(IRule[] calldata rules) external override onlyOwner {
        revert("Can not set any additional rules");
    }
    
    function ruleLength() external view override returns (uint256) {
        return 0;
    }
    
    function rule(uint256 ruleId) external view override returns (IRule) {
        return IRule(address(0));
    }
    
    function rules() external view override returns(IRule[] memory) {
        IRule[] memory rules;
        return rules;
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

    function validateTransfer(address from, address to, uint256 amount) public view override returns (bool) {
      return detectTransferRestriction(from, to, amount) == SUCCESS_CODE;
    }
}