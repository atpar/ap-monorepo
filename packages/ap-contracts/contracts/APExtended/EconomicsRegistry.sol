pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../APCore/APDefinitions.sol";
import "./IEconomicsRegistry.sol";


contract EconomicsRegistry is APDefinitions, IEconomicsRegistry {

	struct Contract {
		bytes32 assetId;
		ContractTerms terms;
		ContractState state;
		uint256 eventId;
		address actor;
	}

	mapping (bytes32 => Contract) public contracts;

	modifier onlyDesignatedActor(bytes32 assetId) {
		require(contracts[assetId].actor == msg.sender, "UNAUTHORIZED_SENDER");
		_;
	}

	/**
	 * returns the terms of a registered asset
	 * @param assetId id of the asset
	 * @return terms of the asset
	 */
	function getTerms(bytes32 assetId) external view returns (ContractTerms memory) {
		return contracts[assetId].terms;
	}  

	/**
	 * returns the state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getState(bytes32 assetId) external view returns (ContractState memory) {
		return contracts[assetId].state;
	}

	/**
	 * returns the last event id of a registered asset
	 * @param assetId id of the asset
	 * @return last event id
	 */
	function getEventId(bytes32 assetId) external view returns (uint256) {
		return contracts[assetId].eventId;
	}

	/**
	 * sets next state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setState(bytes32 assetId, ContractState memory state) public onlyDesignatedActor (assetId) {
		contracts[assetId].state = state;
	}

	/**
	 * sets new terms for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param terms new terms of the asset
	 */
	function setTerms(bytes32 assetId, ContractTerms memory terms) public onlyDesignatedActor (assetId) {
		contracts[assetId].terms = terms;
	}

	/**
	 * sets the last event id for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param eventId the last event id
	 */
	function setEventId(bytes32 assetId, uint256 eventId) public onlyDesignatedActor (assetId) {
		contracts[assetId].eventId = eventId;
	}

	/**
	 * stores the terms and the initial state of an asset and sets the address of 
	 * the actor (address of account which is allowed to update the state)
	 * @dev can only be called by a whitelisted actor
	 * @param assetId id of the asset
	 * @param terms terms of the asset
	 * @param state initial state of the asset
	 * @param actor account which is allowed to update the asset state in the future	 
	 */
	function registerContract(
		bytes32 assetId,
		ContractTerms memory terms,
		ContractState memory state,
		address actor
	) 
		public 
	{
		require(contracts[assetId].assetId == bytes32(0), "ENTRY_ALREADY_EXISTS");
		
		contracts[assetId] = Contract(
			assetId,
			terms,
			state,
			0,
			actor
		);
	}
}
