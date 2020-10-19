// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../../ACTUS/Engines/STK/ISTKEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "./ISTKRegistry.sol";


/**
 * @title STKActor
 * @notice TODO
 */
contract STKActor is BaseActor {

    enum STKExternalDataType {NA, DIP, SRA, REXA}

    constructor(IAssetRegistry assetRegistry, IDataRegistry dataRegistry)
        public
        BaseActor(assetRegistry, dataRegistry)
    {}

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
            _getExternalDataForSTF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, 0)
            )
        );

        return (state, payoff);
    }

    function _getExternalDataForSTF(
        bytes32 assetId,
        EventType eventType,
        uint256 timestamp
    )
    private
    view
    returns (bytes32)
    {
        if (eventType == EventType.DIF) {
            (int256 dipa, bool isSet) = dataRegistry.getDataPoint(
                bytes32(uint256(assetId) + uint256(STKExternalDataType.DIP)),
                timestamp
            );
            return isSet ? bytes32(dipa) : bytes32(0);
        } else if (eventType == EventType.SPF) {
            (int256 sra, bool isSet) = dataRegistry.getDataPoint(
                bytes32(uint256(assetId) + uint256(STKExternalDataType.SRA)),
                timestamp
            );
            if (isSet) return bytes32(sra);
        } else if (eventType == EventType.REF) {
            (int256 rexa, bool isSet) = dataRegistry.getDataPoint(
                bytes32(uint256(assetId) + uint256(STKExternalDataType.REXA)),
                timestamp
            );
            if (isSet) return bytes32(rexa);
        } else {
            return super.getExternalDataForSTF(assetId, eventType, timestamp);
        }
        return bytes32(0);
    }
}
