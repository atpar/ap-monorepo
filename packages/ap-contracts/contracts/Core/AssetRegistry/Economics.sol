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
		return decodeAndGetTerms(assetId);
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
		return decodeAndGetAnchorDate(assetId);
	}

	/**
	 * returns the next event to process by checking for the earliest schedule time for each
	 * upcoming event of each schedule (non-cyclic, cyclic schedules).
	 * if the underlying of the asset changes its performance to a covered performance
	 * it returns the ExecutionDate event
	 * @param assetId id of the asset
	 * @return event
	 */
	function getNextEvent (bytes32 assetId) external view returns (bytes32) {
		LifecycleTerms memory terms = decodeAndGetTerms(assetId);

		EventType nextEventType;
		uint256 nextScheduleTimeOffset;

		// non-cyclic Events
		if (productRegistry.getScheduleLength(assets[assetId].productId, NON_CYCLIC_INDEX) > 0) {
			bytes32 nonCyclicEvent = productRegistry.getEventAtIndex(
				assets[assetId].productId,
				NON_CYCLIC_INDEX,
				assets[assetId].nextEventIndex[NON_CYCLIC_INDEX]
			);
			(EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(nonCyclicEvent);

			if (
				(scheduleTimeOffset > nextScheduleTimeOffset)
				|| (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
			) {
				nextScheduleTimeOffset = scheduleTimeOffset;
				nextEventType = eventType;
			}
		}

		// IP / IPCI Events
		if (productRegistry.getScheduleLength(assets[assetId].productId, uint8(EventType.IP)) > 0) {
			bytes32 ipEvent = productRegistry.getEventAtIndex(
				assets[assetId].productId,
				uint8(EventType.IP),
				assets[assetId].nextEventIndex[uint8(EventType.IP)]
			);
			(EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(ipEvent);

			if (
				(scheduleTimeOffset > nextScheduleTimeOffset)
				|| (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
			) {
				nextScheduleTimeOffset = scheduleTimeOffset;
				nextEventType = eventType;
			}
		}

		// PR Events
		if (productRegistry.getScheduleLength(assets[assetId].productId, uint8(EventType.PR)) > 0) {
			bytes32 prEvent = productRegistry.getEventAtIndex(
				assets[assetId].productId,
				uint8(EventType.PR),
				assets[assetId].nextEventIndex[uint8(EventType.PR)]
			);
			(EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(prEvent);

			if (
				(scheduleTimeOffset > nextScheduleTimeOffset)
				|| (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
			) {
				nextScheduleTimeOffset = scheduleTimeOffset;
				nextEventType = eventType;
			}
		}

		// SC Events
		if (productRegistry.getScheduleLength(assets[assetId].productId, uint8(EventType.SC)) > 0) {
			bytes32 scEvent = productRegistry.getEventAtIndex(
				assets[assetId].productId,
				uint8(EventType.SC),
				assets[assetId].nextEventIndex[uint8(EventType.SC)]
			);
			(EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(scEvent);

			if (
				(scheduleTimeOffset > nextScheduleTimeOffset)
				|| (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
			) {
				nextScheduleTimeOffset = scheduleTimeOffset;
				nextEventType = eventType;
			}
		}

		// RR Events
		if (productRegistry.getScheduleLength(assets[assetId].productId, uint8(EventType.RR)) > 0) {
			bytes32 rrEvent = productRegistry.getEventAtIndex(
				assets[assetId].productId,
				uint8(EventType.RR),
				assets[assetId].nextEventIndex[uint8(EventType.RR)]
			);
			(EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(rrEvent);

			if (
				(scheduleTimeOffset > nextScheduleTimeOffset)
				|| (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
			) {
				nextScheduleTimeOffset = scheduleTimeOffset;
				nextEventType = eventType;
			}
		}

		// PY Events
		if (productRegistry.getScheduleLength(assets[assetId].productId, uint8(EventType.PY)) > 0) {
			bytes32 pyEvent = productRegistry.getEventAtIndex(
				assets[assetId].productId,
				uint8(EventType.PY),
				assets[assetId].nextEventIndex[uint8(EventType.PY)]
			);
			(EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(pyEvent);

			if (
				(scheduleTimeOffset > nextScheduleTimeOffset)
				|| (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
			) {
				nextScheduleTimeOffset = scheduleTimeOffset;
				nextEventType = eventType;
			}
		}

		// Underlying
		bytes32 underlyingAssetId = terms.contractStructure.object;
		if (underlyingAssetId != bytes32(0)) {
			State memory underlyingState = decodeAndGetState(underlyingAssetId);
			LifecycleTerms memory underlyingTerms = decodeAndGetTerms(underlyingAssetId);

			require(
				underlyingState.statusDate != uint256(0),
				"AssetActor.getNextEvent: ENTRY_DOES_NOT_EXIST"
			);

			// check if ExecutionDate has been triggered
			if (underlyingState.executionAmount > 0) {
				// insert SettlementDate event
				nextEventType = EventType.STD;
				nextScheduleTimeOffset = block.timestamp;
			// if not check if performance of underlying asset is covered by this asset
			} else if (underlyingState.contractPerformance == terms.creditEventTypeCovered) {
				// insert ExecutionDate event
				nextEventType = EventType.XD;
				// derive scheduleTimeOffset from performance
				if (underlyingState.contractPerformance == ContractPerformance.DL) {
					nextScheduleTimeOffset = underlyingState.nonPerformingDate;
				} else if (underlyingState.contractPerformance == ContractPerformance.DQ) {
					nextScheduleTimeOffset = getTimestampPlusPeriod(underlyingTerms.gracePeriod, underlyingState.nonPerformingDate);
				} else if (underlyingState.contractPerformance == ContractPerformance.DF) {
					nextScheduleTimeOffset = getTimestampPlusPeriod(underlyingTerms.delinquencyPeriod, underlyingState.nonPerformingDate);
				}
			}
		}

		return encodeEvent(
			nextEventType,
			nextScheduleTimeOffset + decodeAndGetAnchorDate(assetId)
		);
	}

	/**
	 * returns the index of the last processed event for a schedule of an asset
	 * @param assetId id of the asset
	 * @param scheduleId id of the schedule
	 * @return Index
	 */
	function getScheduleIndex(bytes32 assetId, uint8 scheduleId) external view returns (uint256) {
		return assets[assetId].nextEventIndex[scheduleId];
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
	 * increments the index of a schedule of an asset
	 * if max index is reached the index will be left unchanged
	 * @param assetId id of the asset
	 * @param scheduleId id of the schedule
	 */
	function incrementScheduleIndex(
		bytes32 assetId,
		uint8 scheduleId
	)
		external
		onlyDesignatedActor (assetId)
	{
		uint256 scheduleIndex = assets[assetId].nextEventIndex[scheduleId];

		if (scheduleIndex == productRegistry.getScheduleLength(assets[assetId].productId, scheduleId)) {
			return;
		}

		assets[assetId].nextEventIndex[scheduleId] = scheduleIndex + 1;
	}
}
