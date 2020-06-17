pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/IAssetRegistry.sol";


interface ICECRegistry is IAssetRegistry {

    function registerAsset(
        bytes32 assetId,
        CECTerms calldata terms,
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
        returns (CECTerms memory);

    function setTerms(bytes32 assetId, CECTerms calldata terms)
        external;
}
