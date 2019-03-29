pragma solidity ^0.5.2;

/**
 * deployed once for all contracts, 
 * registry for all payments corresponding to a cashflowId for all contracts
 * distributes funds received in relation to the amount of ownership tokens a user holds
 */
contract DistributorGlobalRegistry {

  // assetId => cashflowId => ownership token address
  mapping (bytes32 => mapping (bytes32 => address)) ownershipTokenRegistry;
  
  // assetId => cashflowId => cummulative funds received
  mapping (bytes32 => mapping (bytes32 => uint256)) cummulativeFundsReceived;
  
  // assetId => cashflowId => owner => processed cummulcative funds received
  mapping (bytes32 => mapping (bytes32 => mapping(address => uint256))) processedCummulativeFundsReceivedFor;
  
  // assetId => cashflowId => owner => not withdrawn payout
  mapping (bytes32 => mapping (bytes32 => mapping (address => uint256))) notWithdrawnPayout;


  function registerOwnershipToken (bytes32 _assetId, bytes32 _cashflowId, address _ownershipToken) {
    require(ownershipTokenRegistry[_assetId][_cashflowId] == address(0));
    ownershipTokenRegistry[_assetId][_cashflowId] = _ownershipToken;
  }

  /**
   * Increment cummulativeFundsReceived by msg.value.
   */  
  function depositPayout (bytes32 _assetId, bytes32 _cashflowId) 
    public
    payable
  {
    cummulativeFundsReceived[_assetId][_cashflowId] += msg.value;  
  }
  
  /**
   * Returns payout for a user which can be withdrawn or claimed.
   */
  function calcPayout(bytes32 _assetId, bytes32 _cashflowId, address _forAddress) 
    private 
    returns (uint256) 
  {
    uint256 share = ownershipTokenRegistry[_assetId][_cashflowId].balanceOf(_forAddress) / ownershipTokenRegistry[_assetId][_cashflowId].totalSupply();
    uint256 newFunds = cummulativeFundsReceived[_assetId][_cashflowId] - processedCummulativeFundsReceivedFor[_assetId][_cashflowId][_forAddress];

    return share * newFunds;
  }

  /**
   * Withdraws payout for user.
   */
  function withdraw(bytes32 _assetId, bytes32 _cashflowId) external {
    uint256 totalPayout = calcPayout(_assetId, _cashflowId, msg.sender) + notWithdrawnPayout[_assetId][_cashflowId][msg.sender];

    processedCummulativeFundsReceivedFor[_assetId][_cashflowId][msg.sender] = cummulativeFundsReceived[_assetId][_cashflowId];
    notWithdrawnPayout[_assetId][_cashflowId][msg.sender] = 0;
    
    msg.sender.send(totalPayout);
  }
  
  /**
   * Credits payout for a user.
   */
  function claimPayoutFor(bytes32 _assetId, bytes32 _cashflowId, address _forAddress) public {
    uint256 payout = calcPayout(_assetId, _cashflowId, _forAdress);

    processedCummulativeFundsReceivedFor[_assetId][_cashflowId][_forAddress] = cummulativeFundsReceived[_assetId][_cashflowId];
    notWithdrawnPayout[_assetId][_cashflowId][_forAddress] += payout;
  }

  /**
   * Calls depositFunds(), whereby cummulativeFundsReceived gets updated.
   */
  function (bytes32 _assetId, bytes32 _cashflowId) 
    public 
    payable 
  {
    if (msg.value > 0) {
      depositFunds(_assetId, _cashflowId);
    }
  }
}