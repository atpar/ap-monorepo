pragma solidity ^0.5.2;

/**
 * deployed for every contract, 
 * registry for all payments corresponding to a cashflowId for a contracts
 * distributes funds received in relation to the amount of ownership tokens a user holds
 */
contract DistributorRegistry {

  // cashflowId => ownership token address
  mapping (bytes32 => address) ownershipTokenRegistry;
  
  // cashflowId => cummulative funds received
  mapping (bytes32 => uint256) cummulativeFundsReceived;
  
  // cashflowId => owner => processed cummulcative funds received
  mapping (bytes32 => mapping(address => uint256)) processedCummulativeFundsReceivedFor;
  
  // cashflowId => owner => not withdrawn payout
  mapping (bytes32 => mapping (address => uint256)) notWithdrawnPayout;


  function registerOwnershipToken (bytes32 _cashflowId, address _ownershipToken) {
    require(ownershipTokenRegistry[_cashflowId] == address(0));
    ownershipTokenRegistry[_cashflowId] = _ownershipToken;
  }

  /**
   * Increment cummulativeFundsReceived by msg.value.
   */  
  function depositPayout (bytes32 _cashflowId) 
    public
    payable
  {
    cummulativeFundsReceived[_cashflowId] += msg.value;  
  }
  
  /**
   * Returns payout for a user which can be withdrawn or claimed.
   */
  function calcPayout(bytes32 _cashflowId, address _forAddress) 
    private 
    returns (uint256) 
  {
    uint256 share = ownershipTokenRegistry[_cashflowId].balanceOf(_forAddress) / ownershipTokenRegistry[_cashflowId].totalSupply();
    uint256 newFunds = cummulativeFundsReceived[_cashflowId] - processedCummulativeFundsReceivedFor[_cashflowId][_forAddress];

    return share * newFunds;
  }

  /**
   * Withdraws payout for user.
   */
  function withdraw(bytes32 _cashflowId) external {
    uint256 totalPayout = calcPayout(_cashflowId, msg.sender) + notWithdrawnPayout[_cashflowId][msg.sender];

    processedCummulativeFundsReceivedFor[_cashflowId][msg.sender] = cummulativeFundsReceived[_cashflowId];
    notWithdrawnPayout[_cashflowId][msg.sender] = 0;
    
    msg.sender.send(totalPayout);
  }
  
  /**
   * Credits payout for a user.
   */
  function claimPayoutFor(bytes32 _cashflowId, address _forAddress) public {
    uint256 payout = calcPayout(_cashflowId, _forAdress);

    processedCummulativeFundsReceivedFor[_cashflowId][_forAddress] = cummulativeFundsReceived[_cashflowId];
    notWithdrawnPayout[_cashflowId][_forAddress] += payout;
  }

  /**
   * Calls depositFunds(), whereby cummulativeFundsReceived gets updated.
   */
  function (bytes32 _cashflowId) 
    public 
    payable 
  {
    if (msg.value > 0) {
      depositFunds(_cashflowId);
    }
  }
}