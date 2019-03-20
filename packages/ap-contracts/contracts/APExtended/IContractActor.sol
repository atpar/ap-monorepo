pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";

contract IContractActor is APDefinitions {

  function initialize (
    bytes32 contractId, 
    ContractOwnership memory ownership, 
    ContractTerms memory terms
  )
    public
    returns(bool);

  function progress (
    bytes32 contractId, 
    uint256 timestamp
  ) 
    external 
    returns(bool);
}