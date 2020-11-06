// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "./TermsEncoder.sol";
import "./ITermsFacet.sol";


contract TermsFacet is ITermsFacet {

    using TermsEncoder for Asset;


    function getEnumValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint8)
    {
        return assetStorage().assets[assetId].decodeAndGetEnumValueForTermsAttribute(attribute);
    }

    function getAddressValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (address)
    {
        return assetStorage().assets[assetId].decodeAndGetAddressValueForTermsAttribute(attribute);
    }

    function getBytes32ValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (bytes32)
    {
        return assetStorage().assets[assetId].decodeAndGetBytes32ValueForTermsAttribute(attribute);
    }

    function getUIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (uint256)
    {
        return assetStorage().assets[assetId].decodeAndGetUIntValueForTermsAttribute(attribute);
    }

    function getIntValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (int256)
    {
        return assetStorage().assets[assetId].decodeAndGetIntValueForTermsAttribute(attribute);
    }

    function getPeriodValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (IP memory)
    {
        return assetStorage().assets[assetId].decodeAndGetPeriodValueForTermsAttribute(attribute);
    }

    function getCycleValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (IPS memory)
    {
        return assetStorage().assets[assetId].decodeAndGetCycleValueForTermsAttribute(attribute);
    }

    function getContractReferenceValueForTermsAttribute(bytes32 assetId, bytes32 attribute)
        public
        view
        override
        returns (ContractReference memory)
    {
        return assetStorage().assets[assetId].decodeAndGetContractReferenceValueForTermsAttribute(attribute);
    }
}