pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";


interface IClaimsToken {

  event Deposit(uint256 fundsReceived);
  
  /**
   * Withdraws payout for user.
   */
  function withdrawFunds() external payable;

  /**
   * Returns the amount of funds a given address is able to withdraw currently
   * @param _address Address of ClaimsToken holder
   * @return a uint256 representing the available funds for a given account
   */
  function availableFunds(address _address) external view returns (uint256);

  /**
   * Get cumulative funds received by ClaimsToken
   * @return a uint256 representing the total funds received by ClaimsToken
   */
  function totalReceivedFunds () external view returns (uint256);
}