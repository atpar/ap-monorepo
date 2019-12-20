pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./SharedTypes.sol";


contract IAssetActor is SharedTypes {

    function progress(bytes32 assetId) external;

    function initialize(
        bytes32 assetId,
        AssetOwnership memory ownership,
        bytes32 templateId,
        CustomTerms memory customTerms,
        address engine
    )
        public
        returns (bool);
}
