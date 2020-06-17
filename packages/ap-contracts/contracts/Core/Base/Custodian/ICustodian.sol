// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;
pragma experimental ABIEncoderV2;

import "../SharedTypes.sol";


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