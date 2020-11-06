// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";


interface ITermsFacet {

    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (uint8);

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (address);

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (bytes32);

    function getUIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (uint256);

    function getIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (int256);

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (IP memory);

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (IPS memory);

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        external
        view
        returns (ContractReference memory);
}
