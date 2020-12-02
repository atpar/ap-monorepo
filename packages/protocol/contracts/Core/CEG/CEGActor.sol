// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../ACTUS/Engines/CEG/ICEGEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "./ICEGRegistry.sol";


/**
 * @title CEGActor
 * @notice TODO
 */
contract CEGActor is BaseActor {

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
        CEGTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin,
        address extension
    )
        external
    {
        require(
            engine != address(0) && IEngine(engine).contractType() == ContractType.CEG,
            "ANNActor.initialize: CONTRACT_TYPE_OF_ENGINE_UNSUPPORTED"
        );

        // solium-disable-next-line
        bytes32 assetId = keccak256(abi.encode(terms, block.timestamp));

        // check if first contract reference in terms references an underlying asset
        if (terms.contractReference_1.role == ContractReferenceRole.COVE) {
            require(
                terms.contractReference_1.object != bytes32(0),
                "CEGACtor.initialize: INVALID_CONTRACT_REFERENCE_1_OBJECT"
            );
        }

        // todo add guarantee validation logic for contract reference 2

        // compute the initial state of the asset
        CEGState memory initialState = ICEGEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        ICEGRegistry(address(assetRegistry)).registerAsset(
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

        emit InitializedAsset(assetId, ContractType.CEG, ownership.creatorObligor, ownership.counterpartyObligor);
    }

    function computePayoffForEvent(
        bytes32 assetId,
        address engine,
        CEGTerms memory terms,
        CEGState memory state,
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
                terms.maturityDate
            );
        }
        
        bytes memory externalDataPOF;
        { externalDataPOF = getExternalDataForPOF(assetId, eventType, timestamp); }

        return (
            ICEGEngine(engine).computePayoffForEvent(
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
        CEGTerms memory terms,
        CEGState memory state,
        bytes32 _event
    )
        internal
        view
        returns (CEGState memory)
    {
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        uint256 timestamp;
        {
            // apply shift calc to schedule time
            timestamp = shiftCalcTime(
                scheduleTime,
                terms.businessDayConvention,
                terms.calendar,
                terms.maturityDate
            );
        }
        
        bytes memory externalDataSTF;
        { externalDataSTF = getExternalDataForSTF(assetId, eventType, timestamp); }

        return (
            ICEGEngine(engine).computeStateForEvent(
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
        CEGTerms memory terms = ICEGRegistry(address(assetRegistry)).getTerms(assetId);
        CEGState memory state = ICEGRegistry(address(assetRegistry)).getState(assetId);
        address engine = assetRegistry.getEngine(assetId);

        // get finalized state if asset is not performant
        if (state.contractPerformance != ContractPerformance.PF) {
            state = ICEGRegistry(address(assetRegistry)).getFinalizedState(assetId);
        }

        (, uint256 scheduleTime) = decodeEvent(_event);

        // get external data for the next event
        // compute payoff and the next state by applying the event to the current state
        int256 payoff = computePayoffForEvent(assetId, engine, terms, state, _event);
        CEGState memory nextState = computeStateForEvent(assetId, engine, terms, state, _event);

        // try to settle payoff of event
        bool settledPayoff = settlePayoffForEvent(assetId, _event, payoff);

        if (settledPayoff == false) {
            // if the obligation can't be fulfilled and the performance changed from performant to DL, DQ or DF,
            // store the last performant state of the asset
            // (if the obligation is later fulfilled before the asset reaches default,
            // the last performant state is used to derive subsequent states of the asset)
            if (state.contractPerformance == ContractPerformance.PF) {
                ICEGRegistry(address(assetRegistry)).setFinalizedState(assetId, state);
            }

            // store event as pending event for future settlement
            assetRegistry.pushPendingEvent(assetId, _event);

            // create CreditEvent
            bytes32 ceEvent = encodeEvent(EventType.CE, scheduleTime);

            // derive the actual state of the asset by applying the CreditEvent (updates performance of asset)
            nextState = computeStateForEvent(assetId, engine, terms, nextState, ceEvent);
        }

        // store the resulting state
        ICEGRegistry(address(assetRegistry)).setState(assetId, nextState);

        return (settledPayoff, payoff);
    }

    /**
     * @notice Retrieves external data (such as market object data, block time, underlying asset state)
     * used for evaluating the STF for a given event.
     */
    function getExternalDataForSTF(
        bytes32 assetId,
        EventType eventType,
        uint256 /* timestamp */
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
            // get the remaining notionalPrincipal from the underlying
            ContractReference memory contractReference_1 = assetRegistry.getContractReferenceValueForTermsAttribute(
                assetId,
                "contractReference_1"
            );
            if (contractReference_1.role == ContractReferenceRole.COVE) {
                bytes32 underlyingAssetId = contractReference_1.object;
                address underlyingRegistry = address(uint160(uint256(contractReference_1.object2)));
                require(
                    IAssetRegistry(underlyingRegistry).isRegistered(underlyingAssetId) == true,
                    "BaseActor.getExternalDataForSTF: ASSET_DOES_NOT_EXIST"
                );
                return abi.encode(
                    IAssetRegistry(underlyingRegistry).getIntValueForStateAttribute(underlyingAssetId, "notionalPrincipal")
                );
            }
        }

        return new bytes(0);
    }
}