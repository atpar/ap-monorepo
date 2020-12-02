// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../ACTUS/Engines/STK/ISTKEngine.sol";

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistry.sol";
import "./STKEncoder.sol";
import "./ISTKRegistry.sol";


/**
 * @title STKRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract STKRegistry is BaseRegistry, ISTKRegistry {

    using STKEncoder for Asset;


    constructor() BaseRegistry() {}

    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (STKTerms)
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
        STKTerms calldata terms,
        STKState calldata state,
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
        assets[assetId].encodeAndSetSTKTerms(terms);
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
        returns (STKTerms memory)
    {
        return assets[assetId].decodeAndGetSTKTerms();
    }

    /**
     * @notice Set the terms of the asset
     * @dev Can only be set by authorized account.
     * @param assetId id of the asset
     * @param terms new terms
     */
    function setTerms(bytes32 assetId, STKTerms calldata terms)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetSTKTerms(terms);
        emit UpdatedTerms(assetId);
    }

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForSTKAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (address)
    {
        return assets[assetId].decodeAndGetAddressValueForForSTKAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (bytes32)
    {
        return assets[assetId].decodeAndGetBytes32ValueForForSTKAttribute(attribute);
    }

    function getUIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForForSTKAttribute(attribute);
    }

    function getIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForForSTKAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IP memory)
    {
        return assets[assetId].decodeAndGetPeriodValueForForSTKAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(ITermsRegistry, TermsRegistry)
        returns (IPS memory)
    {
        return assets[assetId].decodeAndGetCycleValueForForSTKAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 /* assetId */, bytes32 /* attribute */)
        public
        pure
        override(ITermsRegistry, TermsRegistry)
        returns (ContractReference memory)
    {
        return ContractReference(0, 0, ContractReferenceType(0), ContractReferenceRole(0));
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
        returns (STKState memory)
    {
        return assets[assetId].decodeAndGetSTKState();
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
        returns (STKState memory)
    {
        return assets[assetId].decodeAndGetFinalizedSTKState();
    }

    /**
     * @notice Sets next state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setState(bytes32 assetId, STKState calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetSTKState(state);
        emit UpdatedState(assetId, state.statusDate);
    }

    /**
     * @notice Sets next finalized state of an asset.
     * @dev Can only be updated by the assets actor or by an authorized account.
     * @param assetId id of the asset
     * @param state next state of the asset
     */
    function setFinalizedState(bytes32 assetId, STKState calldata state)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].encodeAndSetFinalizedSTKState(state);
        emit UpdatedFinalizedState(assetId, state.statusDate);
    }

    function getEnumValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (uint8)
    {
        return assets[assetId].decodeAndGetEnumValueForSTKStateAttribute(attribute);
    }

    function getIntValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (int256)
    {
        return assets[assetId].decodeAndGetIntValueForSTKStateAttribute(attribute);
    }

    function getUintValueForStateAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override(IStateRegistry, StateRegistry)
        returns (uint256)
    {
        return assets[assetId].decodeAndGetUIntValueForSTKStateAttribute(attribute);
    }

    function getNextComputedEvent(bytes32 assetId)
        internal
        view
        override(TermsRegistry)
        returns (bytes32, bool)
    {
        Asset storage asset = assets[assetId];
        STKTerms memory terms = asset.decodeAndGetSTKTerms();

        EventType nextEventType;
        uint256 nextScheduleTime;
        bool isCyclicEvent = true;

        // DIF
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(ISTKEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.DIF],
                EventType.DIF
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

        // Non-Cyclic
        {
            (EventType eventType, uint256 scheduleTime) = decodeEvent(ISTKEngine(asset.engine).computeNextNonCyclicEvent(
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
