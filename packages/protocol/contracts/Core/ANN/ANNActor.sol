// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../ACTUS/Engines/ANN/IANNEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "./IANNRegistry.sol";


/**
 * @title ANNActor
 * @notice TODO
 */
contract ANNActor is BaseActor {

    constructor(
        IAssetRegistry assetRegistry,
        IObserverOracleProxy defaultOracleProxy
    ) BaseActor(assetRegistry, defaultOracleProxy) {}

    /**
     * @notice Derives initial state of the asset terms and stores together with
     * terms, schedule, ownership, engine, admin of the asset in the contract types specific AssetRegistry.
     * @param terms asset specific terms
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine address of the ACTUS engine used for the spec. ContractType
     * @param admin address of the admin of the asset (optional)
     * @param extension address of the extension (optional)
     */
    function initialize(
        ANNTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin,
        address extension
    )
        external
    {
        require(
            engine != address(0) && IEngine(engine).contractType() == ContractType.ANN,
            "ANNActor.initialize: CONTRACT_TYPE_OF_ENGINE_UNSUPPORTED"
        );

        // solium-disable-next-line
        bytes32 assetId = keccak256(abi.encode(terms, block.timestamp));

        // compute the initial state of the asset
        ANNState memory initialState = IANNEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        IANNRegistry(address(assetRegistry)).registerAsset(
            assetId,
            terms,
            initialState,
            schedule,
            ownership,
            engine,
            address(this),
            admin,
            extension
        );

        emit InitializedAsset(assetId, ContractType.ANN, ownership.creatorObligor, ownership.counterpartyObligor);
    }

    function computePayoffForEvent(bytes32 assetId, address engine, ANNTerms memory terms, ANNState memory state, bytes32 _event) internal view returns (int256) {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        bytes memory externalData;
        {
            externalData = getExternalDataForPOF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
            );
        }

        return IANNEngine(engine).computePayoffForEvent(
            terms,
            state,
            _event,
            externalData
        );
    }

    function computeStateForEvent(bytes32 assetId, address engine, ANNTerms memory terms, ANNState memory state, bytes32 _event) internal view returns (ANNState memory) {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        return IANNEngine(engine).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
            )
        );
    }

    /**
     * @notice Contract-type specific logic for processing an event required by the use of
     * contract-type specific Terms and State.
     */
    function settleEventAndUpdateState(bytes32 assetId, bytes32 _event)
        internal
        override
        returns (bool, int256)
    {
        ANNTerms memory terms = IANNRegistry(address(assetRegistry)).getTerms(assetId);
        ANNState memory state = IANNRegistry(address(assetRegistry)).getState(assetId);
        address engine = assetRegistry.getEngine(assetId);

        // get finalized state if asset is not performant
        if (state.contractPerformance != ContractPerformance.PF) {
            state = IANNRegistry(address(assetRegistry)).getFinalizedState(assetId);
        }

        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        // get external data for the next event
        // compute payoff and the next state by applying the event to the current state
        int256 payoff = computePayoffForEvent(assetId, engine, terms, state, _event);
        // IANNEngine(engine).computePayoffForEvent(
        //     terms,
        //     state,
        //     _event,
        //     getExternalDataForPOF(
        //         assetId,
        //         eventType,
        //         shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
        //     )
        // );
        ANNState memory nextState = computeStateForEvent(assetId, engine, terms, state, _event);
        // IANNEngine(engine).computeStateForEvent(
        //     terms,
        //     state,
        //     _event,
        //     getExternalDataForSTF(
        //         assetId,
        //         eventType,
        //         shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
        //     )
        // );

        // try to settle payoff of event
        bool settledPayoff = settlePayoffForEvent(assetId, _event, payoff);

        if (settledPayoff == false) {
            // if the obligation can't be fulfilled and the performance changed from performant to DL, DQ or DF,
            // store the last performant state of the asset
            // (if the obligation is later fulfilled before the asset reaches default,
            // the last performant state is used to derive subsequent states of the asset)
            if (state.contractPerformance == ContractPerformance.PF) {
                IANNRegistry(address(assetRegistry)).setFinalizedState(assetId, state);
            }

            // store event as pending event for future settlement
            assetRegistry.pushPendingEvent(assetId, _event);

            // create CreditEvent
            bytes32 ceEvent = encodeEvent(EventType.CE, scheduleTime);

            // derive the actual state of the asset by applying the CreditEvent (updates performance of asset)
            nextState = computeStateForEvent(assetId, engine, terms, state, ceEvent);
            // IANNEngine(engine).computeStateForEvent(
            //     terms,
            //     state,
            //     ceEvent,
            //     getExternalDataForSTF(
            //         assetId,
            //         EventType.CE,
            //         shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
            //     )
            // );
        }

        // store the resulting state
        IANNRegistry(address(assetRegistry)).setState(assetId, nextState);

        return (settledPayoff, payoff);
    }

    /**
     * @notice Retrieves external data (such as market object data, block time, underlying asset state)
     * used for evaluating the STF for a given event.
     */
    function getExternalDataForSTF(
        bytes32 assetId,
        EventType eventType,
        uint256 timestamp
    )
        internal
        view
        override
        returns (bytes memory)
    {
        if (eventType == EventType.RR) {
            // get rate from DataRegistry
            (int256 resetRate, bool isSet) = defaultOracleProxy.getDataPoint(
                assetRegistry.getBytes32ValueForTermsAttribute(assetId, "marketObjectCodeRateReset"),
                timestamp
            );
            if (isSet) return abi.encode(resetRate);
        } else if (eventType == EventType.CE) {
            // get current timestamp
            // solium-disable-next-line
            return abi.encode(block.timestamp);
        }

        return new bytes(0);
    }
}