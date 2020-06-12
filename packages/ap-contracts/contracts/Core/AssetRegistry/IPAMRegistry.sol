pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";
import "./Terms/PAM/IPAMTermsRegistry.sol";
// import "./IAssetRegistry.sol";


interface IPAMRegistry is IPAMTermsRegistry{

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
}
