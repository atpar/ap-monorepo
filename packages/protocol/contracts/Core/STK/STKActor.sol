// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../ACTUS/Engines/STK/ISTKEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "./ISTKRegistry.sol";


/**
 * @title STKActor
 * @notice TODO
 */
contract STKActor is BaseActor {

    using FixedPointMath for int;

    enum STKExternalDataType {NA, DIP, SRA, REXA}


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
        STKTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin,
        address extension
    )
        external
    {
        require(
            engine != address(0) && IEngine(engine).contractType() == ContractType.STK,
            "STKActor.initialize: CONTRACT_TYPE_OF_ENGINE_UNSUPPORTED"
        );

        // solium-disable-next-line
        bytes32 assetId = keccak256(abi.encode(terms, block.timestamp));

        // compute the initial state of the asset
        STKState memory initialState = ISTKEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        ISTKRegistry(address(assetRegistry)).registerAsset(
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

        emit InitializedAsset(assetId, ContractType.STK, ownership.creatorObligor, ownership.counterpartyObligor);
    }

    function computePayoffForEvent(
        bytes32 assetId,
        address engine,
        STKTerms memory terms,
        STKState memory state,
        bytes32 _event
    )
        internal
        view
        returns (int256)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        uint256 timestamp;
        {
            // apply shift calc to schedule time
            timestamp = shiftCalcTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar,
                0
            );
        }
        
        bytes memory externalDataPOF;
        { externalDataPOF = getExternalDataForPOF(assetId, eventType, timestamp); }

        return (
            ISTKEngine(engine).computePayoffForEvent(
                terms,
                state,
                _event,
                externalDataPOF
            )
        );
    }

    function computeStateForEvent(
        bytes32 assetId,
        address engine,
        STKTerms memory terms,
        STKState memory state,
        bytes32 _event
    )
        internal
        view
        returns (STKState memory)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        uint256 timestamp;
        {
            // apply shift calc to schedule time
            timestamp = shiftCalcTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar,
                0
            );
        }
        
        bytes memory externalDataSTF;
        { externalDataSTF = getExternalDataForSTF(assetId, eventType, timestamp); }

        return (
            ISTKEngine(engine).computeStateForEvent(
                terms,
                state,
                _event,
                externalDataSTF
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
        STKTerms memory terms = ISTKRegistry(address(assetRegistry)).getTerms(assetId);
        STKState memory state = ISTKRegistry(address(assetRegistry)).getState(assetId);
        address engine = assetRegistry.getEngine(assetId);

        // get finalized state if asset is not performant
        if (state.contractPerformance != ContractPerformance.PF) {
            state = ISTKRegistry(address(assetRegistry)).getFinalizedState(assetId);
        }

        (, uint256 scheduleTime) = decodeEvent(_event);

        // get external data for the next event
        // compute payoff and the next state by applying the event to the current state
        int256 payoff = computePayoffForEvent(assetId, engine, terms, state, _event);
        STKState memory nextState = computeStateForEvent(assetId, engine, terms, state, _event);

        // try to settle payoff of event
        bool settledPayoff = settlePayoffForEvent(assetId, _event, payoff);

        if (settledPayoff == false) {
            // if the obligation can't be fulfilled and the performance changed from performant to DL, DQ or DF,
            // store the last performant state of the asset
            // (if the obligation is later fulfilled before the asset reaches default,
            // the last performant state is used to derive subsequent states of the asset)
            if (state.contractPerformance == ContractPerformance.PF) {
                ISTKRegistry(address(assetRegistry)).setFinalizedState(assetId, state);
            }

            // store event as pending event for future settlement
            assetRegistry.pushPendingEvent(assetId, _event);

            // create CreditEvent
            bytes32 ceEvent = encodeEvent(EventType.CE, scheduleTime);

            // derive the actual state of the asset by applying the CreditEvent (updates performance of asset)
            nextState = computeStateForEvent(assetId, engine, terms, nextState, ceEvent);
        }

        // store the resulting state
        ISTKRegistry(address(assetRegistry)).setState(assetId, nextState);

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
        if (eventType == EventType.CE) {
            // get current timestamp
            // solium-disable-next-line
            return abi.encode(block.timestamp);
        } else if (eventType == EventType.EXE) {
            // get quantity
            ContractReference memory contractReference_2 = assetRegistry.getContractReferenceValueForTermsAttribute(
                assetId,
                "contractReference_2"
            );
            if (
                contractReference_2._type == ContractReferenceType.MOC
                && contractReference_2.role == ContractReferenceRole.UDL
            ) {
                (int256 quantity, bool isSet) = defaultOracleProxy.getDataPoint(
                    contractReference_2.object,
                    timestamp
                );
                if (isSet) return abi.encode(quantity);
            }
        } else if (eventType == EventType.REF) {
            //
            (int256 rexa, bool isSet) = defaultOracleProxy.getDataPoint(
                bytes32(uint256(assetId) + uint256(STKExternalDataType.REXA)),
                timestamp
            );
            if (isSet) return abi.encode(rexa);
        } else if (eventType == EventType.DIF) {
            (int256 dipa, bool isSet) = defaultOracleProxy.getDataPoint(
                bytes32(uint256(assetId) + uint256(STKExternalDataType.DIP)),
                timestamp
            );
            if (isSet) return abi.encode(dipa);
        } else if (eventType == EventType.SPF) {
            (int256 sra, bool isSet) = defaultOracleProxy.getDataPoint(
                bytes32(uint256(assetId) + uint256(STKExternalDataType.SRA)),
                timestamp
            );
            if (isSet) return abi.encode(sra);
        } else if (eventType == EventType.REF) {
            (int256 rexa, bool isSet) = defaultOracleProxy.getDataPoint(
                bytes32(uint256(assetId) + uint256(STKExternalDataType.REXA)),
                timestamp
            );
            if (isSet) return abi.encode(rexa);
        }

        return new bytes(0);
    }
}