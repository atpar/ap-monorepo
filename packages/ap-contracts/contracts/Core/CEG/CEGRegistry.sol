// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/CEG/ICEGEngine.sol";

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistry.sol";
import "./CEGEncoder.sol";
import "./ICEGRegistry.sol";


/**
 * @title CEGRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract CEGRegistry is BaseRegistry, ICEGRegistry {

    using CEGEncoder for Asset;

    
    constructor()
        public
        BaseRegistry()
    {}

    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (CEGTerms)
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function registerAsset(
        bytes32 assetId,
        CEGTerms calldata terms,
        CEGState calldata state,
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
        assets[assetId].encodeAndSetCEGTerms(terms);
        assets[assetId].encodeAndSetCEGState(state);
        assets[assetId].encodeAndSetFinalizedCEGState(state);
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
        returns (CEGTerms memory)
    {
        return assets[assetId].decodeAndGetCEGTerms();
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setTerms(bytes32 assetId, CEGTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetCEGTerms(terms);
        emit UpdatedTerms(assetId);
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForCEGTermsAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (address)
    {
        return assets[assetId].decodeAndGetAddressValueForCEGTermsAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (bytes32)
    {
        return assets[assetId].decodeAndGetBytes32ValueForCEGTermsAttribute(attribute);
    }

    function getUIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForCEGTermsAttribute(attribute);
    }

    function getIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForCEGTermsAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IP memory)
    {
        return assets[assetId].decodeAndGetPeriodValueForCEGTermsAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IPS memory)
    {
        return assets[assetId].decodeAndGetCycleValueForCEGTermsAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (ContractReference memory)
    {
        return assets[assetId].decodeAndGetContractReferenceValueForCEGTermsAttribute(attribute);
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
        returns (CEGState memory)
    {
        return assets[assetId].decodeAndGetCEGState();
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
        returns (CEGState memory)
    {
        return assets[assetId].decodeAndGetFinalizedCEGState();
    }

    /**
     * @notice Sets next state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setState(bytes32 assetId, CEGState calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetCEGState(state);
        emit UpdatedState(assetId, state.statusDate);
    }

    /**
     * @notice Sets next finalized state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setFinalizedState(bytes32 assetId, CEGState calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetFinalizedCEGState(state);
        emit UpdatedFinalizedState(assetId, state.statusDate);
    }

    function getEnumValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForCEGStateAttribute(attribute);
    }

    function getIntValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForCEGStateAttribute(attribute);
    }

    function getUintValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForCEGStateAttribute(attribute);
    }

    function getNextCyclicEvent(bytes32 assetId)
        internal
        view
        override(TermsRegistry)
        returns (bytes32)
    {
        Asset storage asset = assets[assetId];
        CEGTerms memory terms = asset.decodeAndGetCEGTerms();

        EventType nextEventType;
        uint256 nextScheduleTimeOffset;

        // FP
        {
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(ICEGEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.FP],
                EventType.FP
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

        return encodeEvent(nextEventType, nextScheduleTimeOffset);
    }
}
