pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "./ICECTermsRegistry.sol";
// import "./IAssetRegistry.sol";


interface ICECRegistry is ICECTermsRegistry {

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
}
