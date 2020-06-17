// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistryStorage.sol";


library CEGEncoder {

    function storeInPackedTerms(Asset storage asset, bytes32 attributeKey, bytes32 value) private {
        // skip if value did not change
        if (asset.packedTerms[attributeKey] == value) return;
        asset.packedTerms[attributeKey] = value;
    }
    
    /**
     * @dev Tightly pack and store only non-zero overwritten terms (LifecycleTerms)
     * @notice All non zero values of the overwrittenTerms object are stored.
     * It does not check if overwrittenAttributesMap actually marks attribute as overwritten.
     */
    function encodeAndSetCEGTerms(Asset storage asset, CEGTerms memory terms) internal {
        storeInPackedTerms(
            asset,
            "enums",
            bytes32(uint256(uint8(terms.contractType))) << 248 |
            bytes32(uint256(uint8(terms.calendar))) << 240 |
            bytes32(uint256(uint8(terms.contractRole))) << 232 |
            bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
            bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
            bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
            bytes32(uint256(uint8(terms.feeBasis))) << 200 |
            bytes32(uint256(uint8(terms.creditEventTypeCovered))) << 192
        );

        storeInPackedTerms(asset, "currency", bytes32(uint256(terms.currency) << 96));
        storeInPackedTerms(asset, "settlementCurrency", bytes32(uint256(terms.settlementCurrency) << 96));

        storeInPackedTerms(asset, "contractDealDate", bytes32(terms.contractDealDate));
        storeInPackedTerms(asset, "statusDate", bytes32(terms.statusDate));
        storeInPackedTerms(asset, "maturityDate", bytes32(terms.maturityDate));
        storeInPackedTerms(asset, "purchaseDate", bytes32(terms.purchaseDate));
        storeInPackedTerms(asset, "cycleAnchorDateOfFee", bytes32(terms.cycleAnchorDateOfFee));

        storeInPackedTerms(asset, "notionalPrincipal", bytes32(terms.notionalPrincipal));
        storeInPackedTerms(asset, "delinquencyRate", bytes32(terms.delinquencyRate));
        
        storeInPackedTerms(asset, "feeRate", bytes32(terms.feeRate));
        storeInPackedTerms(asset, "feeAccrued", bytes32(terms.feeAccrued));
        storeInPackedTerms(asset, "priceAtPurchaseDate", bytes32(terms.priceAtPurchaseDate));

        storeInPackedTerms(asset, "coverageOfCreditEnhancement", bytes32(terms.coverageOfCreditEnhancement));

        storeInPackedTerms(
            asset,
            "gracePeriod",
            bytes32(uint256(terms.gracePeriod.i)) << 24 |
            bytes32(uint256(terms.gracePeriod.p)) << 16 |
            bytes32(uint256((terms.gracePeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedTerms(
            asset,
            "delinquencyPeriod",
            bytes32(uint256(terms.delinquencyPeriod.i)) << 24 |
            bytes32(uint256(terms.delinquencyPeriod.p)) << 16 |
            bytes32(uint256((terms.delinquencyPeriod.isSet) ? 1 : 0)) << 8
        );

        storeInPackedTerms(
            asset,
            "cycleOfFee",
            bytes32(uint256(terms.cycleOfFee.i)) << 24 |
            bytes32(uint256(terms.cycleOfFee.p)) << 16 |
            bytes32(uint256(terms.cycleOfFee.s)) << 8 |
            bytes32(uint256((terms.cycleOfFee.isSet) ? 1 : 0))
        );

        storeInPackedTerms(
            asset,
            "contractReference_1_type_role",
            bytes32(uint256(terms.contractReference_1._type)) << 16 |
            bytes32(uint256(terms.contractReference_1.role)) << 8
        );

        storeInPackedTerms(
            asset,
            "contractReference_1_object",
            terms.contractReference_1.object
        );

        storeInPackedTerms(
            asset,
            "contractReference_2_type_role",
            bytes32(uint256(terms.contractReference_2._type)) << 16 |
            bytes32(uint256(terms.contractReference_2.role)) << 8
        );

        storeInPackedTerms(
            asset,
            "contractReference_2_object",
            terms.contractReference_2.object
        );
    }

    /**
     * @dev Decode and loads CEGTerms
     */
    function decodeAndGetCEGTerms(Asset storage asset) internal view returns (CEGTerms memory) {
        return CEGTerms(
            ContractType(uint8(uint256(asset.packedTerms["enums"] >> 248))),
            Calendar(uint8(uint256(asset.packedTerms["enums"] >> 240))),
            ContractRole(uint8(uint256(asset.packedTerms["enums"] >> 232))),
            DayCountConvention(uint8(uint256(asset.packedTerms["enums"] >> 224))),
            BusinessDayConvention(uint8(uint256(asset.packedTerms["enums"] >> 216))),
            EndOfMonthConvention(uint8(uint256(asset.packedTerms["enums"] >> 208))),
            FeeBasis(uint8(uint256(asset.packedTerms["enums"] >> 200))),
            ContractPerformance(uint8(uint256(asset.packedTerms["enums"] >> 192))),

            address(uint160(uint256(asset.packedTerms["currency"]) >> 96)),
            address(uint160(uint256(asset.packedTerms["settlementCurrency"]) >> 96)),

            uint256(asset.packedTerms["contractDealDate"]),
            uint256(asset.packedTerms["statusDate"]),
            uint256(asset.packedTerms["maturityDate"]),
            uint256(asset.packedTerms["purchaseDate"]),
            uint256(asset.packedTerms["cycleAnchorDateOfFee"]),

            int256(asset.packedTerms["notionalPrincipal"]),
            int256(asset.packedTerms["delinquencyRate"]),

            int256(asset.packedTerms["feeRate"]),
            int256(asset.packedTerms["feeAccrued"]),
            int256(asset.packedTerms["priceAtPurchaseDate"]),

            int256(asset.packedTerms["coverageOfCreditEnhancement"]),

            IP(
                uint256(asset.packedTerms["gracePeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["gracePeriod"] >> 16))),
                (asset.packedTerms["gracePeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(asset.packedTerms["delinquencyPeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["delinquencyPeriod"] >> 16))),
                (asset.packedTerms["delinquencyPeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),

            IPS(
                uint256(asset.packedTerms["cycleOfFee"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfFee"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfFee"] >> 8))),
                (asset.packedTerms["cycleOfFee"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),

            ContractReference(
                asset.packedTerms["contractReference_1_object"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 8)))
            ),
            ContractReference(
                asset.packedTerms["contractReference_2_object"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 8)))
            )
        );
    }

    function decodeAndGetEnumValueForCEGAttribute(Asset storage asset, bytes32 attributeKey)
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
        } else if (attributeKey == bytes32("feeBasis")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 200));
        } else if (attributeKey == bytes32("contractPerformance")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 192));
        } else {
            return uint8(0);
        }
    }

    function decodeAndGetAddressValueForForCEGAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (address)
    {
        if (attributeKey == bytes32("currency")) {
            return address(uint160(uint256(asset.packedTerms["currency"]) >> 96));
        } else if (attributeKey == bytes32("settlementCurrency")) {
            return address(uint160(uint256(asset.packedTerms["settlementCurrency"]) >> 96));
        } else {
            return address(0);
        }   
    }

    function decodeAndGetBytes32ValueForForCEGAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (bytes32)
    {
        return asset.packedTerms[attributeKey];
    }

    function decodeAndGetUIntValueForForCEGAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (uint256)
    {
        return uint256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetIntValueForForCEGAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (int256)
    {
        return int256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetPeriodValueForForCEGAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (IP memory)
    {
        if (
            attributeKey == bytes32("gracePeriod")
            || attributeKey == bytes32("delinquencyPeriod")
        ) {
            return IP(
                uint256(asset.packedTerms[attributeKey] >> 24),
                P(uint8(uint256(asset.packedTerms[attributeKey] >> 16))),
                (asset.packedTerms[attributeKey] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            );
        } else {
            return IP(0, P(0), false);
        }
    }

    function decodeAndGetCycleValueForForCEGAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (IPS memory)
    {
        if (
            attributeKey == bytes32("cycleOfFee")
        ) {
            return IPS(
                uint256(asset.packedTerms[attributeKey] >> 24),
                P(uint8(uint256(asset.packedTerms[attributeKey] >> 16))),
                S(uint8(uint256(asset.packedTerms[attributeKey] >> 8))),
                (asset.packedTerms[attributeKey] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            );
        } else {
            return IPS(0, P(0), S(0), false);
        }
    }

    function decodeAndGetContractReferenceValueForCEGAttribute(Asset storage asset , bytes32 attributeKey )
        internal
        view
        returns (ContractReference memory)
    {
        if (attributeKey == bytes32("contractReference_1")) {
            return ContractReference(
                asset.packedTerms["contractReference_1_object"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 8)))
            );
        } else if (attributeKey == bytes32("contractReference_2")) {
            return ContractReference(
                asset.packedTerms["contractReference_2_object"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 8)))
            );
        } else {
            return ContractReference(
                bytes32(0),
                ContractReferenceType(0),
                ContractReferenceRole(0)
            );
        }
    }
}