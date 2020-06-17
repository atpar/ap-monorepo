// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";

import "@atpar/actus-solidity/contracts/Core/Utils.sol";
import "@atpar/actus-solidity/contracts/Engines/ANN/IANNEngine.sol";
import "@atpar/actus-solidity/contracts/Engines/PAM/IPAMEngine.sol";
import "@atpar/actus-solidity/contracts/Engines/CEG/ICEGEngine.sol";
import "@atpar/actus-solidity/contracts/Engines/PAM/IPAMEngine.sol";

import "../Base/AssetActor/BaseActor.sol";
import "./IPAMRegistry.sol";


/**
 * @title PAMActor
 * @notice TODO
 */
contract PAMActor is BaseActor {

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
        PAMTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin
    )
        external
        onlyRegisteredIssuer
    {
        require(
            engine != address(0) && IEngine(engine).contractType() == ContractType.PAM,
            "ANNActor.initialize: CONTRACT_TYPE_OF_ENGINE_UNSUPPORTED"
        );

        // solium-disable-next-line
        bytes32 assetId = keccak256(abi.encode(terms, block.timestamp));

        // compute the initial state of the asset
        State memory initialState = IPAMEngine(engine).computeInitialState(terms);

        // register the asset in the AssetRegistry
        IPAMRegistry(address(assetRegistry)).registerAsset(
            assetId,
            terms,
            initialState,
            schedule,
            ownership,
            engine,
            address(this),
            admin
        );

        emit InitializedAsset(assetId, ContractType.PAM, ownership.creatorObligor, ownership.counterpartyObligor);
    }

    function computeStateAndPayoffForEvent(bytes32 assetId, State memory state, bytes32 _event)
        internal
        view
        override
        returns (State memory, int256)
    {
        address engine = assetRegistry.getEngine(assetId);
        PAMTerms memory terms = IPAMRegistry(address(assetRegistry)).getTerms(assetId);

        int256 payoff = IPAMEngine(engine).computePayoffForEvent(
            terms,
            state,
            _event,
            getExternalDataForPOF(assetId, _event)
        );
        state = IPAMEngine(engine).computeStateForEvent(
            terms,
            state,
            _event,
            getExternalDataForSTF(assetId, _event)
        );

        return (state, payoff);
    }
}