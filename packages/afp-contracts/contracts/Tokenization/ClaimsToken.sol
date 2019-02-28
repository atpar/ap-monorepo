pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

import "./IClaimsToken.sol";


contract ClaimsToken is IClaimsToken, ERC20, ERC20Detailed {
  
  // token that ClaimsToken takes in custodianship 
  IERC20 public fundsToken;

  // cumulative funds received by this contract
  uint256 public receivedFunds;
  // cumulative funds received which were already processed for distribution - by user
  mapping (address => uint256) public processedFunds;
  // claimed but not yet withdrawn funds for a user
  mapping (address => uint256) public claimedFunds;

  event Deposit(uint256 fundsDeposited);


  modifier onlyETHInstantiated () {
    require(address(fundsToken) == address(0), "INSTANTIATED_WITH_ETH");
    _;
  }

  modifier onlyERC20Instantiated () {
    require(address(fundsToken) != address(0), "INSTANTIATED_WITH_ERC20");
    _;
  }

  modifier onlyFundsToken () {
    require(msg.sender == address(fundsToken), "UNAUTHORIZED_SENDER");
    _;
  }

  constructor (address _owner, IERC20 _fundsToken) 
    public 
    ERC20Detailed("ClaimsToken", "CST", 18)
  {
    _mint(_owner, 10000 * (10 ** uint256(18)));

    fundsToken = _fundsToken;
    receivedFunds = 0;
  }

  /** 
   * @dev Transfers sender's tokens to a given address. Returns success.
   * @param to Address of token receiver.
   * @param value Number of tokens to transfer.
   */
  function transfer(address to, uint256 value)
    public
    returns (bool)
  {
    // claim funds for both parties first
    _claimFunds(msg.sender);
    _claimFunds(to);

    return super.transfer(to, value);
  }


  /**
   * @dev Allows allowed third party to transfer tokens from one address to another. Returns success.
   * @param from Address from where tokens are withdrawn.
   * @param to Address to where tokens are sent.
   * @param value Number of tokens to transfer.
   */
  function transferFrom(address from, address to, uint256 value)
    public
    returns (bool)
  {
    // claim payouts for both parties first
    _claimFunds(from);
    _claimFunds(to);

    return super.transferFrom(from, to, value);
  }

    /**
   * Get cumulative funds received by ClaimsToken
   * @return a uint256 representing the total funds received by ClaimsToken
   */
  function totalReceivedFunds () 
    external 
    view 
    returns (uint256) 
  {
    return receivedFunds;
  }

  /**
   * Increment cumulative received funds by new received funds.
   * @param _value value of tokens / Ether received
   * @dev called when ClaimsToken receives funds
   */
  function _registerFunds(uint256 _value) 
    private
  {
    receivedFunds += _value;
    
    emit Deposit(_value);
  }

  /**
   * Returns payout for a user which can be withdrawn or claimed.
   * @param _address Address of ClaimsToken holder
   */
  function _calcUnprocessedFunds(address _address) 
    private 
    view
    returns (uint256) 
  {
    uint256 newReceivedFunds = receivedFunds - processedFunds[_address];
    return balanceOf(_address) * newReceivedFunds / totalSupply();
  }

  /**
   * Returns the amount of funds a given address is able to withdraw currently
   * @param _address Address of ClaimsToken holder
   * @return a uint256 representing the available funds for a given account
   */
  function availableFunds(address _address)
    public
    view
    returns (uint256) 
  {
    return _calcUnprocessedFunds(_address) + claimedFunds[_address];
  }

  /**
   * Withdraws payout for user.
   */
  function withdrawFunds() 
    external 
    payable 
  {
    uint256 withdrawableFunds = availableFunds(msg.sender);

    processedFunds[msg.sender] = receivedFunds;
    claimedFunds[msg.sender] = 0;
    
    if (address(fundsToken) == address(0)) {
      msg.sender.transfer(withdrawableFunds);
    } else {
      fundsToken.transfer(msg.sender, withdrawableFunds);
    }
  }

  /**
   * Claims funds for a user.
   * @param _address Address of ClaimsToken holder
   */
  function _claimFunds(address _address) private {
    uint256 unprocessedFunds = _calcUnprocessedFunds(_address);

    processedFunds[_address] = receivedFunds;
    claimedFunds[_address] += unprocessedFunds;
  }

  /**
   * For ERC223
   * Calls _registerFunds(), whereby total received funds (cumulative) gets updated.
   */
  function tokenFallback (address, uint256 _value, bytes memory) 
    public 
    onlyERC20Instantiated()
    onlyFundsToken()
  {
    if (_value > 0) {
      _registerFunds(_value);
    }
  }

  /**
   * Calls _registerFunds(), whereby total received funds (cumulative) gets updated.
   */
  function () 
    external 
    payable 
    onlyETHInstantiated()
  {
    if (msg.value > 0) {
      _registerFunds(msg.value);
    }
  }
}