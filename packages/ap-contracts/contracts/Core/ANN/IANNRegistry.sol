// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/IAssetRegistry.sol";


interface IANNRegistry is IAssetRegistry {

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

    function getTerms(bytes32 assetId)
        external
        view
        returns (ANNTerms memory);

    function setTerms(bytes32 assetId, ANNTerms calldata terms)
        external;
}
