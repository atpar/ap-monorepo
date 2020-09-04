// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/CEC/ICECEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "../Base/Custodian/ICustodian.sol";
import "./ICECRegistry.sol";


/**
 * @title CECActor
 * @notice TODO
 */
contract CECActor is BaseActor {


    constructor(IAssetRegistry assetRegistry, IDataRegistry dataRegistry)
        public
        BaseActor(assetRegistry, dataRegistry)
    {}

    /**
     * @notice Derives initial state of the asset terms and stores together with
     * terms, schedule, ownership, engine, admin of the asset in the contract types specific AssetRegistry.
     * @param terms asset specific terms
     * @param schedule schedule of the asset
     * @param engine address of the ACTUS engine used for the spec. ContractType
     * @param admin address of the admin of the asset (optional)
     * @param custodian address of the custodian of the collateral
     * @param underlyingRegistry address of the asset registry where the underlying asset is stored
     */
    function initialize(
        CECTerms calldata terms,
        bytes32[] calldata schedule,
        address engine,
        address admin,
        address custodian,
        address underlyingRegistry
    )
        external
    {
        require(
            engine != address(0) && IEngine(engine).contractType() == ContractType.CEC,
            "ANNActor.initialize: CONTRACT_TYPE_OF_ENGINE_UNSUPPORTED"
        );

        // solium-disable-next-line
        bytes32 assetId = keccak256(abi.encode(terms, block.timestamp));
        AssetOwnership memory ownership;

        // check if first contract reference in terms references an underlying asset
        if (terms.contractReference_1.role == ContractReferenceRole.COVE) {
            require(
                terms.contractReference_1.object != bytes32(0),
                "CECActor.initialize: INVALID_CONTRACT_REFERENCE_1_OBJECT"
            );
        }

        // check if second contract reference in terms contains a reference to collateral
        if (terms.contractReference_2.role == ContractReferenceRole.COVI) {
            require(
                terms.contractReference_2.object != bytes32(0),
                "CECActor.initialize: INVALID_CONTRACT_REFERENCE_2_OBJECT"
            );

            // derive assetId
            // solium-disable-next-line
            assetId = keccak256(abi.encode(terms, address(custodian), block.timestamp));

            // derive underlying assetId
            bytes32 underlyingAssetId = terms.contractReference_1.object;
            // get contract role and ownership of referenced underlying asset
            ContractRole underlyingContractRole = ContractRole(assetRegistry.getEnumValueForTermsAttribute(underlyingAssetId, "contractRole"));
            AssetOwnership memory underlyingAssetOwnership = IAssetRegistry(underlyingRegistry).getOwnership(underlyingAssetId);

            // set ownership of draft according to contract role of underlying
            if (terms.contractRole == ContractRole.BUY && underlyingContractRole == ContractRole.RPA) {
                ownership = AssetOwnership(
                    underlyingAssetOwnership.creatorObligor,
                    underlyingAssetOwnership.creatorBeneficiary,
                    address(custodian),
                    underlyingAssetOwnership.counterpartyBeneficiary
                );
            } else if (terms.contractRole == ContractRole.SEL && underlyingContractRole == ContractRole.RPL) {
                ownership = AssetOwnership(
                    address(custodian),
                    underlyingAssetOwnership.creatorBeneficiary,
                    underlyingAssetOwnership.counterpartyObligor,
                    underlyingAssetOwnership.counterpartyBeneficiary
                );
            } else {
                // only BUY, RPA and SEL, RPL allowed for CEC
                revert("CECActor.initialize: INVALID_CONTRACT_ROLES");
            }

            // execute contractual conditions
            // try transferring collateral to the custodian
            ICustodian(custodian).lockCollateral(assetId, terms, ownership);
        }

        // compute the initial state of the asset
        CECState memory initialState = ICECEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        ICECRegistry(address(assetRegistry)).registerAsset(
            assetId,
            terms,
            initialState,
            schedule,
            ownership,
            engine,
            address(this),
            admin
        );

        emit InitializedAsset(assetId, ContractType.CEC, ownership.creatorObligor, ownership.counterpartyObligor);
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
        CECTerms memory terms = ICECRegistry(address(assetRegistry)).getTerms(assetId);
        CECState memory state = ICECRegistry(address(assetRegistry)).getState(assetId);
        address engine = assetRegistry.getEngine(assetId);

        // get finalized state if asset is not performant
        if (state.contractPerformance != ContractPerformance.PF) {
            state = ICECRegistry(address(assetRegistry)).getFinalizedState(assetId);
        }

        (EventType eventType, uint256 scheduleTime) = decodeEvent(_event);

        // get external data for the next event
        // compute payoff and the next state by applying the event to the current state
        int256 payoff = ICECEngine(engine).computePayoffForEvent(
            terms,
            state,
            _event,
            getExternalDataForPOF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
            )
        );
        CECState memory nextState = ICECEngine(engine).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(
                assetId,
                eventType,
                shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
            )
        );

        // try to settle payoff of event
        bool settledPayoff = settlePayoffForEvent(assetId, _event, payoff);

        if (settledPayoff == false) {
            // if the obligation can't be fulfilled and the performance changed from performant to DL, DQ or DF,
            // store the last performant state of the asset
            // (if the obligation is later fulfilled before the asset reaches default,
            // the last performant state is used to derive subsequent states of the asset)
            if (state.contractPerformance == ContractPerformance.PF) {
                ICECRegistry(address(assetRegistry)).setFinalizedState(assetId, state);
            }

            // store event as pending event for future settlement
            assetRegistry.pushPendingEvent(assetId, _event);

            // create CreditEvent
            bytes32 ceEvent = encodeEvent(EventType.CE, scheduleTime);

            // derive the actual state of the asset by applying the CreditEvent (updates performance of asset)
            nextState = ICECEngine(engine).computeStateForEvent(
                terms,
                state,
                ceEvent,
                getExternalDataForSTF(
                    assetId,
                    EventType.CE,
                    shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate)
                )
            );
        }

        // store the resulting state
        ICECRegistry(address(assetRegistry)).setState(assetId, nextState);

        return (settledPayoff, payoff);
    }
}