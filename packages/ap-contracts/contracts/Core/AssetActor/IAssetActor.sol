pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


interface IAssetActor {

    function progress(bytes32 assetId)
        external;

    function progressWith(bytes32 assetId, bytes32 _event)
        external;

    // function initialize(
    //     bytes32 assetId,
    //     ANNTerms memory terms,
    //     bytes32[] calldata schedule,
    //     AssetOwnership memory ownership,
    //     address engine,
    //     address root
    // )
    //     public
    //     returns (bool);

    // function initialize(
    //     bytes32 assetId,
    //     CECTerms memory terms,
    //     bytes32[] calldata schedule,
    //     AssetOwnership memory ownership,
    //     address engine,
    //     address root
    // )
    //     public
    //     returns (bool);

    // function initialize(
    //     bytes32 assetId,
    //     CEGTerms memory terms,
    //     bytes32[] calldata schedule,
    //     AssetOwnership memory ownership,
    //     address engine,
    //     address root
    // )
    //     public
    //     returns (bool);

    function initialize(
        bytes32 assetId,
        PAMTerms calldata terms,
        bytes32[] calldata schedule,
        AssetOwnership calldata ownership,
        address engine,
        address root
    )
        external
        returns (bool);
}
