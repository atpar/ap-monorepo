// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Core/Utils/EventUtils.sol";
import "@atpar/actus-solidity/contracts/Core/Utils/PeriodUtils.sol";

import "../BaseRegistryStorage.sol";
import "../IBaseRegistry.sol";
import "../AccessControl/AccessControl.sol";
import "../Terms/TermsRegistry.sol";
import "../Terms/ITermsRegistry.sol";
import "../State/StateRegistry.sol";
import "../State/IStateRegistry.sol";
import "./IScheduleRegistry.sol";


/**
 * @title ScheduleRegistry
 */
abstract contract ScheduleRegistry is
    BaseRegistryStorage,
    AccessControl,
    TermsRegistry,
    StateRegistry,
    IScheduleRegistry,
    EventUtils,
    PeriodUtils
{

    event IncrementedScheduleIndex(bytes32 indexed assetId, uint256 nextScheduleIndex);


    /**
     * @notice Returns an event for a given position (index) in a schedule of a given asset.
     * @param assetId id of the asset
     * @param index index of the event to return
     * @return Event
     */
    function getEventAtIndex(bytes32 assetId, uint256 index)
        external
        view
        override
        returns (bytes32)
    {
        return assets[assetId].schedule.events[index];
    }


    /**
     * @notice Returns the length of a schedule of a given asset.
     * @param assetId id of the asset
     * @return Length of the schedule
     */
    function getScheduleLength(bytes32 assetId)
        external
        view
        override
        returns (uint256)
    {
        return assets[assetId].schedule.length;
    }

    /**
     * @notice Convenience method for retrieving the entire schedule
     * Not recommended to execute method on-chain (if schedule is too long the tx may run out of gas)
     * @param assetId id of the asset
     * @return the schedule
     */
    function getSchedule(bytes32 assetId)
        external
        view
        override
        returns (bytes32[] memory)
    {
        return assets[assetId].decodeAndGetSchedule();
    }

    function getPendingEvent(bytes32 assetId)
        external
        view
        override
        returns (bytes32)
    {
        return assets[assetId].schedule.pendingEvent;
    }

    function pushPendingEvent(bytes32 assetId, bytes32 pendingEvent)
        external
        override
        isAuthorized (assetId)
    {
        assets[assetId].schedule.pendingEvent = pendingEvent;
    }

    function popPendingEvent(bytes32 assetId)
        external
        override
        isAuthorized (assetId)
        returns (bytes32)
    {
        bytes32 pendingEvent = assets[assetId].schedule.pendingEvent;
        assets[assetId].schedule.pendingEvent = bytes32(0);

        return pendingEvent;
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
        return assets[assetId].schedule.nextScheduleIndex;
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

        // check for COVE
        if (contractReference_1.object != bytes32(0) && contractReference_1.role == ContractReferenceRole.COVE) {
            bytes32 underlyingAssetId = contractReference_1.object;
            address underlyingRegistry = address(uint160(uint256(contractReference_1.object2))); // workaround for solc bug (replace with bytes)

            require(
                IBaseRegistry(underlyingRegistry).isRegistered(underlyingAssetId),
                "AssetActor.getNextUnderlyingEvent: UNDERLYING_ASSET_DOES_NOT_EXIST"
            );

            uint256 exerciseDate = getUintValueForStateAttribute(assetId, "exerciseDate");
            ContractPerformance creditEventTypeCovered = ContractPerformance(getEnumValueForTermsAttribute(assetId, "creditEventTypeCovered"));
            ContractPerformance underlyingContractPerformance = ContractPerformance(IStateRegistry(underlyingRegistry).getEnumValueForStateAttribute(underlyingAssetId, "contractPerformance"));
            uint256 underlyingNonPerformingDate = IStateRegistry(underlyingRegistry).getUintValueForStateAttribute(underlyingAssetId, "nonPerformingDate");

            // check if exerciseDate has been triggered
            if (exerciseDate > 0) {
                // insert SettlementDate event
                return encodeEvent(
                    EventType.STD,
                    // solium-disable-next-line
                    block.timestamp
                );
            } 
            // if not check if performance of underlying asset is covered by this asset (PF excluded)
            if (
                creditEventTypeCovered != ContractPerformance.PF
                && underlyingContractPerformance == creditEventTypeCovered
            ) {
                // insert exerciseDate event
                // derive scheduleTimeOffset from performance
                if (underlyingContractPerformance == ContractPerformance.DL) {
                    return encodeEvent(
                        EventType.XD,
                        underlyingNonPerformingDate
                    );
                } else if (underlyingContractPerformance == ContractPerformance.DQ) {
                    IP memory underlyingGracePeriod = ITermsRegistry(underlyingRegistry).getPeriodValueForTermsAttribute(underlyingAssetId, "gracePeriod");
                    return encodeEvent(
                        EventType.XD,
                        getTimestampPlusPeriod(underlyingGracePeriod, underlyingNonPerformingDate)
                    );
                } else if (underlyingContractPerformance == ContractPerformance.DF) {
                    IP memory underlyingDelinquencyPeriod = ITermsRegistry(underlyingRegistry).getPeriodValueForTermsAttribute(underlyingAssetId, "delinquencyPeriod");
                    return encodeEvent(
                        EventType.XD,
                        getTimestampPlusPeriod(underlyingDelinquencyPeriod, underlyingNonPerformingDate)
                    );
                }
            }
        }

        return bytes32(0);
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
        Asset storage asset = assets[assetId];

        if (asset.schedule.length == 0) return bytes32(0);
        
        return asset.schedule.events[asset.schedule.nextScheduleIndex];
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
        Asset storage asset = assets[assetId];

        if (asset.schedule.nextScheduleIndex == asset.schedule.length) return bytes32(0);

        bytes32 _event = asset.schedule.events[asset.schedule.nextScheduleIndex];
        asset.schedule.nextScheduleIndex += 1;
        
        emit IncrementedScheduleIndex(assetId, asset.schedule.nextScheduleIndex);

        return _event;
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
}
