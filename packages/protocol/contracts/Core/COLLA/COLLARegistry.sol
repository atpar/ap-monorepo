// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../ACTUS/Engines/COLLA/ICOLLAEngine.sol";

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistry.sol";
import "./COLLAEncoder.sol";
import "./ICOLLARegistry.sol";


/**
 * @title COLLARegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract COLLARegistry is BaseRegistry, ICOLLARegistry {

    using COLLAEncoder for Asset;

    
    constructor() BaseRegistry() {}

    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (COLLATerms)
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     * @param extension address of the extension (optional)
     */
    function registerAsset(
        bytes32 assetId,
        COLLATerms calldata terms,
        COLLAState calldata state,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address actor,
        address admin,
        address extension
    )
        external
        override
        onlyApprovedActors
    {
        setAsset(assetId, schedule, ownership, engine, actor, admin, extension);
        assets[assetId].encodeAndSetCOLLATerms(terms);
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
        returns (COLLATerms memory)
    {
        return assets[assetId].decodeAndGetCOLLATerms();
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setTerms(bytes32 assetId, COLLATerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetCOLLATerms(terms);
        emit UpdatedTerms(assetId);
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForCOLLAAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (address)
    {
        return assets[assetId].decodeAndGetAddressValueForForCOLLAAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (bytes32)
    {
        return assets[assetId].decodeAndGetBytes32ValueForForCOLLAAttribute(attribute);
    }

    function getUIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForForCOLLAAttribute(attribute);
    }

    function getIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForForCOLLAAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IP memory)
    {
        return assets[assetId].decodeAndGetPeriodValueForForCOLLAAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IPS memory)
    {
        return assets[assetId].decodeAndGetCycleValueForForCOLLAAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (ContractReference memory)
    {
        return assets[assetId].decodeAndGetContractReferenceValueForCOLLAAttribute(attribute);
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
        returns (COLLAState memory)
    {
        return assets[assetId].decodeAndGetCOLLAState();
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
        returns (COLLAState memory)
    {
        return assets[assetId].decodeAndGetFinalizedCOLLAState();
    }

    /**
     * @notice Sets next state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setState(bytes32 assetId, COLLAState calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetCOLLAState(state);
        emit UpdatedState(assetId, state.statusDate);
    }

    /**
     * @notice Sets next finalized state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setFinalizedState(bytes32 assetId, COLLAState calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetFinalizedCOLLAState(state);
        emit UpdatedFinalizedState(assetId, state.statusDate);
    }

    function getEnumValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForCOLLAStateAttribute(attribute);
    }

    function getIntValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForCOLLAStateAttribute(attribute);
    }

    function getUintValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForCOLLAStateAttribute(attribute);
    }

    function getNextComputedEvent(bytes32 assetId)
        internal
        view
        override(TermsRegistry)
        returns (bytes32, bool)
    {
        Asset storage asset = assets[assetId];
        COLLATerms memory terms = asset.decodeAndGetCOLLATerms();

        EventType nextEventType;
        uint256 nextScheduleTime;
        bool isCyclicEvent = true;

        // IP
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(ICOLLAEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.IP],
                EventType.IP
            ));

            if (
                (nextScheduleTime == 0)
                || (scheduleTime < nextScheduleTime)
                || (nextScheduleTime == scheduleTime && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTime = scheduleTime;
                nextEventType = eventType;
            }
        }

        // IPCI
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(ICOLLAEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.IPCI],
                EventType.IPCI
            ));

            if (
                (nextScheduleTime == 0)
                || (scheduleTime != 0 && scheduleTime < nextScheduleTime)
                || (scheduleTime != 0 && nextScheduleTime == scheduleTime && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTime = scheduleTime;
                nextEventType = eventType;
            }        
        }

        // Non-Cyclic
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(ICOLLAEngine(asset.engine).computeNextNonCyclicEvent(
                terms,
                asset.schedule.lastNonCyclicEvent
            ));

            if (
                (nextScheduleTime == 0)
                || (scheduleTime != 0 && scheduleTime < nextScheduleTime)
                || (scheduleTime != 0 && nextScheduleTime == scheduleTime && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTime = scheduleTime;
                nextEventType = eventType;
                isCyclicEvent = false;
            }        
        }

        return (encodeEvent(nextEventType, nextScheduleTime), isCyclicEvent);
    }
}
