pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "./AssetRegistryStorage.sol";
import "./AccessControl.sol";
import "./IAssetRegistry.sol";


/**
 * @title Economics
 */
abstract contract Economics is AssetRegistryStorage, IAssetRegistry, AccessControl {

    event IncrementedScheduleIndex(bytes32 indexed assetId, uint256 nextScheduleIndex);
    event UpdatedCustomTerms(bytes32 indexed assetId);
    event UpdatedState(bytes32 indexed assetId, uint256 statusDate);
    event UpdatedFinalizedState(bytes32 indexed assetId, uint256 statusDate);
    event UpdatedAnchorDate(bytes32 indexed assetId, uint256 prevAnchorDate, uint256 anchorDate);
    event UpdatedEngine(bytes32 indexed assetId, address prevEngine, address newEngine);
    event UpdatedActor(bytes32 indexed assetId, address prevActor, address newActor);


    modifier isAuthorized(bytes32 assetId) {
        require(
            msg.sender == assets[assetId].actor || hasAccess(assetId, msg.sig, msg.sender),
            "AssetRegistry.isAuthorized: UNAUTHORIZED_SENDER"
        );
        _;
    }

    /**
     * @notice Returns the terms of an asset.
     * @param assetId id of the asset
     * @return terms of the asset
     */
    function getTerms(bytes32 assetId)
        external
        view
        override
        returns (LifecycleTerms memory)
    {
        return decodeAndGetTerms(assetId);
    }

    /**
     * @notice Returns the state of an asset.
     * @param assetId id of the asset
     * @return state of the asset
     */
    function getState(bytes32 assetId)
        external
        view
        override
        returns (State memory)
    {
        return decodeAndGetState(assetId);
    }

    /**
     * @notice Returns the state of an asset.
     * @param assetId id of the asset
     * @return state of the asset
     */
    function getFinalizedState(bytes32 assetId)
        external
        view
        override
        returns (State memory)
    {
        return decodeAndGetFinalizedState(assetId);
    }

    /**
     * @notice Returns the anchor date of an asset.
     * @param assetId id of the asset
     * @return Anchor date
     */
    function getAnchorDate(bytes32 assetId)
        external
        view
        override
        returns (uint256)
    {
        return decodeAndGetAnchorDate(assetId);
    }

    /**
     * @notice Returns the address of a the ACTUS engine corresponding to the ContractType of an asset.
     * @param assetId id of the asset
     * @return address of the engine of the asset
     */
    function getEngine(bytes32 assetId)
        external
        view
        override
        returns (address)
    {
        return assets[assetId].engine;
    }

    /**
     * @notice Returns the address of the actor which is allowed to update the state of the asset.
     * @param assetId id of the asset
     * @return address of the asset actor
     */
    function getActor(bytes32 assetId)
        external
        view
        override
        returns (address)
    {
        return assets[assetId].actor;
    }

    /**
     * @notice Returns the id of the template which this asset is based on.
     * @param assetId id of the asset
     * @return id of the template
     */
    function getTemplateId(bytes32 assetId)
        external
        view
        override
        returns (bytes32)
    {
        return assets[assetId].templateId;
    }

    function getPendingEvent (bytes32 assetId)
        external
        view
        override
        returns (bytes32)
    {
        return assets[assetId].pendingEvent;
    }

    function pushPendingEvent (bytes32 assetId, bytes32 pendingEvent)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].pendingEvent = pendingEvent;
    }

    function popPendingEvent (bytes32 assetId)
        external
        override
        isAuthorized (assetId)
        returns (bytes32)
    {
        bytes32 pendingEvent = assets[assetId].pendingEvent;
        assets[assetId].pendingEvent = bytes32(0);

        return pendingEvent;
    }

    /**
     * @notice If the underlying of the asset changes in performance to a covered performance,
     * it returns the exerciseDate event.
     */
    function getNextUnderlyingEvent (bytes32 assetId)
        external
        view
        override
        returns (bytes32)
    {
        LifecycleTerms memory terms = decodeAndGetTerms(assetId);
        State memory state = decodeAndGetState(assetId);

        // check for COVE
        if (
            terms.contractReference_1.object != bytes32(0)
            && terms.contractReference_1.role == ContractReferenceRole.COVE
        ) {
            bytes32 underlyingAssetId = terms.contractReference_1.object;
            State memory underlyingState = decodeAndGetState(underlyingAssetId);

            require(
                assets[underlyingAssetId].isSet == true,
                "AssetActor.getNextObservedEvent: ENTRY_DOES_NOT_EXIST"
            );

            // check if exerciseDate has been triggered
            if (state.exerciseDate > 0) {
                // insert SettlementDate event
                return encodeEvent(
                    EventType.STD,
                    // solium-disable-next-line
                    block.timestamp
                );
            // if not check if performance of underlying asset is covered by this asset (PF excluded)
            } else if (
                terms.creditEventTypeCovered != ContractPerformance.PF
                && underlyingState.contractPerformance == terms.creditEventTypeCovered
            ) {
                // insert exerciseDate event
                // derive scheduleTimeOffset from performance
                if (underlyingState.contractPerformance == ContractPerformance.DL) {
                    return encodeEvent(
                        EventType.XD,
                        underlyingState.nonPerformingDate
                    );
                } else if (underlyingState.contractPerformance == ContractPerformance.DQ) {
                    LifecycleTerms memory underlyingTerms = decodeAndGetTerms(underlyingAssetId);
                    return encodeEvent(
                        EventType.XD,
                        getTimestampPlusPeriod(underlyingTerms.gracePeriod, underlyingState.nonPerformingDate)
                    );
                } else if (underlyingState.contractPerformance == ContractPerformance.DF) {
                    LifecycleTerms memory underlyingTerms = decodeAndGetTerms(underlyingAssetId);
                    return encodeEvent(
                        EventType.XD,
                        getTimestampPlusPeriod(underlyingTerms.delinquencyPeriod, underlyingState.nonPerformingDate)
                    );
                }
            }
        }

        return encodeEvent(EventType(0), 0);
    }


    /**
     * @notice Returns the index of the next event to be processed for a schedule of an asset.
     * @param assetId id of the asset
     * @return Index
     */
    function getNextScheduleIndex(bytes32 assetId)
        external
        view
        override
        returns (uint256)
    {
        return assets[assetId].nextScheduleIndex;
    }

    /**
     * @notice Returns the next event to process.
     * @param assetId id of the asset
     * @return event
     */
    function getNextScheduledEvent (bytes32 assetId)
        external
        view
        override
        returns (bytes32)
    {
        if (templateRegistry.getScheduleLength(assets[assetId].templateId) == 0) {
            return encodeEvent(EventType(0), 0);
        }
        
        bytes32 _event = templateRegistry.getEventAtIndex(
            assets[assetId].templateId,
            assets[assetId].nextScheduleIndex
        );
        (EventType nextEventType, uint256 nextScheduleTimeOffset) = decodeEvent(_event);

        return encodeEvent(
            nextEventType,
            applyAnchorDateToOffset(decodeAndGetAnchorDate(assetId), nextScheduleTimeOffset)
        );
    }

    /**
     * @notice Increments the index of a schedule of an asset.
     * (if max index is reached the index will be left unchanged)
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     */
    function popNextScheduledEvent(bytes32 assetId)
        external
        override
        isAuthorized (assetId)
        returns (bytes32)
    {
        if (assets[assetId].nextScheduleIndex == templateRegistry.getScheduleLength(assets[assetId].templateId)) {
            return encodeEvent(EventType(0), 0);
        }

        bytes32 _event = templateRegistry.getEventAtIndex(
            assets[assetId].templateId,
            assets[assetId].nextScheduleIndex
        );
        (EventType nextEventType, uint256 nextScheduleTimeOffset) = decodeEvent(_event);

        assets[assetId].nextScheduleIndex += 1;
        emit IncrementedScheduleIndex(assetId, assets[assetId].nextScheduleIndex);

        return encodeEvent(
            nextEventType,
            applyAnchorDateToOffset(decodeAndGetAnchorDate(assetId), nextScheduleTimeOffset)
        );
    }

    /**
     * @notice Returns true if an event of an assets schedule was settled
     * @param assetId id of the asset
     * @param _event event (encoded)
     * @return true if event was settled
     */
    function isEventSettled(bytes32 assetId, bytes32 _event)
        external
        view
        override
        returns (bool)
    {
        return assets[assetId].settlement[_event];
    }

    /**
     * @notice Mark an event as settled
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param _event event (encoded) to be marked as settled
     */
    function markEventAsSettled(bytes32 assetId, bytes32 _event)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].settlement[_event] = true;
    }

    /**
     * @notice Set the custom terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new CustomTerms
     */
    function setCustomTerms(bytes32 assetId, CustomTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        encodeAndSetTerms(assetId, terms);

        emit UpdatedCustomTerms(assetId);
    }

    /**
     * @notice Sets next state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setState(bytes32 assetId, State calldata state)
        external
        override
        isAuthorized (assetId)
    {
        encodeAndSetState(assetId, state);

        emit UpdatedState(assetId, state.statusDate);
    }

    /**
     * @notice Sets next finalized state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setFinalizedState(bytes32 assetId, State calldata state)
        external
        override
        isAuthorized (assetId)
    {
        encodeAndSetFinalizedState(assetId, state);

        emit UpdatedFinalizedState(assetId, state.statusDate);
    }

    /**
     * @notice Set the anchor date which should used going forward to derive dates from the template
     * (used e.g. for pausing the asset).
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param anchorDate new anchor date of the asset
     */
    function setAnchorDate(bytes32 assetId, uint256 anchorDate)
        external
        override
        isAuthorized (assetId)
    {
        uint256 prevAnchorDate = decodeAndGetAnchorDate(assetId);

        encodeAndSetAnchorDate(assetId, anchorDate);

        emit UpdatedAnchorDate(assetId, prevAnchorDate, anchorDate);
    }

    /**
     * @notice Set the engine address which should be used for the asset going forward.
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param engine new engine address
     */
    function setEngine(bytes32 assetId, address engine)
        external
        override
        isAuthorized (assetId)
    {
        address prevEngine = assets[assetId].engine;

        assets[assetId].engine = engine;

        emit UpdatedEngine(assetId, prevEngine, engine);
    }

    /**
     * @notice Set the address of the Actor contract which should be going forward.
     * @param assetId id of the asset
     * @param actor address of the Actor contract
     */
    function setActor(bytes32 assetId, address actor)
        external
        override
        isAuthorized (assetId)
    {
        address prevActor = assets[assetId].actor;

        assets[assetId].actor = actor;

        emit UpdatedActor(assetId, prevActor, actor);
    }
}
