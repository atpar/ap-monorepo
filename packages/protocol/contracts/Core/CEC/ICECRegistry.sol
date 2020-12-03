// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/IAssetRegistry.sol";


interface ICECRegistry is IAssetRegistry {

    function registerAsset(
        bytes32 assetId,
        CECTerms calldata terms,
        CECState calldata state,
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
        returns (CECTerms memory);

    function setTerms(bytes32 assetId, CECTerms calldata terms)
        external;
    
    function getState(bytes32 assetId)
        external
        view
        returns (CECState memory);

    function setState(bytes32 assetId, CECState calldata terms)
        external;

    function getFinalizedState(bytes32 assetId)
        external
        view
        returns (CECState memory);

    function setFinalizedState(bytes32 assetId, CECState calldata terms)
        external;
}
