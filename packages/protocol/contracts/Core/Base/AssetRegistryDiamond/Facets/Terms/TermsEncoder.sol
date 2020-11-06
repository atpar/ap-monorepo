// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../../../SharedTypes.sol";
import "../../Lib.sol";


library TermsEncoder {

    function decodeAndGetEnumValueForTermsAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (uint8)
    {
        if (attributeKey == "contractType") {
            return uint8(uint256(asset.packedTerms["enums"] >> 248));
        } else if (attributeKey == bytes32("calendar")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 240));
        } else if (attributeKey == bytes32("contractRole")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 232));
        } else if (attributeKey == bytes32("dayCountConvention")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 224));
        } else if (attributeKey == bytes32("businessDayConvention")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 216));
        } else if (attributeKey == bytes32("endOfMonthConvention")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 208));
        } else if (attributeKey == bytes32("scalingEffect")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 200));
        } else if (attributeKey == bytes32("penaltyType")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 192));
        } else if (attributeKey == bytes32("feeBasis")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 184));
        } else {
            return uint8(0);
        }
    }

    function decodeAndGetAddressValueForTermsAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (address)
    {
        return address(uint160(uint256(asset.packedTerms[attributeKey]) >> 96));
    }

    function decodeAndGetBytes32ValueForTermsAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (bytes32)
    {
        return asset.packedTerms[attributeKey];
    }

    function decodeAndGetUIntValueForTermsAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (uint256)
    {
        return uint256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetIntValueForTermsAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (int256)
    {
        return int256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetPeriodValueForTermsAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (IP memory)
    {
        return IP(
            uint256(asset.packedTerms[attributeKey] >> 24),
            P(uint8(uint256(asset.packedTerms[attributeKey] >> 16))),
            (asset.packedTerms[attributeKey] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
        );
    }

    function decodeAndGetCycleValueForTermsAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (IPS memory)
    {
        return IPS(
            uint256(asset.packedTerms[attributeKey] >> 24),
            P(uint8(uint256(asset.packedTerms[attributeKey] >> 16))),
            S(uint8(uint256(asset.packedTerms[attributeKey] >> 8))),
            (asset.packedTerms[attributeKey] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
        );
    }

    function decodeAndGetContractReferenceValueForTermsAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (ContractReference memory)
    {
        if (attributeKey == bytes32("contractReference_1")) {
            return ContractReference(
                asset.packedTerms["contractReference_1_object"],
                asset.packedTerms["contractReference_1_object2"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 8)))
            );
        } else if (attributeKey == bytes32("contractReference_2")) {
            return ContractReference(
                asset.packedTerms["contractReference_2_object"],
                asset.packedTerms["contractReference_2_object2"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 8)))
            );
        } else {
            return ContractReference(
                bytes32(0),
                bytes32(0),
                ContractReferenceType(0),
                ContractReferenceRole(0)
            );
        }
    }
}