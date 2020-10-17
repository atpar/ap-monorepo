// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/STK/ISTKEngine.sol";

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


    constructor()
        public
        BaseRegistry()
    {}

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
     */
    function registerAsset(
        bytes32 assetId,
        STKTerms calldata terms,
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
        view
        override(ITermsRegistry, TermsRegistry)
        returns (ContractReference memory)
    {
        return ContractReference(0, 0, ContractReferenceType(0), ContractReferenceRole(0));
    }

    function getNextCyclicEvent(bytes32 assetId)
        internal
        view
        override(TermsRegistry)
        returns (bytes32)
    {
        Asset storage asset = assets[assetId];
        STKTerms memory terms = asset.decodeAndGetSTKTerms();

        EventType nextEventType;
        uint256 nextScheduleTimeOffset;

        // DIF
        {
            (EventType eventType, uint256 scheduleTimeOffset) = decodeEvent(ISTKEngine(asset.engine).computeNextCyclicEvent(
                terms,
                asset.schedule.lastScheduleTimeOfCyclicEvent[EventType.DIF],
                EventType.DIF
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
