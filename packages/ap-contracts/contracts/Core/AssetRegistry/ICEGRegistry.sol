pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";
import "./Terms/CEG/ICEGTermsRegistry.sol";
// import "./IAssetRegistry.sol";


interface ICEGRegistry is ICEGTermsRegistry {

    function registerAsset(
        bytes32 assetId,
        CEGTerms calldata terms,
        State calldata state,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address actor,
        address admin
    )
        external;
}
