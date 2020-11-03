// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";
import "../IBaseContractFacet.sol";


interface IANNFacet is IBaseContractFacet {

    function registerAsset(
        bytes32 assetId,
        ANNTerms calldata terms,
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
        returns (ANNTerms memory);

    function setTerms(bytes32 assetId, ANNTerms calldata terms)
        external;
}
