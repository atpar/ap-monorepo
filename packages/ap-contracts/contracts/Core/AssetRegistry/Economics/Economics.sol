pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../AssetRegistryStorage.sol";
import "../AccessControl/AccessControl.sol";
import "./IEconomics.sol";


/**
 * @title Economics
 */
abstract contract Economics is AssetRegistryStorage, IEconomics, AccessControl {

    event IncrementedScheduleIndex(bytes32 indexed assetId, uint256 nextScheduleIndex);
    event UpdatedTerms(bytes32 indexed assetId);
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
    function getANNTerms(bytes32 assetId)
        external
        view
        override
        returns (ANNTerms memory)
    {
        Asset storage asset = assets[assetId];
        return asset.decodeAndGetANNTerms();
    }

    /**
     * @notice Returns the terms of an asset.
     * @param assetId id of the asset
     * @return terms of the asset
     */
    function getCECTerms(bytes32 assetId)
        external
        view
        override
        returns (CECTerms memory)
    {
        Asset storage asset = assets[assetId];
        return asset.decodeAndGetCECTerms();
    }

    /**
     * @notice Returns the terms of an asset.
     * @param assetId id of the asset
     * @return terms of the asset
     */
    function getCEGTerms(bytes32 assetId)
        external
        view
        override
        returns (CEGTerms memory)
    {
        Asset storage asset = assets[assetId];
        return asset.decodeAndGetCEGTerms();
    }

    /**
     * @notice Returns the terms of an asset.
     * @param assetId id of the asset
     * @return terms of the asset
     */
    function getPAMTerms(bytes32 assetId)
        external
        view
        override
        returns (PAMTerms memory)
    {
        Asset storage asset = assets[assetId];
        return asset.decodeAndGetPAMTerms();
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute) public view returns (uint8) {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetEnumValueForANNAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetEnumValueForCECAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetEnumValueForCEGAttribute(asset, attribute);
        // } else 
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetEnumValueForPAMAttribute(asset, attribute);
        } else {
            revert("AssetRegistry.getEnumValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute) public view returns (address) {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetAddressValueForForANNAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetAddressValueForForCECAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetAddressValueForForCEGAttribute(asset, attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetAddressValueForForPAMAttribute(asset, attribute);
        } else {
            revert("AssetRegistry.getAddressValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getUIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute) public view returns (uint256) {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetUIntValueForForANNAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetUIntValueForForCECAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetUIntValueForForCEGAttribute(asset, attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetUIntValueForForPAMAttribute(asset, attribute);
        } else {
            revert("AssetRegistry.getUIntValueForForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getIntValueForForTermsAttribute(bytes32 assetId, bytes32 attribute) public view returns (int256) {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetIntValueForForANNAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetIntValueForForCECAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetIntValueForForCEGAttribute(asset, attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetIntValueForForPAMAttribute(asset, attribute);
        } else {
            revert("AssetRegistry.getIntValueForForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getPeriodValueForForTermsAttribute(bytes32 assetId, bytes32 attribute) public view returns (IP memory) {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetPeriodValueForForANNAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetPeriodValueForForCECAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetPeriodValueForForCEGAttribute(asset, attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetPeriodValueForForPAMAttribute(asset, attribute);
        } else {
            revert("AssetRegistry.getPeriodValueForForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute) public view returns (IPS memory) {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetCycleValueForForANNAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetCycleValueForForCECAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetCycleValueForForCEGAttribute(asset, attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetCycleValueForForPAMAttribute(asset, attribute);
        } else {
            revert("AssetRegistry.getCycleValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        returns (ContractReference memory)
    {
        Asset storage asset = assets[assetId];
        ContractType contractType = IEngine(asset.engine).contractType();

        // if (contractType == ContractType.ANN) {
        //     return asset.decodeAndGetContractReferenceValueForANNAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEC) {
        //     return asset.decodeAndGetContractReferenceValueForCECAttribute(asset, attribute);
        // } else if (contractType == ContractType.CEG) {
        //     return asset.decodeAndGetContractReferenceValueForCEGAttribute(asset, attribute);
        // } else
        if (contractType == ContractType.PAM) {
            return asset.decodeAndGetContractReferenceValueForPAMAttribute(asset, attribute);
        } else {
            revert("AssetRegistry.getContractReferenceValueForTermsAttribute: UNSUPPORTED_CONTRACT_TYPE");
        }
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
        Asset storage asset = assets[assetId];
        return asset.decodeAndGetState();
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
        Asset storage asset = assets[assetId];
        return asset.decodeAndGetFinalizedState();
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

    function getPendingEvent(bytes32 assetId)
        external
        view
        override
        returns (bytes32)
    {
        return assets[assetId].pendingEvent;
    }

    function pushPendingEvent(bytes32 assetId, bytes32 pendingEvent)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].pendingEvent = pendingEvent;
    }

    function popPendingEvent(bytes32 assetId)
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
    function getNextUnderlyingEvent(bytes32 assetId)
        external
        view
        override
        returns (bytes32)
    {
        ContractReference memory contractReference_1 = getContractReferenceValueForTermsAttribute(assetId, "contractReference_1");
        State memory state = decodeAndGetState(assetId);

        // check for COVE
        if (contractReference_1.object != bytes32(0) && contractReference_1.role == ContractReferenceRole.COVE) {
            bytes32 underlyingAssetId = contractReference_1.object;
            Asset storage underlyingAsset = assets[underlyingAssetId];

            require(
                underlyingAsset.isSet == true,
                "AssetActor.getNextObservedEvent: ENTRY_DOES_NOT_EXIST"
            );

            State memory underlyingState = underlyingAsset.decodeAndGetState();
            ContractPerformance creditEventTypeCovered = getEnumValueForTermsAttribute(assetId, "creditEventTypeCovered");

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
                creditEventTypeCovered != ContractPerformance.PF
                && underlyingState.contractPerformance == creditEventTypeCovered
            ) {
                // insert exerciseDate event
                // derive scheduleTimeOffset from performance
                if (underlyingState.contractPerformance == ContractPerformance.DL) {
                    return encodeEvent(
                        EventType.XD,
                        underlyingState.nonPerformingDate
                    );
                } else if (underlyingState.contractPerformance == ContractPerformance.DQ) {
                    Period memory underlyingGracePeriod = getPeriodValueForTermsAttribute(underlyingAsset, "gracePeriod");
                    return encodeEvent(
                        EventType.XD,
                        getTimestampPlusPeriod(underlyingGracePeriod, underlyingState.nonPerformingDate)
                    );
                } else if (underlyingState.contractPerformance == ContractPerformance.DF) {
                    Period memory underlyingDelinquencyPeriod = getPeriodValueForTermsAttribute(underlyingAsset, "delinquencyPeriod");
                    return encodeEvent(
                        EventType.XD,
                        getTimestampPlusPeriod(underlyingDelinquencyPeriod, underlyingState.nonPerformingDate)
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
    function getNextScheduledEvent(bytes32 assetId)
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
        returns (bool, int256)
    {
        return (
            assets[assetId].settlement[_event].isSettled,
            assets[assetId].settlement[_event].payoff
        );
    }

    /**
     * @notice Mark an event as settled
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param _event event (encoded) to be marked as settled
     */
    function markEventAsSettled(bytes32 assetId, bytes32 _event, int256 _payoff)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].settlement[_event] = Settlement({ isSettled: true, payoff: _payoff });
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setANNTerms(bytes32 assetId, ANNTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        asset.encodeAndSetANNTerms(assetId, terms);
        emit UpdatedTerms(assetId);
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setCECTerms(bytes32 assetId, CECTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        asset.encodeAndSetCECTerms(assetId, terms);
        emit UpdatedTerms(assetId);
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setCEGTerms(bytes32 assetId, CEGTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        asset.encodeAndSetCEGTerms(assetId, terms);
        emit UpdatedTerms(assetId);
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setPAMTerms(bytes32 assetId, PAMTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        asset.encodeAndSetPAMTerms(assetId, terms);
        emit UpdatedTerms(assetId);
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
