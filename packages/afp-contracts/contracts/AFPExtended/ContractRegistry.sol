pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../AFPCore/AFPDefinitions.sol";


contract ContractRegistry is AFPDefinitions {

	struct Contract {
		bytes32 contractId;
		PAMContractTerms terms;
		ContractState state;
		uint256 eventId;
		address actor;
	}

	mapping (bytes32 => Contract) public contracts;

	modifier onlyActor (bytes32 _contractId) {
		require(contracts[_contractId].actor == msg.sender, "UNAUTHORIZED_SENDER");
		_;
	}

	function registerContract (
		bytes32 _contractId,
		PAMContractTerms memory _terms,
		ContractState memory _state,
		address _actor
	) 
		public 
	{
		require(contracts[_contractId].contractId == bytes32(0), "ENTRY_ALREADY_EXISTS");
		
		contracts[_contractId] = Contract(
			_contractId,
			_terms,
			_state,
			0,
			_actor
		);
	}

	function setState (bytes32 _contractId, ContractState memory _state) onlyActor (_contractId) public {
		contracts[_contractId].state = _state;
	}

	function setTerms (bytes32 _contractId, PAMContractTerms memory _terms) onlyActor (_contractId) public {
		contracts[_contractId].terms = _terms;
	}

	function setEventId (bytes32 _contractId, uint256 _eventId) onlyActor (_contractId) external {
		contracts[_contractId].eventId = _eventId;
	}

	function getTerms (bytes32 _contractId) 
		external 
		view
		returns (PAMContractTerms memory)
	{
		return contracts[_contractId].terms;
	}  

	function getState (bytes32 _contractId) 
		external 
		view
		returns (ContractState memory)
	{
		return contracts[_contractId].state;
	}

	function getEventId (bytes32 _contractId)
		external
		view
		returns (uint256)
	{
		return contracts[_contractId].eventId;
	}
}
