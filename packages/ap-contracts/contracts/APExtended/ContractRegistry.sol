pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";
import "./IContractRegistry.sol";


contract ContractRegistry is APDefinitions, IContractRegistry {

	struct Contract {
		bytes32 contractId;
		ContractTerms terms;
		ContractState state;
		uint256 eventId;
		address actor;
	}

	mapping (bytes32 => Contract) public contracts;

	modifier onlyDesignatedActor(bytes32 contractId) {
		require(contracts[contractId].actor == msg.sender, "UNAUTHORIZED_SENDER");
		_;
	}

	function getTerms(bytes32 contractId) 
		external 
		view
		returns (ContractTerms memory)
	{
		return contracts[contractId].terms;
	}  

	function getState(bytes32 contractId) 
		external 
		view
		returns (ContractState memory)
	{
		return contracts[contractId].state;
	}

	function getEventId(bytes32 contractId)
		external
		view
		returns (uint256)
	{
		return contracts[contractId].eventId;
	}

	function setState(bytes32 contractId, ContractState memory state) public onlyDesignatedActor (contractId) {
		contracts[contractId].state = state;
	}

	function setTerms(bytes32 contractId, ContractTerms memory terms) public onlyDesignatedActor (contractId) {
		contracts[contractId].terms = terms;
	}

	function setEventId(bytes32 contractId, uint256 eventId) public onlyDesignatedActor (contractId) {
		contracts[contractId].eventId = eventId;
	}

	function registerContract(
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
}
