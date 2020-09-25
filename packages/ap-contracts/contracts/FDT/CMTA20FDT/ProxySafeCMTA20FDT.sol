// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Pausable.sol";
import "../FundsDistributionToken.sol";
import "../IFundsDistributionToken.sol";
import "../IInitializableFDT.sol";


/**
 * @title IContactable
 * @dev IContactable interface
 * @author Sébastien Krafft - <sebastien.krafft@mtpelerin.com>
 */
interface IContactable {
  /**
   * @notice Purpose: this event is emitted when the contact information is changed
   * @param contact - new contact information
   */
  event LogContactSet(string contact);

  function setContact(string calldata _contact) external;
  function contact() external view returns (string memory);
}

/**
 * @title IDestroyable
 * @dev IDestroyable interface
 * @author Sébastien Krafft - <sebastien.krafft@mtpelerin.com>
 */
interface IDestroyable {
  /**
   * @notice Purpose: this event is emitted when issued tokens are destroyed.
   * @param shareholders - list of shareholders of destroyed tokens
   */
  event LogDestroyed(address[] shareholders);

  /**
   * @notice Purpose: to destroy issued tokens.
   * Conditions: only issuer can execute this function.
   * @param shareholders - list of shareholders
   */
  function destroy(address[] calldata shareholders) external;
}

/**
 * @title IIdentifiable
 * @dev IIdentifiable interface
 * @author Sébastien Krafft - <sebastien.krafft@mtpelerin.com>
 */
interface IIdentifiable {
  function setMyIdentity(bytes calldata _identity) external;
  function identity(address shareholder) external view returns (bytes memory);
}

/**
 * @title IIssuable
 * @dev IIssuable interface
 * @author Sébastien Krafft - <sebastien.krafft@mtpelerin.com>
 */
interface IIssuable {
  /**
   * @notice Purpose: this event is emitted when new tokens are issued.
   * @param value - amount of newly issued tokens
   */
  event LogIssued(uint256 value);
  /**
  * @notice Purpose: this event is emitted when tokens are redeemed.
  * @param value - amount of redeemed tokens
  */
  event LogRedeemed(uint256 value);

  function issue(uint256 value) external;
  function redeem(uint256 value) external;
}

/**
 * @title IReassignable
 * @dev IReassignable interface
 * @author Sébastien Krafft - <sebastien.krafft@mtpelerin.com>
 */
interface IReassignable {
  /**
   * @notice Purpose: to withdraw tokens from the original address and
   * transfer those tokens to the replacement address.
   * Use in cases when e.g. investor loses access to his account.
   * Conditions:
   * Throw error if the `original` address supplied is not a shareholder.
   * Throw error if the 'replacement' address already holds tokens.
   * Original address MUST NOT be reused again.
   * Only issuer can execute this function.
   * @param original - original address
   * @param replacement - replacement address
   */
  function reassign(address original, address replacement) external;

  /**
   * @notice Purpose: this event is emitted when tokens are withdrawn from one address and issued to a new one.
   * @param original - original address
   * @param replacement - replacement address
   * @param value - amount transfered from original to replacement
   */
  event LogReassigned(address indexed original, address indexed replacement, uint256 value);
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

contract ProxySafeCMTA20FDT is
    IFundsDistributionToken,
    IInitializableFDT,
    FundsDistributionToken,
    OwnableUpgradeSafe,
    PausableUpgradeSafe,
    IContactable,
    IIdentifiable,
    IIssuable,
    IDestroyable,
    IReassignable
{

    using SafeMathUint for uint256;
    using SafeMathInt for int256;

    // token in which the funds can be sent to the FundsDistributionToken
    IERC20 public fundsToken;

    // balance of fundsToken that the FundsDistributionToken currently holds
    uint256 public fundsTokenBalance;

    // CMTA20 params
    uint8 internal constant TRANSFER_OK = 0;
    uint8 internal constant TRANSFER_REJECTED_PAUSED = 1;
    string internal constant TEXT_TRANSFER_OK = "No restriction";
    string internal constant TEXT_TRANSFER_REJECTED_PAUSED = "All transfers paused";
    string public override contact;
    mapping (address => bytes) internal identities;
    IRuleEngine public ruleEngine;

    event LogRuleEngineSet(address indexed newRuleEngine);


    modifier onlyFundsToken() {
        require(
            msg.sender == address(fundsToken),
            "CMTA20FDT.onlyFundsToken: UNAUTHORIZED_SENDER"
        );
        _;
    }

    /**
     * @dev Triggers stopped state.
     */
    function pause() external whenNotPaused onlyOwner {
        _pause();
    }

    /**
     * @dev Returns to normal state.
     */
    function unpause() external whenPaused onlyOwner {
        _unpause();
    }

    /**
     * @notice Purpose: set optional rule engine by owner()
     * @param _ruleEngine - the rule engine that will approve/reject transfers
     */
    function setRuleEngine(IRuleEngine _ruleEngine) external onlyOwner {
        ruleEngine = _ruleEngine;
        emit LogRuleEngineSet(address(_ruleEngine));
    }

    /**
     * @notice Purpose: set contact point for shareholders
     * @param _contact - the contact information for the shareholders
     */
    function setContact(string calldata _contact) external override onlyOwner {
        contact = _contact;
        emit LogContactSet(_contact);
    }

    /**
     * Purpose
     * Set identity of a potential/actual shareholder. Can only be called by the potential/actual shareholder himself. Has to be encrypted data.
     * 
     * @param _identity - the potential/actual shareholder identity
     */
    function setMyIdentity(bytes calldata _identity) external override {
        identities[msg.sender] = _identity;
    }

    /**
     * @notice Withdraws all available funds for a token holder
     */
    function withdrawFunds() external override whenNotPaused {
        _withdrawFundsFor(msg.sender);
    }

    /**
     * @notice Register a payment of funds in tokens. May be called directly after a deposit is made.
     * @dev Calls _updateFundsTokenBalance(), whereby the contract computes the delta of the previous and the new
     * funds token balance and increments the total received funds (cumulative) by delta by calling _registerFunds()
     */
    function updateFundsReceived() external whenNotPaused {
        int256 newFunds = _updateFundsTokenBalance();

        if (newFunds > 0) {
            _distributeFunds(newFunds.toUint256Safe());
        }
    }

    /**
     * @notice Purposee: to withdraw tokens from the original address and
     * transfer those tokens to the replacement address.
     * Use in cases when e.g. investor loses access to his account.
     * Conditions: throw error if the `original` address supplied is not a shareholder.
     * Only issuer can execute this function.
     * @param original - original address
     * @param replacement - replacement address
     */
    function reassign(address original, address replacement) external override onlyOwner whenNotPaused {
        require(original != address(0), "CM01");
        require(replacement != address(0), "CM02");
        require(original != replacement, "CM03");

        uint256 originalBalance = balanceOf(original);
        require(originalBalance != 0, "CM05");

        _burn(original, originalBalance);
        _mint(replacement, originalBalance);
        
        emit LogReassigned(original, replacement, originalBalance);
        emit Transfer(original, replacement, originalBalance);
    }

    /**
     * @notice Purpose: to destroy issued tokens.
     * Conditions: only issuer can execute this function.
     * @param shareholders - list of shareholders
    */
    function destroy(address[] calldata shareholders) external override whenNotPaused onlyOwner {
        for (uint256 i = 0; i < shareholders.length; i++) {
            require(shareholders[i] != owner(), "CM06");
            uint256 shareholderBalance = balanceOf(shareholders[i]);
            _burn(shareholders[i], balanceOf(shareholders[i]));
            _mint(owner(), shareholderBalance);
            emit Transfer(shareholders[i], owner(), shareholderBalance);
        }
        emit LogDestroyed(shareholders);
    }

    /**
     * Purpose
     * Retrieve identity of a potential/actual shareholder
     */
    function identity(address shareholder) external view override returns (bytes memory) {
        return identities[shareholder];
    }

    /**
     * @notice Initialize a new instance storage
     * @dev "constructor" to be called on deployment
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
            "CMTA20FDT: INVALID_FUNDS_TOKEN_ADDRESS"
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
    function pushFunds(address[] memory owners) public whenNotPaused {
        for (uint256 i = 0; i < owners.length; i++) {
            _withdrawFundsFor(owners[i]);
        }
    }

    /**
     * @notice Overrides the parent class token transfer function to enforce restrictions.
    */
    function transfer(address to, uint256 value) public override whenNotPaused returns (bool) {
        if (address(ruleEngine) != address(0)) {
            require(ruleEngine.validateTransfer(msg.sender, to, value), "CM04");
            return super.transfer(to, value);
        } else {
            return super.transfer(to, value);
        }
    }

    /**
     * @notice Overrides the parent class token transferFrom function to enforce restrictions.
     */
    function transferFrom(address from, address to, uint256 value) public override whenNotPaused returns (bool) {
        if (address(ruleEngine) != address(0)) {
            require(ruleEngine.validateTransfer(from, to, value), "CM04");
            return super.transferFrom(from, to, value);
        } else {
            return super.transferFrom(from, to, value);
        }
    }

    /**
     * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
     * @param _spender The address which will spend the funds.
     * @param _value The amount of tokens to be spent.
     */
    function approve(address _spender, uint256 _value) public override whenNotPaused returns (bool) {
        return super.approve(_spender, _value);
    }

    /**
     * @dev Increase the amount of tokens that an owner allowed to a spender.
     * @param _spender The address which will spend the funds.
     * @param _addedValue The amount of tokens to increase the allowance by.
     */
    function increaseAllowance(address _spender, uint256 _addedValue) public override whenNotPaused returns (bool) {
        return super.increaseAllowance(_spender, _addedValue);
    }

    /**
     * @dev Decrease the amount of tokens that an owner allowed to a spender.
     * @param _spender The address which will spend the funds.
     * @param _subtractedValue The amount of tokens to decrease the allowance by.
     */
    function decreaseAllowance(address _spender, uint256 _subtractedValue) public override whenNotPaused returns (bool) {
        return super.decreaseAllowance(_spender, _subtractedValue);
    }

    /**
     * @notice Purpose: Issue tokens on the owner() address
     * @param _value - amount of newly issued tokens
     */
    function issue(uint256 _value) public override whenNotPaused onlyOwner {
        _mint(owner(), _value);
        emit Transfer(address(0), owner(), _value);
        emit LogIssued(_value);
    }


    /**
     * @notice Purpose: Redeem tokens on the owner() address
     * @param _value - amount of redeemed tokens
     */
    function redeem(uint256 _value) public override whenNotPaused onlyOwner {
        _burn(owner(), _value);
        emit Transfer(owner(), address(0), _value);
        emit LogRedeemed(_value);
    }

    /**
     * @notice Exposes the ability to mint new FDTs for a given account. Caller has to be the owner of the FDT.
     */
    function mint(address account, uint256 amount) public whenNotPaused onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }

    /**
     * @notice Exposes the ability to burn exisiting FDTs for a given account. Caller has to be the owner of the FDT.
     */
    function burn(address account, uint256 amount) public whenNotPaused onlyOwner returns (bool) {
        _burn(account, amount);
        return true;
    }

    /**
     * @dev check if _value token can be transferred from _from to _to
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     */
    function canTransfer(address _from, address _to, uint256 _value) public view returns (bool) {
        if (paused()) return false;
        if (address(ruleEngine) != address(0)) return ruleEngine.validateTransfer(_from, _to, _value);
        return true;
    }

    /**
     * @dev check if _value token can be transferred from _from to _to
     * @param _from address The address which you want to send tokens from
     * @param _to address The address which you want to transfer to
     * @param _value uint256 the amount of tokens to be transferred
     * @return code of the rejection reason
     */
    function detectTransferRestriction(address _from, address _to, uint256 _value) public view returns (uint8) {
        if (paused()) return TRANSFER_REJECTED_PAUSED;
        if (address(ruleEngine) != address(0)) return ruleEngine.detectTransferRestriction(_from, _to, _value);
        return TRANSFER_OK;
    }

    /**
     * @dev returns the human readable explaination corresponding to the error code returned by detectTransferRestriction
     * @param _restrictionCode The error code returned by detectTransferRestriction
     * @return The human readable explaination corresponding to the error code returned by detectTransferRestriction
     */
    function messageForTransferRestriction(uint8 _restrictionCode) public view returns (string memory) {
        if (_restrictionCode == TRANSFER_OK) return TEXT_TRANSFER_OK;
        if (_restrictionCode == TRANSFER_REJECTED_PAUSED) return TEXT_TRANSFER_REJECTED_PAUSED;
        if (address(ruleEngine) != address(0)) return ruleEngine.messageForTransferRestriction(_restrictionCode);
        revert("CMTA20FDT.messageForTransferRestriction: INVALID_RESTRICTION_CODE");
    }

    /**
     * @notice Withdraws all available funds for a token holder
     */
    function _withdrawFundsFor(address owner) internal {
        uint256 withdrawableFunds = _prepareWithdrawFor(owner);

        require(
            fundsToken.transfer(owner, withdrawableFunds),
            "CMTA20FDT.withdrawFunds: TRANSFER_FAILED"
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
