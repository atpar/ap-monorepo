pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";


contract IAssetRegistry is APDefinitions {

	function getTerms(bytes32 contractId) 
		external 
		view
		returns (ContractTerms memory); 

	function getState(bytes32 contractId) 
		external 
		view
		returns (ContractState memory);

	function getEventId(bytes32 contractId)
		external
		view
		returns (uint256);

	function setState(bytes32 contractId, ContractState memory state) public;

	function setTerms(bytes32 contractId, ContractTerms memory terms) public;

	function setEventId(bytes32 contractId, uint256 eventId) public;

	function registerContract(
		bytes32 contractId,
		ContractTerms memory terms,
		ContractState memory state,
		address _actor
	) 
		public;
}
