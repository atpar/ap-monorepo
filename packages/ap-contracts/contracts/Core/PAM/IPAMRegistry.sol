// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/IAssetRegistry.sol";


interface IPAMRegistry is IAssetRegistry {

    function registerAsset(
        bytes32 assetId,
        PAMTerms calldata terms,
        PAMState calldata state,
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
        returns (PAMTerms memory);

    function setTerms(bytes32 assetId, PAMTerms calldata terms)
        external;
    
    function getState(bytes32 assetId)
        external
        view
        returns (PAMState memory);

    function setState(bytes32 assetId, PAMState calldata terms)
        external;

    function getFinalizedState(bytes32 assetId)
        external
        view
        returns (PAMState memory);

    function setFinalizedState(bytes32 assetId, PAMState calldata terms)
        external;
}
