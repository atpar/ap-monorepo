pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

import "./DistributorInterface.sol";

contract OwnershipToken is ERC20, ERC20Detailed {

  DistributorInterface public distributor;

  uint8 public constant DECIMALS = 18;
  uint256 public constant SUPPLY = 10000 * (10 ** uint256(DECIMALS));

  constructor () public ERC20Detailed("SimpleToken", "SIM", DECIMALS) {
    _mint(msg.sender, INITIAL_SUPPLY);
  }


  /// @dev Transfers sender's tokens to a given address. Returns success.
  /// @param to Address of token receiver.
  /// @param value Number of tokens to transfer.
  function transfer(address to, uint256 value)
    returns (bool)
  {
    // claim payouts for both parties first
    distributor.claimPayoutFor(msg.sender);
    distributor.claimPayoutFor(to);
    return super.transfer(to, value);
  }


  /// @dev Allows allowed third party to transfer tokens from one address to another. Returns success.
  /// @param from Address from where tokens are withdrawn.
  /// @param to Address to where tokens are sent.
  /// @param value Number of tokens to transfer.
  function transferFrom(address from, address to, uint256 value)
      returns (bool)
  {
      // claim payouts for both parties first
      distributor.claimPayoutFor(from);
      distributor.claimPayoutFor(to);
      return super.transferFrom(from, to, value);
  }
}