pragma solidity ^0.5.2;

/**
 * deployed once for all contracts, 
 * registry for all payments corresponding to a cashflowId for all contracts
 * distributes funds received in relation to the amount of ownership tokens a user holds
 */
contract DistributorGlobalRegistry {

  // contractId => cashflowId => ownership token address
  mapping (bytes32 => mapping (bytes32 => address)) ownershipTokenRegistry;
  
  // contractId => cashflowId => cummulative funds received
  mapping (bytes32 => mapping (bytes32 => uint256)) cummulativeFundsReceived;
  
  // contractId => cashflowId => owner => processed cummulcative funds received
  mapping (bytes32 => mapping (bytes32 => mapping(address => uint256))) processedCummulativeFundsReceivedFor;
  
  // contractId => cashflowId => owner => not withdrawn payout
  mapping (bytes32 => mapping (bytes32 => mapping (address => uint256))) notWithdrawnPayout;


  function registerOwnershipToken (bytes32 _contractId, bytes32 _cashflowId, address _ownershipToken) {
    require(ownershipTokenRegistry[_contractId][_cashflowId] == address(0));
    ownershipTokenRegistry[_contractId][_cashflowId] = _ownershipToken;
  }

  /**
   * Increment cummulativeFundsReceived by msg.value.
   */  
  function depositPayout (bytes32 _contractId, bytes32 _cashflowId) 
    public
    payable
  {
    cummulativeFundsReceived[_contractId][_cashflowId] += msg.value;  
  }
  
  /**
   * Returns payout for a user which can be withdrawn or claimed.
   */
  function calcPayout(bytes32 _contractId, bytes32 _cashflowId, address _forAddress) 
    private 
    returns (uint256) 
  {
    uint256 share = ownershipTokenRegistry[_contractId][_cashflowId].balanceOf(_forAddress) / ownershipTokenRegistry[_contractId][_cashflowId].totalSupply();
    uint256 newFunds = cummulativeFundsReceived[_contractId][_cashflowId] - processedCummulativeFundsReceivedFor[_contractId][_cashflowId][_forAddress];

    return share * newFunds;
  }

  /**
   * Withdraws payout for user.
   */
  function withdraw(bytes32 _contractId, bytes32 _cashflowId) external {
    uint256 totalPayout = calcPayout(_contractId, _cashflowId, msg.sender) + notWithdrawnPayout[_contractId][_cashflowId][msg.sender];

    processedCummulativeFundsReceivedFor[_contractId][_cashflowId][msg.sender] = cummulativeFundsReceived[_contractId][_cashflowId];
    notWithdrawnPayout[_contractId][_cashflowId][msg.sender] = 0;
    
    msg.sender.send(totalPayout);
  }
  
  /**
   * Credits payout for a user.
   */
  function claimPayoutFor(bytes32 _contractId, bytes32 _cashflowId, address _forAddress) public {
    uint256 payout = calcPayout(_contractId, _cashflowId, _forAdress);

    processedCummulativeFundsReceivedFor[_contractId][_cashflowId][_forAddress] = cummulativeFundsReceived[_contractId][_cashflowId];
    notWithdrawnPayout[_contractId][_cashflowId][_forAddress] += payout;
  }

  /**
   * Calls depositFunds(), whereby cummulativeFundsReceived gets updated.
   */
  function (bytes32 _contractId, bytes32 _cashflowId) 
    public 
    payable 
  {
    if (msg.value > 0) {
      depositFunds(_contractId, _cashflowId);
    }
  }
}