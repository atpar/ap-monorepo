// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";


interface IOwnershipFacet {

    function setCreatorObligor (bytes32 assetId, address newCreatorObligor)
        external;

    function setCounterpartyObligor (bytes32 assetId, address newCounterpartyObligor)
        external;

    function setCreatorBeneficiary(bytes32 assetId, address newCreatorBeneficiary)
        external;

    function setCounterpartyBeneficiary(bytes32 assetId, address newCounterpartyBeneficiary)
        external;

    function getOwnership(bytes32 assetId)
        external
        view
        returns (AssetOwnership memory);
}
