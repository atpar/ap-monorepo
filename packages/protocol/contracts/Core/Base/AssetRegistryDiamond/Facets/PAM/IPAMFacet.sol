// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";


interface IPAMFacet {

    function registerPAMAsset(
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

    function getPAMTerms(bytes32 assetId)
        external
        view
        returns (PAMTerms memory);

    function setPAMTerms(bytes32 assetId, PAMTerms calldata terms)
        external;

    function getNextComputedPAMEvent(bytes32 assetId)
        external
        view
        returns (bytes32, bool);
}
