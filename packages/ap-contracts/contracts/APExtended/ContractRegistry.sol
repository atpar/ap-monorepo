pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";


contract ContractRegistry is APDefinitions {

	struct Contract {
		bytes32 contractId;
		ContractTerms terms;
		ContractState state;
		uint256 eventId;
		address actor;
	}

	mapping (bytes32 => Contract) public contracts;

	modifier onlyDesignatedActor (bytes32 contractId) {
		require(contracts[contractId].actor == msg.sender, "UNAUTHORIZED_SENDER");
		_;
	}

	function registerContract (
		bytes32 contractId,
		ContractTerms memory terms,
		ContractState memory state,
		address actor
	) 
		public 
	{
		require(contracts[contractId].contractId == bytes32(0), "ENTRY_ALREADY_EXISTS");
		
		contracts[contractId] = Contract(
			contractId,
			terms,
			state,
			0,
			actor
		);
	}

	function setState (bytes32 contractId, ContractState memory state) onlyDesignatedActor (contractId) public {
		contracts[contractId].state = state;
	}

	function setTerms (bytes32 contractId, ContractTerms memory terms) onlyDesignatedActor (contractId) public {
		contracts[contractId].terms = terms;
	}

	function setEventId (bytes32 contractId, uint256 eventId) onlyDesignatedActor (contractId) external {
		contracts[contractId].eventId = eventId;
	}

	function getTerms (bytes32 contractId) 
		external 
		view
		returns (ContractTerms memory)
	{
		return contracts[contractId].terms;
	}  

	function getState (bytes32 contractId) 
		external 
		view
		returns (ContractState memory)
	{
		return contracts[contractId].state;
	}

	function getEventId (bytes32 contractId)
		external
		view
		returns (uint256)
	{
		return contracts[contractId].eventId;
	}
}
