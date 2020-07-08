// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "@atpar/actus-solidity/contracts/Engines/ANN/IANNEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "./IANNRegistry.sol";


/**
 * @title ANNActor
 * @notice TODO
 */
contract ANNActor is BaseActor {

    constructor(IAssetRegistry assetRegistry, IMarketObjectRegistry marketObjectRegistry)
        public
        BaseActor(assetRegistry, marketObjectRegistry)
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
        ANNTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin
    )
        external
        onlyRegisteredIssuer
    {
        require(
            engine != address(0) && IEngine(engine).contractType() == ContractType.ANN,
            "ANNActor.initialize: CONTRACT_TYPE_OF_ENGINE_UNSUPPORTED"
        );

        // solium-disable-next-line
        bytes32 assetId = keccak256(abi.encode(terms, block.timestamp));

        // compute the initial state of the asset
        State memory initialState = IANNEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        IANNRegistry(address(assetRegistry)).registerAsset(
            assetId,
            terms,
            initialState,
            schedule,
            ownership,
            engine,
            address(this),
            admin
        );

        emit InitializedAsset(assetId, ContractType.ANN, ownership.creatorObligor, ownership.counterpartyObligor);
    }

    function computeStateAndPayoffForEvent(bytes32 assetId, State memory state, bytes32 _event)
        internal
        view
        override
        returns (State memory, int256)
    {
        // ContractType contractType = ContractType(assetRegistry.getEnumValueForTermsAttribute(assetId, "contractType"));        
        // revert("ANNActor.computePayoffAndStateForEvent: UNSUPPORTED_CONTRACT_TYPE");

        address engine = assetRegistry.getEngine(assetId);
        ANNTerms memory terms = IANNRegistry(address(assetRegistry)).getTerms(assetId);

        int256 payoff = IANNEngine(engine).computePayoffForEvent(
            terms,
            state,
            _event,
            getExternalDataForPOF(assetId, _event)
        );
        state = IANNEngine(engine).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(assetId, _event)
        );

        return (state, payoff);
    }
}