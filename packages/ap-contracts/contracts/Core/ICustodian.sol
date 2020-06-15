pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Core/SharedTypes.sol";


interface ICustodian {

    function lockCollateral(
        bytes32 assetId,
        CECTerms calldata terms,
        AssetOwnership calldata ownership
    )
        external
        returns (bool);

    function returnCollateral(
        bytes32 assetId
    )
        external
        returns (bool);
}