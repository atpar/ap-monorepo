pragma solidity ^0.5.2;

/**
 * corresponds to a cashflowId
 * distributes funds received in relation to the amount of ownership tokens a user holds
 */
contract Distributor {

  // address of the ownershipToken which represents rights to future cashflow
  address public ownershipToken;

  // cummulative funds received by this contract
  uint256 public cummulativeFundsReceived;
  // cummulative funds received which were already processed for distribution by user
  mapping (address => uint256) public processedCummulativeFundsReceivedFor;

  // claimed but not yet withdrawn payout for a user
  mapping (address => uint256) public notWithdrawnPayout;

  constructor(address _token) public {
    ownershipToken = _token;
    cummulativeFundsReceived = 0;
  }

  /**
   * Increment cummulativeFundsReceived by msg.value.
   */
  function depositFunds() 
    public
    payble
  {
    cummulativeFundsReceived += msg.value;
  }

  /**
   * Returns payout for a user which can be withdrawn or claimed.
   */
  function calcPayout(address _forAddress) 
    private 
    returns (uint256) 
  {
    uint256 share = ownershipToken.balanceOf(_forAddress) / ownershipToken.totalSupply();
    uint256 newFunds = cummulativeFundsReceived - processedCummulativeFundsReceivedFor[_forAddress];

    return share * newFunds;
  }

  /**
   * Withdraws payout for user.
   */
  function withdraw() external {
    uint256 totalPayout = calcPayout(msg.sender) + notWithdrawnPayout[msg.sender];

    processedCummulativeFundsReceivedFor[msg.sender] = cummulativeFundsReceived;
    notWithdrawnPayout[msg.sender] = 0;
    
    msg.sender.send(totalPayout);
  }

  /**
   * Credits payout for a user.
   */
  function claimPayoutFor(address _forAddress) public {
    uint256 payout = calcPayout(_forAdress);

    processedCummulativeFundsReceivedFor[_forAddress] = cummulativeFundsReceived;
    notWithdrawnPayout[_forAddress] += payout;
  }

  /**
   * Calls depositFunds(), whereby cummulativeFundsReceived gets updated.
   */
  function () 
    public 
    payable 
  {
    if (msg.value > 0) {
      depositFunds();
    }
  }
}
