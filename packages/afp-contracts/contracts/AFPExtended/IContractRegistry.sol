pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../AFPCore/AFPDefinitions.sol";

contract IContractRegistry is AFPDefinitions {

  function registerContract (
    bytes32 _contractId,
    PAMContractTerms memory _terms,
    ContractState memory _state,
    address _actor
  ) 
    public;

  function setState (bytes32 _contractId, ContractState memory _state) public;

  function setTerms (bytes32 _contractId, PAMContractTerms memory _terms) public;

  function setEventId (bytes32 _contractId, uint256 _eventId) public;

  function getTerms (bytes32 _contractId) 
    external 
    view
    returns (PAMContractTerms memory); 

  function getState (bytes32 _contractId) 
    external 
    view
    returns (ContractState memory);
}
