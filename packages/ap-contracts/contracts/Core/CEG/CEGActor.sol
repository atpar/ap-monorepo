// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/CEG/ICEGEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "./ICEGRegistry.sol";


/**
 * @title CEGActor
 * @notice TODO
 */
contract CEGActor is BaseActor {

    constructor(IAssetRegistry assetRegistry, IDataRegistry dataRegistry)
        public
        BaseActor(assetRegistry, dataRegistry)
    {}

    /**
     * @notice Derives initial state of the asset terms and stores together with
     * terms, schedule, ownership, engine, admin of the asset in the contract types specific AssetRegistry.
     * @dev Can only be called by a whitelisted issuer.
     * @param terms asset specific terms
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine address of the ACTUS engine used for the spec. ContractType
     * @param admin address of the admin of the asset (optional)
     */
    function initialize(
        CEGTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin
    )
        external
        onlyRegisteredIssuer
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
        State memory initialState = ICEGEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        ICEGRegistry(address(assetRegistry)).registerAsset(
            assetId,
            terms,
            initialState,
            schedule,
            ownership,
            engine,
            address(this),
            admin
        );

        emit InitializedAsset(assetId, ContractType.CEG, ownership.creatorObligor, ownership.counterpartyObligor);
    }

    function computeStateAndPayoffForEvent(bytes32 assetId, State memory state, bytes32 _event)
        internal
        view
        override
        returns (State memory, int256)
    {
        address engine = assetRegistry.getEngine(assetId);
        CEGTerms memory terms = ICEGRegistry(address(assetRegistry)).getTerms(assetId);

        int256 payoff = ICEGEngine(engine).computePayoffForEvent(
            terms,
            state,
            _event,
            getExternalDataForPOF(assetId, _event)
        );
        state = ICEGEngine(engine).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(assetId, _event)
        );

        return (state, payoff);
    }
}