// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../../../ACTUS/Engines/PAM/IPAMEngine.sol";
import "../../../../../ACTUS/Core/Utils/EventUtils.sol";

import "../../Lib.sol";
import "../BaseContractFacet.sol";
import "./IPAMFacet.sol";
import "./PAMEncoder.sol";


contract PAMFacet is BaseContractFacet, EventUtils, IPAMFacet {

    using PAMEncoder for Asset;


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
    function registerPAMAsset(
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
    {
        setAsset(assetId, state, schedule, ownership, engine, actor, admin);
        assetStorage().assets[assetId].encodeAndSetPAMTerms(terms);
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
        return assetStorage().assets[assetId].decodeAndGetPAMTerms();
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
        assetStorage().assets[assetId].encodeAndSetPAMTerms(terms);
        emit UpdatedTerms(assetId);
    }

    function getNextComputedPAMEvent(bytes32 assetId)
        public
        view
        override
        returns (bytes32, bool)
    {
        Asset storage asset = assetStorage().assets[assetId];
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
