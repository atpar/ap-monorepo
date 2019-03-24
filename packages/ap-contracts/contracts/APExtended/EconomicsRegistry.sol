pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";
import "./IEconomicsRegistry.sol";


contract EconomicsRegistry is APDefinitions, IEconomicsRegistry {

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

	/**
	 * returns the terms of a registered asset
	 * @param contractId id of the asset
	 * @return terms of the asset
	 */
	function getTerms(bytes32 contractId) external view returns (ContractTerms memory) {
		return contracts[contractId].terms;
	}  

	/**
	 * returns the state of a registered asset
	 * @param contractId id of the asset
	 * @return state of the asset
	 */
	function getState(bytes32 contractId) external view returns (ContractState memory) {
		return contracts[contractId].state;
	}

	/**
	 * returns the last event id of a registered asset
	 * @param contractId id of the asset
	 * @return last event id
	 */
	function getEventId(bytes32 contractId) external view returns (uint256) {
		return contracts[contractId].eventId;
	}

	/**
	 * sets next state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param contractId id of the asset
	 * @param state next state of the asset
	 */
	function setState(bytes32 contractId, ContractState memory state) public onlyDesignatedActor (contractId) {
		contracts[contractId].state = state;
	}

	/**
	 * sets new terms for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param contractId id of the asset
	 * @param terms new terms of the asset
	 */
	function setTerms(bytes32 contractId, ContractTerms memory terms) public onlyDesignatedActor (contractId) {
		contracts[contractId].terms = terms;
	}

	/**
	 * sets the last event id for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param contractId id of the asset
	 * @param eventId the last event id
	 */
	function setEventId(bytes32 contractId, uint256 eventId) public onlyDesignatedActor (contractId) {
		contracts[contractId].eventId = eventId;
	}

	/**
	 * stores the terms and the initial state of an asset and sets the address of 
	 * the actor (address of account which is allowed to update the state)
	 * @dev can only be called by a whitelisted actor
	 * @param contractId id of the asset
	 * @param terms terms of the asset
	 * @param state initial state of the asset
	 * @param actor account which is allowed to update the asset state in the future	 
	 */
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
