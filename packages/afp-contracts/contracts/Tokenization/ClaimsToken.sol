pragma solidity ^0.5.2;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";


contract ClaimsToken is ERC20, ERC20Detailed {

  uint8 public constant DECIMALS = 18;
  uint256 public constant SUPPLY = 10000 * (10 ** uint256(DECIMALS));

  // cummulative funds received by this contract
  uint256 public cummulativeFundsReceived;
  // cummulative funds received which were already processed for distribution by user
  mapping (address => uint256) public processedCummulativeFundsReceivedFor;
  // claimed but not yet withdrawn payout for a user
  mapping (address => uint256) public notWithdrawnPayout;


  constructor (address _owner) 
    public 
    ERC20Detailed("OwnershipToken", "OST", DECIMALS) 
  {
    _mint(_owner, SUPPLY);

    cummulativeFundsReceived = 0;
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
    // claim payouts for both parties first
    claimPayoutFor(msg.sender);
    claimPayoutFor(to);
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
    claimPayoutFor(from);
    claimPayoutFor(to);
    return super.transferFrom(from, to, value);
  }

  /**
   * Increment cummulativeFundsReceived by msg.value.
   */
  function depositFunds() 
    public
    payable
  {
    cummulativeFundsReceived += msg.value;
  }

  /**
   * Returns payout for a user which can be withdrawn or claimed.
   */
  function calcPayout(address _forAddress) 
    private 
    view
    returns (uint256) 
  {
    uint256 newFundsReceived = cummulativeFundsReceived - processedCummulativeFundsReceivedFor[_forAddress];
    return balanceOf(_forAddress) * newFundsReceived / totalSupply();
  }

  /**
   * Withdraws payout for user.
   */
  function withdraw() external payable {
    uint256 totalPayout = calcPayout(msg.sender) + notWithdrawnPayout[msg.sender];

    processedCummulativeFundsReceivedFor[msg.sender] = cummulativeFundsReceived;
    notWithdrawnPayout[msg.sender] = 0;
    
    msg.sender.transfer(totalPayout);
  }

  /**
   * Credits payout for a user.
   */
  function claimPayoutFor(address _forAddress) public {
    uint256 payout = calcPayout(_forAddress);

    processedCummulativeFundsReceivedFor[_forAddress] = cummulativeFundsReceived;
    notWithdrawnPayout[_forAddress] += payout;
  }

  /**
   * Calls depositFunds(), whereby cummulativeFundsReceived gets updated.
   */
  function () 
    external 
    payable 
  {
    if (msg.value > 0) {
      depositFunds();
    }
  }
}