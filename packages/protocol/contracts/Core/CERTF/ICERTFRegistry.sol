// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/IAssetRegistry.sol";


interface ICERTFRegistry is IAssetRegistry {

    function registerAsset(
        bytes32 assetId,
        CERTFTerms calldata terms,
        CERTFState calldata state,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address actor,
        address admin,
        address extension
    )
        external;
    
    function getTerms(bytes32 assetId)
        external
        view
        returns (CERTFTerms memory);

    function setTerms(bytes32 assetId, CERTFTerms calldata terms)
        external;

    function getState(bytes32 assetId)
        external
        view
        returns (CERTFState memory);

    function setState(bytes32 assetId, CERTFState calldata terms)
        external;

    function getFinalizedState(bytes32 assetId)
        external
        view
        returns (CERTFState memory);

    function setFinalizedState(bytes32 assetId, CERTFState calldata terms)
        external;
}
