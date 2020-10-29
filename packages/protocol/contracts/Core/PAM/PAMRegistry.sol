// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../ACTUS/Engines/PAM/IPAMEngine.sol";

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistry.sol";
import "./PAMEncoder.sol";
import "./IPAMRegistry.sol";


/**
 * @title PAMRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract PAMRegistry is BaseRegistry, IPAMRegistry {

    using PAMEncoder for Asset;

    
    constructor() BaseRegistry() {}

    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (PAMTerms)
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function registerAsset(
        bytes32 assetId,
        PAMTerms calldata terms,
        State calldata state,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address actor,
        address admin
    )
        external
        override
        onlyApprovedActors
    {
        setAsset(assetId, state, schedule, ownership, engine, actor, admin);
        assets[assetId].encodeAndSetPAMTerms(terms);
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
        returns (PAMTerms memory)
    {
        return assets[assetId].decodeAndGetPAMTerms();
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setTerms(bytes32 assetId, PAMTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetPAMTerms(terms);
        emit UpdatedTerms(assetId);
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForPAMAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (address)
    {
        return assets[assetId].decodeAndGetAddressValueForForPAMAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (bytes32)
    {
        return assets[assetId].decodeAndGetBytes32ValueForForPAMAttribute(attribute);
    }

    function getUIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForForPAMAttribute(attribute);
    }

    function getIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForForPAMAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IP memory)
    {
        return assets[assetId].decodeAndGetPeriodValueForForPAMAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IPS memory)
    {
        return assets[assetId].decodeAndGetCycleValueForForPAMAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (ContractReference memory)
    {
        return assets[assetId].decodeAndGetContractReferenceValueForPAMAttribute(attribute);
    }

    function getNextComputedEvent(bytes32 assetId)
        internal
        view
        override(TermsRegistry)
        returns (bytes32, bool)
    {
        Asset storage asset = assets[assetId];
        PAMTerms memory terms = asset.decodeAndGetPAMTerms();

        EventType nextEventType;
        uint256 nextScheduleTime;
        bool isCyclicEvent = true;

        // IP
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IPAMEngine(asset.engine).computeNextCyclicEvent(
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
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IPAMEngine(asset.engine).computeNextCyclicEvent(
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

        // FP
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IPAMEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.FP],
                EventType.FP
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

        // SC
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IPAMEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.SC],
                EventType.SC
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
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IPAMEngine(asset.engine).computeNextNonCyclicEvent(
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
