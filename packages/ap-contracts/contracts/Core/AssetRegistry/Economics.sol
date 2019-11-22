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
	 * returns the terms of an asset
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
	 * returns the state of an asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getState(bytes32 assetId) external view returns (State memory) {
		return decodeAndGetState(assetId);
	}

	/**
	 * returns the state of an asset
	 * @param assetId id of the asset
	 * @return state of the asset
	 */
	function getFinalizedState(bytes32 assetId) external view returns (State memory) {
		return decodeAndGetFinalizedState(assetId);
	}

	/**
	 * returns the address of a the ACTUS engine corresponding to the ContractType of an asset
	 * @param assetId id of the asset
	 * @return address of the engine of the asset
	 */
	function getEngineAddress(bytes32 assetId) external view returns (address) {
		return assets[assetId].engine;
	}

	/**
	 * returns the anchor date of an asset
	 * @param assetId id of the asset
	 * @return Anchor date
	 */
	function getAnchorDate(bytes32 assetId) external view returns (uint256) {
		CustomTerms memory terms = decodeAndGetTerms(assetId);
		return terms.anchorDate;
	}

	/**
	 * returns the next event of the non-cyclic event schedule of an asset
	 * @param assetId id of the asset
	 * @return next event of the non-cyclic schedule
	 */
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

	/**
	 * returns the next event of a cyclic event schedule of an asset
	 * @param assetId id of the asset
	 * @param eventType event type of the cyclic schedule
	 * @return next event of the non-cyclic event schedule
	 */
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

	/**
	 * returns the index of the last processed event for a non-cyclic schedule of an asset
	 * @param assetId id of the asset
	 * @return Index
	 */
	function getNonCyclicScheduleIndex(bytes32 assetId) external view returns (uint256) {
		return assets[assetId].nextEventIndex[NON_CYCLIC_INDEX];
	}

	/**
	 * returns the index of the last processed event for a non-cyclic schedule of an asset
	 * @param assetId id of the asset
	 * @param eventType event type of the cyclic schedule
	 * @return Index
	 */
	function getCyclicScheduleIndex(bytes32 assetId, EventType eventType) external view returns (uint256) {
		return assets[assetId].nextEventIndex[uint8(eventType)];
	}

	/**
	 * sets next state of an asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setState(bytes32 assetId, State memory state) public onlyDesignatedActor (assetId) {
		encodeAndSetState(assetId, state);
	}

	/**
	 * sets next finalized state of an asset
	 * @dev can only be updated by the assets actor
	 * @param assetId id of the asset
	 * @param state next state of the asset
	 */
	function setFinalizedState(bytes32 assetId, State memory state) public onlyDesignatedActor (assetId) {
		encodeAndSetFinalizedState(assetId, state);
	}

	/**
	 * increments the index of a non-cyclic schedule of an asset
	 * if max index is reached the index is left unchanged
	 * @param assetId id of the asset
	 */
	function incrementNonCyclicScheduleIndex(bytes32 assetId) public onlyDesignatedActor (assetId) {
		uint256 scheduleIndex = assets[assetId].nextEventIndex[NON_CYCLIC_INDEX];

		if (
			scheduleIndex == productRegistry.getNonCyclicScheduleLength(assets[assetId].productId)
		) {
			return;
		}

		assets[assetId].nextEventIndex[NON_CYCLIC_INDEX] = scheduleIndex + 1;
	}

	/**
	 * sets the index of a cyclic schedule of an asset
	 * @param assetId id of the asset
	 * @param eventType event type of the cyclic schedule
	 */
	function incrementCyclicScheduleIndex(
		bytes32 assetId,
		EventType eventType
	)
		public
		onlyDesignatedActor (assetId)
	{
		uint256 scheduleIndex = assets[assetId].nextEventIndex[uint8(eventType)];

		if (
			scheduleIndex == productRegistry.getCyclicScheduleLength(
				assets[assetId].productId,
				eventType
			)
		) {
			return;
		}

		assets[assetId].nextEventIndex[uint8(eventType)] = scheduleIndex + 1;
	}
}
