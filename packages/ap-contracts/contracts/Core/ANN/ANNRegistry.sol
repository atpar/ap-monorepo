// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/ANN/IANNEngine.sol";

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistry.sol";
import "./ANNEncoder.sol";
import "./IANNRegistry.sol";


/**
 * @title ANNRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract ANNRegistry is BaseRegistry, IANNRegistry {

    using ANNEncoder for Asset;


    constructor()
        public
        BaseRegistry()
    {}

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
        ANNState calldata state,
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
        setAsset(assetId, schedule, ownership, engine, actor, admin);
        assets[assetId].encodeAndSetANNTerms(terms);
        assets[assetId].encodeAndSetANNState(state);
        assets[assetId].encodeAndSetFinalizedANNState(state);
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
        return assets[assetId].decodeAndGetANNTerms();
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
        assets[assetId].encodeAndSetANNTerms(terms);
        emit UpdatedTerms(assetId);
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForANNTermsAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (address)
    {
        return assets[assetId].decodeAndGetAddressValueForANNTermsAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (bytes32)
    {
        return assets[assetId].decodeAndGetBytes32ValueForANNTermsAttribute(attribute);
    }

    function getUIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForANNTermsAttribute(attribute);
    }

    function getIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForANNTermsAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IP memory)
    {
        return assets[assetId].decodeAndGetPeriodValueForANNTermsAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IPS memory)
    {
        return assets[assetId].decodeAndGetCycleValueForANNTermsAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (ContractReference memory)
    {
        return assets[assetId].decodeAndGetContractReferenceValueForANNTermsAttribute(attribute);
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
        returns (ANNState memory)
    {
        return assets[assetId].decodeAndGetANNState();
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
        returns (ANNState memory)
    {
        return assets[assetId].decodeAndGetFinalizedANNState();
    }

    /**
     * @notice Sets next state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setState(bytes32 assetId, ANNState calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetANNState(state);
        emit UpdatedState(assetId, state.statusDate);
    }

    /**
     * @notice Sets next finalized state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setFinalizedState(bytes32 assetId, ANNState calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetFinalizedANNState(state);
        emit UpdatedFinalizedState(assetId, state.statusDate);
    }

    function getEnumValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForANNStateAttribute(attribute);
    }

    function getIntValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForANNStateAttribute(attribute);
    }

    function getUintValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForANNStateAttribute(attribute);
    }

    function getNextCyclicEvent(bytes32 assetId)
        internal
        view
        override(TermsRegistry)
        returns (bytes32)
    {
        Asset storage asset = assets[assetId];
        ANNTerms memory terms = asset.decodeAndGetANNTerms();

        EventType nextEventType;
        uint256 nextScheduleTimeOffset;

        // IP
        {
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(IANNEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.IP],
                EventType.IP
            ));

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset < nextScheduleTimeOffset)
                || (nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }        
        }

        // IPCI
        {
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(IANNEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.IPCI],
                EventType.IPCI
            ));

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset != 0 && scheduleTimeOffset < nextScheduleTimeOffset)
                || (scheduleTimeOffset != 0 && nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }        
        }

        // FP
        {
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(IANNEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.FP],
                EventType.FP
            ));

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset != 0 && scheduleTimeOffset < nextScheduleTimeOffset)
                || (scheduleTimeOffset != 0 && nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }        
        }

        // PR
        {
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(IANNEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.PR],
                EventType.PR
            ));

            if (
                (nextScheduleTimeOffset == 0)
                || (scheduleTimeOffset != 0 && scheduleTimeOffset < nextScheduleTimeOffset)
                || (scheduleTimeOffset != 0 && nextScheduleTimeOffset == scheduleTimeOffset && getEpochOffset(eventType) < getEpochOffset(nextEventType))
            ) {
                nextScheduleTimeOffset = scheduleTimeOffset;
                nextEventType = eventType;
            }        
        }

        return encodeEvent(nextEventType, nextScheduleTimeOffset);
    }
}
