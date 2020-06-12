pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";


interface IAssetIssuer {

    function issueAsset(
        bytes32 termsHash,
        ANNTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin
    )
        external;

    // function issueAsset(
    //     bytes32 termsHash,
    //     CECTerms calldata terms,
    //     bytes32[] calldata schedule,
    //     AssetOwnership calldata ownership,
    //     address engine,
    //     address admin
    // )
    //     external;

    // function issueAsset(
    //     bytes32 termsHash,
    //     CEGTerms calldata terms,
    //     bytes32[] calldata schedule,
    //     AssetOwnership calldata ownership,
    //     address engine,
    //     address admin
    // )
    //     external;

    function issueAsset(
        bytes32 termsHash,
        PAMTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address admin
    )
        external;
}
