// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../../../ACTUS/Engines/ANN/IANNEngine.sol";
import "../../../../../ACTUS/Core/Utils/EventUtils.sol";

import "../../Lib.sol";
import "../BaseContractFacet.sol";
import "./IANNFacet.sol";
import "./ANNEncoder.sol";


contract ANNFacet is BaseContractFacet, EventUtils, IANNFacet {

    using ANNEncoder for Asset;


    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (ANNTerms)
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function registerAsset(
        bytes32 assetId,
        ANNTerms calldata terms,
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
        assetStorage().assets[assetId].encodeAndSetANNTerms(terms);
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
        returns (ANNTerms memory)
    {
        return assetStorage().assets[assetId].decodeAndGetANNTerms();
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setTerms(bytes32 assetId, ANNTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        assetStorage().assets[assetId].encodeAndSetANNTerms(terms);
        emit UpdatedTerms(assetId);
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IBaseContractFacet)
        returns (uint8)
    {
        return assetStorage().assets[assetId].decodeAndGetEnumValueForANNAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IBaseContractFacet)
        returns (address)
    {
        return assetStorage().assets[assetId].decodeAndGetAddressValueForForANNAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IBaseContractFacet)
        returns (bytes32)
    {
        return assetStorage().assets[assetId].decodeAndGetBytes32ValueForForANNAttribute(attribute);
    }

    function getUIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IBaseContractFacet)
        returns (uint256)
    {
        return assetStorage().assets[assetId].decodeAndGetUIntValueForForANNAttribute(attribute);
    }

    function getIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IBaseContractFacet)
        returns (int256)
    {
        return assetStorage().assets[assetId].decodeAndGetIntValueForForANNAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IBaseContractFacet)
        returns (IP memory)
    {
        return assetStorage().assets[assetId].decodeAndGetPeriodValueForForANNAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IBaseContractFacet)
        returns (IPS memory)
    {
        return assetStorage().assets[assetId].decodeAndGetCycleValueForForANNAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IBaseContractFacet)
        returns (ContractReference memory)
    {
        return assetStorage().assets[assetId].decodeAndGetContractReferenceValueForANNAttribute(attribute);
    } 

    function getNextComputedEvent(bytes32 assetId)
        public
        view
        override(IBaseContractFacet)
        returns (bytes32, bool)
    {
        Asset storage asset = assetStorage().assets[assetId];
        ANNTerms memory terms = asset.decodeAndGetANNTerms();

        EventType nextEventType;
        uint256 nextScheduleTime;
        bool isCyclicEvent = true;

        // IP
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IANNEngine(asset.engine).computeNextCyclicEvent(
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
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IANNEngine(asset.engine).computeNextCyclicEvent(
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
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IANNEngine(asset.engine).computeNextCyclicEvent(
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

        // PR
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IANNEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.PR],
                EventType.PR
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
            (EventType eventType, uint256 scheduleTime) = decodeEvent(IANNEngine(asset.engine).computeNextNonCyclicEvent(
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
