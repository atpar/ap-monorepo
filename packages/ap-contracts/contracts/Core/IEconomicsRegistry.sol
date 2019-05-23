pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";


contract IEconomicsRegistry is Definitions {

	/**
	 * returns the terms of a registered asset
	 * @param assetId id of the asset
	 * @return terms of the asset
	 */
	function getTerms(bytes32 assetId) external view returns (ContractTerms memory);

	/**
	 * returns the state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getState(bytes32 assetId) external view returns (ContractState memory);

	/**
	 * returns the last event id of a registered asset
	 * @param assetId id of the asset
	 * @return last event id
	 */
	function getEventId(bytes32 assetId) external view returns (uint256);

	/**
	 * sets next state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setState(bytes32 assetId, ContractState memory state) public;

	/**
	 * sets new terms for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param terms new terms of the asset
	 */
	function setTerms(bytes32 assetId, ContractTerms memory terms) public;

	/**
	 * sets the last event id for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param eventId the last event id
	 */
	function setEventId(bytes32 assetId, uint256 eventId) public;

	/**
	 * stores the terms and the initial state of an asset and sets the address of
	 * the actor (address of account which is allowed to update the state)
	 * @dev can only be called by a whitelisted actor
	 * @param assetId id of the asset
	 * @param terms terms of the asset
	 * @param state initial state of the asset
	 * @param actor account which is allowed to update the asset state in the future
	 */
	function registerEconomics(
		bytes32 assetId,
		ContractTerms memory terms,
		ContractState memory state,
		address actor
	)
		public;
}