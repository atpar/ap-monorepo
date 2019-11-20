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
	function getTerms(bytes32 assetId) external view returns (LifecycleTerms memory) {
		return deriveLifecycleTerms(
			productRegistry.getProductTerms(assets[assetId].productId),
			decodeAndGetTerms(assetId)
		);
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

	function getNextNonCyclicEvent(bytes32 assetId) external view returns (bytes32) {
		if (productRegistry.getNonCyclicScheduleLength(assets[assetId].productId) == 0) {
			return bytes32(0);
		}

		CustomTerms memory terms = decodeAndGetTerms(assetId);

		bytes32 _event = productRegistry.getNonCyclicEventAtIndex(
			assets[assetId].productId,
			assets[assetId].nextEventIndex[NON_CYCLIC_INDEX]
		);

		// shift scheduleTime
		(EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(_event);

		return encodeEvent(
			eventType,
			scheduleTimeOffset + terms.anchorDate
		);
	}

	function getNextCyclicEvent(bytes32 assetId, EventType eventType) external view returns (bytes32) {
		if (productRegistry.getCyclicScheduleLength(assets[assetId].productId, eventType) == 0) {
			return bytes32(0);
		}

		CustomTerms memory terms = decodeAndGetTerms(assetId);

		bytes32 _event = productRegistry.getCyclicEventAtIndex(
			assets[assetId].productId,
			eventType,
			assets[assetId].nextEventIndex[uint8(eventType)]
		);

		// shift scheduleTime
		(, uint256 scheduleTimeOffset) = decodeEvent(_event);

		return encodeEvent(
			eventType,
			scheduleTimeOffset + terms.anchorDate
		);
	}

	function getNonCyclicScheduleIndex(bytes32 assetId) external view returns (uint256) {
		return assets[assetId].nextEventIndex[NON_CYCLIC_INDEX];
	}

	function getCyclicScheduleIndex(bytes32 assetId, EventType eventType) external view returns (uint256) {
		return assets[assetId].nextEventIndex[uint8(eventType)];
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
	 * return the anchorDate from which to derive the actual scheduleTimes for the event schedules
	 * @param assetId id of the asset
	 * @return anchorDate
	 */
	function getAnchorDate(bytes32 assetId) external view returns (uint256) {
		CustomTerms memory terms = decodeAndGetTerms(assetId);
		return terms.anchorDate;
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

	function setNonCyclicEventIndex(bytes32 assetId, uint256 nextIndex) public onlyDesignatedActor (assetId) {
		require(
			productRegistry.getNonCyclicScheduleLength(assets[assetId].productId) > nextIndex,
			"AssetRegistry.setNonCyclicEventIndex: OUT_OF_BOUNDS"
		);

		assets[assetId].nextEventIndex[NON_CYCLIC_INDEX]++;
	}

	function setCyclicEventIndex(
		bytes32 assetId,
		EventType eventType,
		uint256 nextIndex
	)
		public
		onlyDesignatedActor (assetId)
	{
		require(
			productRegistry.getCyclicScheduleLength(assets[assetId].productId, eventType) > nextIndex,
			"AssetRegistry.setNonCyclicEventIndex: OUT_OF_BOUNDS"
		);

		assets[assetId].nextEventIndex[NON_CYCLIC_INDEX]++;
	}
}
