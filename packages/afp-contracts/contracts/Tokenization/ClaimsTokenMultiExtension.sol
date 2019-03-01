pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "./IClaimsToken.sol";
import "./ClaimsToken.sol";


contract ClaimsTokenMultiExtension is IClaimsToken, ClaimsToken {
  
  // token that ClaimsToken takes in custodianship 
  IERC20 public fundsToken;


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
    ClaimsToken(_owner)
  {
    fundsToken = _fundsToken;
  }

  /**
   * @dev Withdraws available funds for user.
   */
  function withdrawFunds() 
    external 
    payable 
  {
    uint256 withdrawableFunds = _prepareWithdraw();

    if (address(fundsToken) == address(0)) {
      msg.sender.transfer(withdrawableFunds);
    } else {
      fundsToken.transfer(msg.sender, withdrawableFunds);
    }
  }

  /**
   * @dev For ERC223.
   * Calls _registerFunds(), whereby total received funds (cumulative) gets updated.
   * @param _value Amount of tokens
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
   * @dev Calls _registerFunds(), 
   * whereby total received funds (cumulative) gets updated.
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