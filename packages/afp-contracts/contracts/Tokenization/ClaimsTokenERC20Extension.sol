pragma solidity ^0.5.2;

import "./IClaimsToken.sol";
import "./ClaimsToken.sol";


contract ClaimsTokenERC20Extension is IClaimsToken, ClaimsToken {

  // token that ClaimsToken takes in custodianship 
  IERC20 public fundsToken;

  modifier onlyFundsToken () {
    require(msg.sender == address(fundsToken), "UNAUTHORIZED_SENDER");
    _;
  }

  constructor (address _owner, IERC20 _fundsToken) 
    public 
    ClaimsToken(_owner)
  {
    require(address(_fundsToken) != address(0));

    fundsToken = _fundsToken;
  }

  /**
   * @dev Withdraws available funds for user.
   */
  function withdrawFunds() 
    external 
    payable 
  {
    uint256 withdrawableFunds = _withdrawFunds();
    
    fundsToken.transfer(msg.sender, withdrawableFunds);
  }

  /**
   * @dev For ERC223.
   * Calls _registerFunds(), whereby total received funds (cumulative) gets updated.
   * @param _value Amount of tokens
   */
  function tokenFallback (address, uint256 _value, bytes memory) 
    public 
    onlyFundsToken()
  {
    if (_value > 0) {
      _registerFunds(_value);
    }
  }
}