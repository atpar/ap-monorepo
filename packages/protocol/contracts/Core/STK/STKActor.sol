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

    using SignedMath for int;

    enum STKExternalDataType {NA, DIP, SRA, REXA}


    constructor(IAssetRegistry assetRegistry, IOracleRegistry oracleRegistry) BaseActor(assetRegistry, oracleRegistry) {}

    /**
     * @notice Derives initial state of the asset terms and stores together with
     * terms, schedule, ownership, engine, admin of the asset in the contract types specific AssetRegistry.
     * @param terms asset specific terms
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine address of the ACTUS engine used for the spec. ContractType
     * @param admin address of the admin of the asset (optional)
     */
    function initialize(
        STKTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin
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
        State memory initialState = ISTKEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        ISTKRegistry(address(assetRegistry)).registerAsset(
            assetId,
            terms,
            initialState,
            schedule,
            ownership,
            engine,
            address(this),
            admin
        );

        emit InitializedAsset(assetId, ContractType.STK, ownership.creatorObligor, ownership.counterpartyObligor);
    }

    function computeStateAndPayoffForEvent(bytes32 assetId, State memory state, bytes32 _event)
        internal
        view
        override
        returns (State memory, int256)
    {
        address engine = assetRegistry.getEngine(assetId);
        STKTerms memory terms = ISTKRegistry(address(assetRegistry)).getTerms(assetId);
        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        int256 payoff = ISTKEngine(engine).computePayoffForEvent(
            terms,
            state,
            _event,
            getExternalDataForPOF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, 0)
            )
        );
        state = ISTKEngine(engine).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, 0)
            )
        );

        return (state, payoff);
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
        returns (bytes32)
    {
        if (eventType == EventType.CE) {
            // get current timestamp
            // solium-disable-next-line
            return bytes32(block.timestamp);
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
                (int256 quantity, bool isSet) = oracleRegistry.getDataPoint(
                    address(0),
                    abi.encode(contractReference_2.object,timestamp)
                );
                if (isSet) return bytes32(quantity);
            }
        } else if (eventType == EventType.REF) {
            //
            (int256 rexa, bool isSet) = oracleRegistry.getDataPoint(
                address(0),
                abi.encode(bytes32(uint256(assetId) + uint256(STKExternalDataType.REXA)),timestamp)
            );
            if (isSet) return bytes32(rexa);
        } else if (eventType == EventType.DIF) {
            (int256 dipa, bool isSet) = oracleRegistry.getDataPoint(
                address(0),
                abi.encode(bytes32(uint256(assetId) + uint256(STKExternalDataType.DIP)),timestamp)
            );
            if (isSet) return bytes32(dipa);
        } else if (eventType == EventType.SPF) {
            (int256 sra, bool isSet) = oracleRegistry.getDataPoint(
                address(0),
                abi.encode(bytes32(uint256(assetId) + uint256(STKExternalDataType.SRA)),timestamp)
            );
            if (isSet) return bytes32(sra);
        } else if (eventType == EventType.REF) {
            (int256 rexa, bool isSet) = oracleRegistry.getDataPoint(
                address(0),
                abi.encode(bytes32(uint256(assetId) + uint256(STKExternalDataType.REXA)),timestamp)
            );
            if (isSet) return bytes32(rexa);
        }

        return bytes32(0);
    }
}