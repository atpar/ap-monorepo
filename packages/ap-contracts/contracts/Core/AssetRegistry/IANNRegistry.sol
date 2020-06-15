pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";
import "./Terms/ANN/IANNTermsRegistry.sol";
// import "./IAssetRegistry.sol";


interface IANNRegistry is IANNTermsRegistry {

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
        external;
}
