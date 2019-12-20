pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";


/**
 * @title Economics
 */
contract Economics is AssetRegistryStorage {

    event IncrementedScheduleIndex(bytes32 indexed assetId, uint8 scheduleId, uint256 scheduleIndex);

    event UpdatedState(bytes32 indexed assetId, uint256 statusDate);

    event UpdatedFinalizedState(bytes32 indexed assetId, uint256 statusDate);


    modifier onlyDesignatedActor(bytes32 assetId) {
        require(
            assets[assetId].actor == msg.sender,
            "AssetRegistry.onlyDesignatedActor: UNAUTHORIZED_SENDER"
        );
        _;
    }

    /**
     * @notice Returns the terms of an asset.
     * @param assetId id of the asset
     * @return terms of the asset
     */
    function getTerms(bytes32 assetId) external view returns (LifecycleTerms memory) {
        return decodeAndGetTerms(assetId);
    }

    /**
     * @notice Returns the state of an asset.
     * @param assetId id of the asset
     * @return state of the asset
     */
    function getState(bytes32 assetId) external view returns (State memory) {
        return decodeAndGetState(assetId);
    }

    /**
     * @notice Returns the state of an asset.
     * @param assetId id of the asset
     * @return state of the asset
     */
    function getFinalizedState(bytes32 assetId) external view returns (State memory) {
        return decodeAndGetFinalizedState(assetId);
    }

    /**
     * @notice Returns the anchor date of an asset.
     * @param assetId id of the asset
     * @return Anchor date
     */
    function getAnchorDate(bytes32 assetId) external view returns (uint256) {
        return decodeAndGetAnchorDate(assetId);
    }

    /**
     * @notice Returns the address of a the ACTUS engine corresponding to the ContractType of an asset.
     * @param assetId id of the asset
     * @return address of the engine of the asset
     */
    function getEngineAddress(bytes32 assetId) external view returns (address) {
        return assets[assetId].engine;
    }

    /**
     * @notice Returns the address of the actor which is allowed to update the state of the asset.
     * @param assetId id of the asset
     * @return address of the asset actor
     */
    function getActorAddress(bytes32 assetId) external view returns (address) {
        return assets[assetId].actor;
    }

    /**
     * @notice Returns the id of the template which this asset is based on.
     * @param assetId id of the asset
     * @return id of the template
     */
    function getTemplateId(bytes32 assetId) external view returns (bytes32) {
        return assets[assetId].templateId;
    }

    /**
     * @notice Returns the next event to process by checking for the earliest schedule time
     * for each upcoming event of each schedule (non-cyclic, cyclic schedules). If the underlying
     * of the asset changes in performance to a covered performance, it returns the ExecutionDate event.
     * @param assetId id of the asset
     * @return event
     */
    function getNextEvent (bytes32 assetId) external view returns (bytes32) {
        LifecycleTerms memory terms = decodeAndGetTerms(assetId);

        EventType nextEventType;
        uint256 nextScheduleTimeOffset;

        // non-cyclic Events
        if (templateRegistry.getScheduleLength(assets[assetId].templateId, NON_CYCLIC_INDEX) > 0) {
            bytes32 nonCyclicEvent = templateRegistry.getEventAtIndex(
                assets[assetId].templateId,
                NON_CYCLIC_INDEX,
                assets[assetId].nextEventIndex[NON_CYCLIC_INDEX]
            );
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(nonCyclicEvent);

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset < nextScheduleTimeOffset)
                || (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }
        }

        // IP / IPCI Events
        if (templateRegistry.getScheduleLength(assets[assetId].templateId, uint8(EventType.IP)) > 0) {
            bytes32 ipEvent = templateRegistry.getEventAtIndex(
                assets[assetId].templateId,
                uint8(EventType.IP),
                assets[assetId].nextEventIndex[uint8(EventType.IP)]
            );
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(ipEvent);

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset < nextScheduleTimeOffset)
                || (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }
        }

        // PR Events
        if (templateRegistry.getScheduleLength(assets[assetId].templateId, uint8(EventType.PR)) > 0) {
            bytes32 prEvent = templateRegistry.getEventAtIndex(
                assets[assetId].templateId,
                uint8(EventType.PR),
                assets[assetId].nextEventIndex[uint8(EventType.PR)]
            );
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(prEvent);

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset < nextScheduleTimeOffset)
                || (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }
        }

        // SC Events
        if (templateRegistry.getScheduleLength(assets[assetId].templateId, uint8(EventType.SC)) > 0) {
            bytes32 scEvent = templateRegistry.getEventAtIndex(
                assets[assetId].templateId,
                uint8(EventType.SC),
                assets[assetId].nextEventIndex[uint8(EventType.SC)]
            );
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(scEvent);

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset < nextScheduleTimeOffset)
                || (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }
        }

        // RR Events
        if (templateRegistry.getScheduleLength(assets[assetId].templateId, uint8(EventType.RR)) > 0) {
            bytes32 rrEvent = templateRegistry.getEventAtIndex(
                assets[assetId].templateId,
                uint8(EventType.RR),
                assets[assetId].nextEventIndex[uint8(EventType.RR)]
            );
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(rrEvent);

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset < nextScheduleTimeOffset)
                || (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }
        }

        // PY Events
        if (templateRegistry.getScheduleLength(assets[assetId].templateId, uint8(EventType.PY)) > 0) {
            bytes32 pyEvent = templateRegistry.getEventAtIndex(
                assets[assetId].templateId,
                uint8(EventType.PY),
                assets[assetId].nextEventIndex[uint8(EventType.PY)]
            );
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(pyEvent);

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset < nextScheduleTimeOffset)
                || (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }
        }

        // Underlying
        if (
            terms.contractReference_1.object != bytes32(0)
            && terms.contractReference_1.contractReferenceRole == ContractReferenceRole.CVE
        ) {
            State memory state = decodeAndGetState(assetId);
            bytes32 underlyingAssetId = terms.contractReference_1.object;
            State memory underlyingState = decodeAndGetState(underlyingAssetId);
            LifecycleTerms memory underlyingTerms = decodeAndGetTerms(underlyingAssetId);

            require(
                underlyingState.statusDate != uint256(0),
                "AssetActor.getNextEvent: ENTRY_DOES_NOT_EXIST"
            );

            // check if ExecutionDate has been triggered
            if (state.executionAmount > 0) {
                // insert SettlementDate event
                nextEventType = EventType.STD;
                nextScheduleTimeOffset = block.timestamp;
                return encodeEvent(nextEventType, nextScheduleTimeOffset);
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
                return encodeEvent(nextEventType, nextScheduleTimeOffset);
            }
        }

        return encodeEvent(
            nextEventType,
            nextScheduleTimeOffset + decodeAndGetAnchorDate(assetId)
        );
    }

    /**
     * @notice Returns the index of the last processed event for a schedule of an asset.
     * @param assetId id of the asset
     * @param scheduleId id of the schedule
     * @return Index
     */
    function getScheduleIndex(bytes32 assetId, uint8 scheduleId) external view returns (uint256) {
        return assets[assetId].nextEventIndex[scheduleId];
    }

    /**
     * @notice Increments the index of a schedule of an asset.
     * (if max index is reached the index will be left unchanged)
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

        if (scheduleIndex == templateRegistry.getScheduleLength(assets[assetId].templateId, scheduleId)) {
            return;
        }

        assets[assetId].nextEventIndex[scheduleId] = scheduleIndex + 1;

        emit IncrementedScheduleIndex(assetId, scheduleId, assets[assetId].nextEventIndex[scheduleId]);
    }

    /**
     * @notice Sets next state of an asset.
     * @dev Can only be updated by the assets actor.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setState(bytes32 assetId, State memory state) public onlyDesignatedActor (assetId) {
        encodeAndSetState(assetId, state);

        emit UpdatedState(assetId, state.statusDate);
    }

    /**
     * @notice Sets next finalized state of an asset.
     * @dev Can only be updated by the assets actor.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setFinalizedState(bytes32 assetId, State memory state) public onlyDesignatedActor (assetId) {
        encodeAndSetFinalizedState(assetId, state);

        emit UpdatedFinalizedState(assetId, state.statusDate);
    }
}
