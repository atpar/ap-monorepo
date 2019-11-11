pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract IAssetRegistry is AssetRegistryStorage {

	/**
	 * update the address of the default beneficiary of cashflows going to the record creator
	 * @param assetId id of the asset
	 * @param newRecordCreatorBeneficiary address of the new beneficiary
	 */
	function setRecordCreatorBeneficiary(
		bytes32 assetId,
		address payable newRecordCreatorBeneficiary
	)
		external;

	/**
	 * update the address of the default beneficiary of cashflows going to the counter party
	 * @param assetId id of the asset
	 * @param newCounterpartyBeneficiary address of the new beneficiary
	 */
	function setCounterpartyBeneficiary(
		bytes32 assetId,
		address payable newCounterpartyBeneficiary
	)
		external;

	/**
 	 * register the address of the owner of specific claims of the asset
	 * @param assetId id of the asset
	 * @param cashflowId id of the specific claims for which to register the owner
	 * @param beneficiary the address of the owner
	 */
	function setBeneficiaryForCashflowId(
		bytes32 assetId,
		int8 cashflowId,
		address payable beneficiary
	)
		external;

	/**
 	 * retrieve the registered addresses of owners (Creator, Counterparty) of an asset
	 * @param assetId id of the asset
	 * @return addresses of all owners of the asset
	 */
	function getOwnership(bytes32 assetId)
		external
		view
		returns (AssetOwnership memory);

	/**
	 * retrieve the registered address of the owner of specific future claims from an asset
	 * @param assetId id of the asset
	 * @param cashflowId the identifier of the specific claims owned by the registerd address
	 * @return address of the beneficiary corresponding to the given cashflowId
	 */
	function getCashflowBeneficiary(bytes32 assetId, int8 cashflowId)
		external
		view
		returns (address payable);

	/**
	 * returns the terms of a registered asset
	 * @param assetId id of the asset
	 * @return terms of the asset
	 */
	function getTerms(bytes32 assetId) external view returns (Terms memory);

	/**
	 * returns the state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getState(bytes32 assetId) external view returns (State memory);

	/**
	 * returns the state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getFinalizedState(bytes32 assetId) external view returns (State memory);

  /**
	 * returns the address of a the ACTUS engine corresponding to the ContractType of a registered asset
	 * @param assetId id of the asset
	 * @return address of the engine of the asset
	 */
	function getEngineAddress(bytes32 assetId) external view returns (address);

	/**
	 * returns the stored ProtoEvent schedule for all non-cyclic events of a registered asset
	 * @param assetId id of the asset
	 * @return ProtoEvent schedule of the asset
	 */
	function getCyclicSchedule(bytes32 assetId) external view returns (bytes32[] memory);

	/**
	 * returns the stored ProtoEvent schedule for a given cyclic event of a registered asset
	 * @param assetId id of the asset
	 * @param eventType event type to return the cyclic ProtoEvent schedule for
	 * @return ProtoEvent schedule of the asset
	 */
	function getNonCyclicSchedule(bytes32 assetId, EventType eventType) external view returns (bytes32[] memory);

	/**
	 * returns the next ProtoEvent of the non-cyclic ProtoEvent schedule
	 * @param assetId id of the asset
	 * @return next ProtoEvent of the non-cyclic ProtoEvent schedule
	 */
	function getNextNonCyclicProtoEvent(bytes32 assetId) external view returns (bytes32);

	/**
	 * returns the next ProtoEvent of for a cyclic ProtoEvent schedule
	 * @param assetId id of the asset
	 * @param eventType event type of the cyclic ProtoEvent schedule
	 * @return next ProtoEvent of the non-cyclic ProtoEvent schedule
	 */
	function getNextCyclicProtoEvent(bytes32 assetId, EventType eventType) external view returns (bytes32);

	/**
	 * sets next state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setState(bytes32 assetId, State memory state) public;

	/**
	 * sets next finalized state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setFinalizedState(bytes32 assetId, State memory state) public;

	/**
	 * sets new terms for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param terms new terms of the asset
	 */
	function setTerms(bytes32 assetId, Terms memory terms) public;

	/**
	 * @param assetId id of the asset
	 * @param protoEventSchedules all ProtoEvent schedules
	 */
	function setProtoEventSchedules(bytes32 assetId, ProtoEventSchedules memory protoEventSchedules) public;

	/**
	 * Stores the addresses of the owners (owner of creator-side payment obligations,
	 * owner of creator-side payment claims), terms and the initial state of an asset
	 * and sets the address of the actor (address of account which is allowed to update the state).
	 * @dev the terms and state can only be called by a whitelisted actor
	 * @param assetId id of the asset
	 * @param ownership ownership of the asset
	 * @param terms terms of the asset
	 * @param state initial state of the asset
	 * @param protoEventSchedules ProtoEvent schedules of the asset
	 * @param engine ACTUS Engine of the asset
	 * @param actor account which is allowed to update the asset state
	 */
	function registerAsset(
		bytes32 assetId,
		AssetOwnership memory ownership,
		Terms memory terms,
		State memory state,
		ProtoEventSchedules memory protoEventSchedules,
    address engine,
		address actor
	)
		public;
}
