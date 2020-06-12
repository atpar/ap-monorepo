pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";

import "./BaseRegistry.sol";
import "./Terms/PAM/PAMTermsRegistry.sol";
import "./IPAMRegistry.sol";


/**
 * @title PAMRegistry
 * @notice Registry for ACTUS Protocol assets
 */
contract PAMRegistry is BaseRegistry, PAMTermsRegistry, IPAMRegistry {
    
    constructor()
        public
        BaseRegistry()
    {}

    /**
     * @notice
     * @param assetId id of the asset
     * @param terms asset specific terms (PAMTerms)
     * @param state initial state of the asset
     * @param schedule schedule of the asset
     * @param ownership ownership of the asset
     * @param engine ACTUS Engine of the asset
     * @param actor account which is allowed to update the asset state
     * @param admin account which as admin rights (optional)
     */
    function registerAsset(
        bytes32 assetId,
        PAMTerms calldata terms,
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
        assets[assetId].encodeAndSetPAMTerms(terms);
    }
}
