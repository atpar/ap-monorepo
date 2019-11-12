pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


contract Economics is AssetRegistryStorage {

	modifier onlyDesignatedActor(bytes32 assetId) {
		require(
			assets[assetId].actor == msg.sender,
			"AssetRegistry.onlyDesignatedActor: UNAUTHORIZED_SENDER"
		);
		_;
	}

	/**
	 * returns the terms of a registered asset
	 * @param assetId id of the asset
	 * @return terms of the asset
	 */
	function getTerms(bytes32 assetId) external view returns (Terms memory) {
		return decodeAndGetTerms(assetId);
	}

	/**
	 * returns the state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getState(bytes32 assetId) external view returns (State memory) {
		return decodeAndGetState(assetId);
	}

	/**
	 * returns the finalized state of a registered asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getFinalizedState(bytes32 assetId) external view returns (State memory) {
		return decodeAndGetFinalizedState(assetId);
	}

	function getNextNonCyclicProtoEvent(bytes32 assetId) external view returns (bytes32) {
		if (assets[assetId].protoEventSchedules[NON_CYCLIC_INDEX].numberOfProtoEvents == 0) {
			return bytes32(0);
		}

		return assets[assetId].protoEventSchedules[NON_CYCLIC_INDEX].protoEventSchedule[
			assets[assetId].protoEventSchedules[NON_CYCLIC_INDEX].nextProtoEventIndex
		];
	}

	function getNextCyclicProtoEvent(bytes32 assetId, EventType eventType) external view returns (bytes32) {
		if (assets[assetId].protoEventSchedules[uint8(eventType)].numberOfProtoEvents == 0) {
			return bytes32(0);
		}

		return assets[assetId].protoEventSchedules[uint8(eventType)].protoEventSchedule[
			assets[assetId].protoEventSchedules[uint8(eventType)].nextProtoEventIndex
		];
	}

	function getNonCyclicProtoEventAtIndex(bytes32 assetId, uint256 index) external view returns (bytes32) {
		return assets[assetId].protoEventSchedules[NON_CYCLIC_INDEX].protoEventSchedule[index];
	}

	function getCyclicProtoEventAtIndex(bytes32 assetId, EventType eventType, uint256 index) external view returns (bytes32) {
		return assets[assetId].protoEventSchedules[uint8(eventType)].protoEventSchedule[index];
	}

	function getNonCyclicProtoEventScheduleLength(bytes32 assetId) external view returns (uint256) {
		return assets[assetId].protoEventSchedules[NON_CYCLIC_INDEX].numberOfProtoEvents;
	}

	function getCyclicProtoEventScheduleLength(bytes32 assetId, EventType eventType) external view returns (uint256) {
		return assets[assetId].protoEventSchedules[uint8(eventType)].numberOfProtoEvents;
	}

	function getNonCyclicProtoEventScheduleIndex(bytes32 assetId) external view returns (uint256) {
		return assets[assetId].protoEventSchedules[NON_CYCLIC_INDEX].nextProtoEventIndex;
	}

	function getCyclicProtoEventScheduleIndex(bytes32 assetId, EventType eventType) external view returns (uint256) {
		return assets[assetId].protoEventSchedules[uint8(eventType)].nextProtoEventIndex;
	}

  /**
	 * returns the address of a the ACTUS engine corresponding to the ContractType of a registered asset
	 * @param assetId id of the asset
	 * @return address of the ACTUS engine
	 */
	function getEngineAddress(bytes32 assetId) external view returns (address) {
		return assets[assetId].engine;
	}

	/**
	 * sets new terms for a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param terms new terms of the asset
	 */
	function setTerms(bytes32 assetId, Terms memory terms) public onlyDesignatedActor (assetId) {
		encodeAndSetTerms(assetId, terms);
	}

	/**
	 * sets next state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setState(bytes32 assetId, State memory state) public onlyDesignatedActor (assetId) {
		encodeAndSetState(assetId, state);
	}

	/**
	 * sets next finalized state of a registered asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setFinalizedState(bytes32 assetId, State memory state) public onlyDesignatedActor (assetId) {
		encodeAndSetFinalizedState(assetId, state);
	}

	/**
	 * @param assetId id of the asset
	 * @param protoEventSchedules all ProtoEvent schedules
	 */
	function setProtoEventSchedules(
		bytes32 assetId,
		ProtoEventSchedules memory protoEventSchedules
	)
		public
		onlyDesignatedActor (assetId)
	{
		encodeAndSetProtoEventSchedules(assetId, protoEventSchedules);
	}

	function setNonCyclicProtoEventIndex(
		bytes32 assetId,
		uint256 nextIndex
	)
		public
		onlyDesignatedActor (assetId)
	{
		require(
			assets[assetId].protoEventSchedules[NON_CYCLIC_INDEX].numberOfProtoEvents > nextIndex,
			"AssetRegistry.setNonCyclicProtoEventIndex: OUT_OF_BOUNDS"
		);

		assets[assetId].protoEventSchedules[NON_CYCLIC_INDEX].nextProtoEventIndex++;
	}

	function setCyclicProtoEventIndex(
		bytes32 assetId,
		EventType eventType,
		uint256 nextIndex
	)
		public
		onlyDesignatedActor (assetId)
	{
		require(
			assets[assetId].protoEventSchedules[uint8(eventType)].numberOfProtoEvents > nextIndex,
			"AssetRegistry.setCyclicProtoEventIndex: OUT_OF_BOUNDS"
		);

		assets[assetId].protoEventSchedules[uint8(eventType)].nextProtoEventIndex++;
	}
}
