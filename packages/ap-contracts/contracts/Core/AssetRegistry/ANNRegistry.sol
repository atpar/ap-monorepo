pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";

import "./BaseRegistry.sol";
import "./Terms/ANN/ANNTermsRegistry.sol";
import "./IANNRegistry.sol";


/**
 * @title ANNRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract ANNRegistry is BaseRegistry, ANNTermsRegistry, IANNRegistry {

    constructor()
        public
        BaseRegistry()
    {}

    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (ANNTerms)
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function registerAsset(
        bytes32 assetId,
        ANNTerms calldata terms,
        State calldata state,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address actor,
        address admin
    )
        external
        override
    {
        setAsset(assetId, state, schedule, ownership, engine, actor, admin);
        assets[assetId].encodeAndSetANNTerms(terms);
    }
}
