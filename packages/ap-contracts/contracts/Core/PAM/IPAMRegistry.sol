pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/IAssetRegistry.sol";


interface IPAMRegistry is IAssetRegistry {

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
        external;
    
    function getTerms(bytes32 assetId)
        external
        view
        returns (PAMTerms memory);

    function setTerms(bytes32 assetId, PAMTerms calldata terms)
        external;
}
