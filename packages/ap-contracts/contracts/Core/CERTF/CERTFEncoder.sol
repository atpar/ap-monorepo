// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistryStorage.sol";


library CERTFEncoder {

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
    function encodeAndSetCERTFTerms(Asset storage asset, CERTFTerms memory terms) external {
        storeInPackedTerms(
            asset,
            "enums",
            bytes32(uint256(uint8(terms.contractType))) << 248 |
            bytes32(uint256(uint8(terms.calendar))) << 240 |
            bytes32(uint256(uint8(terms.contractRole))) << 232 |
            bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
            bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
            bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
            bytes32(uint256(uint8(terms.couponType))) << 200
        );

        storeInPackedTerms(asset, "currency", bytes32(uint256(terms.currency) << 96));
        storeInPackedTerms(asset, "settlementCurrency", bytes32(uint256(terms.settlementCurrency) << 96));

        storeInPackedTerms(asset, "contractDealDate", bytes32(terms.contractDealDate));
        storeInPackedTerms(asset, "statusDate", bytes32(terms.statusDate));
        storeInPackedTerms(asset, "initialExchangeDate", bytes32(terms.initialExchangeDate));
        storeInPackedTerms(asset, "maturityDate", bytes32(terms.maturityDate));
        storeInPackedTerms(asset, "issueDate", bytes32(terms.issueDate));
        storeInPackedTerms(asset, "cycleAnchorDateOfRedemption", bytes32(terms.cycleAnchorDateOfRedemption));
        storeInPackedTerms(asset, "cycleAnchorDateOfTermination", bytes32(terms.cycleAnchorDateOfTermination));
        storeInPackedTerms(asset, "cycleAnchorDateOfCoupon", bytes32(terms.cycleAnchorDateOfCoupon));

        storeInPackedTerms(asset, "nominalPrice", bytes32(terms.nominalPrice));
        storeInPackedTerms(asset, "issuePrice", bytes32(terms.issuePrice));
        storeInPackedTerms(asset, "quantity", bytes32(terms.quantity));
        storeInPackedTerms(asset, "denominationRatio", bytes32(terms.denominationRatio));
        storeInPackedTerms(asset, "couponRate", bytes32(terms.couponRate));

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
            "settlementPeriod",
            bytes32(uint256(terms.settlementPeriod.i)) << 24 |
            bytes32(uint256(terms.settlementPeriod.p)) << 16 |
            bytes32(uint256((terms.settlementPeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedTerms(
            asset,
            "fixingPeriod",
            bytes32(uint256(terms.fixingPeriod.i)) << 24 |
            bytes32(uint256(terms.fixingPeriod.p)) << 16 |
            bytes32(uint256((terms.fixingPeriod.isSet) ? 1 : 0)) << 8
        );
        storeInPackedTerms(
            asset,
            "redemptionExercisePeriod",
            bytes32(uint256(terms.redemptionExercisePeriod.i)) << 24 |
            bytes32(uint256(terms.redemptionExercisePeriod.p)) << 16 |
            bytes32(uint256((terms.redemptionExercisePeriod.isSet) ? 1 : 0)) << 8
        );

        storeInPackedTerms(
            asset,
            "cycleOfRedemption",
            bytes32(uint256(terms.cycleOfRedemption.i)) << 24 |
            bytes32(uint256(terms.cycleOfRedemption.p)) << 16 |
            bytes32(uint256(terms.cycleOfRedemption.s)) << 8 |
            bytes32(uint256((terms.cycleOfRedemption.isSet) ? 1 : 0))
        );
        storeInPackedTerms(
            asset,
            "cycleOfTermination",
            bytes32(uint256(terms.cycleOfTermination.i)) << 24 |
            bytes32(uint256(terms.cycleOfTermination.p)) << 16 |
            bytes32(uint256(terms.cycleOfTermination.s)) << 8 |
            bytes32(uint256((terms.cycleOfTermination.isSet) ? 1 : 0))
        );
        storeInPackedTerms(
            asset,
            "cycleOfCoupon",
            bytes32(uint256(terms.cycleOfCoupon.i)) << 24 |
            bytes32(uint256(terms.cycleOfCoupon.p)) << 16 |
            bytes32(uint256(terms.cycleOfCoupon.s)) << 8 |
            bytes32(uint256((terms.cycleOfCoupon.isSet) ? 1 : 0))
        );

        storeInPackedTerms(
            asset,
            "contractReference_1_object",
            terms.contractReference_1.object
        );
        storeInPackedTerms(
            asset,
            "contractReference_1_object2",
            terms.contractReference_1.object2
        );
        storeInPackedTerms(
            asset,
            "contractReference_1_type_role",
            bytes32(uint256(terms.contractReference_1._type)) << 16 |
            bytes32(uint256(terms.contractReference_1.role)) << 8
        );

        storeInPackedTerms(
            asset,
            "contractReference_2_object",
            terms.contractReference_2.object
        );
        storeInPackedTerms(
            asset,
            "contractReference_2_object2",
            terms.contractReference_2.object2
        );
        storeInPackedTerms(
            asset,
            "contractReference_2_type_role",
            bytes32(uint256(terms.contractReference_2._type)) << 16 |
            bytes32(uint256(terms.contractReference_2.role)) << 8
        );
    }

    /**
     * @dev Decode and loads CERTFTerms
     */
    function decodeAndGetCERTFTerms(Asset storage asset) external view returns (CERTFTerms memory) {
        return CERTFTerms(
            ContractType(uint8(uint256(asset.packedTerms["enums"] >> 248))),
            Calendar(uint8(uint256(asset.packedTerms["enums"] >> 240))),
            ContractRole(uint8(uint256(asset.packedTerms["enums"] >> 232))),
            DayCountConvention(uint8(uint256(asset.packedTerms["enums"] >> 224))),
            BusinessDayConvention(uint8(uint256(asset.packedTerms["enums"] >> 216))),
            EndOfMonthConvention(uint8(uint256(asset.packedTerms["enums"] >> 208))),
            CouponType(uint8(uint256(asset.packedTerms["enums"] >> 200))),

            address(uint160(uint256(asset.packedTerms["currency"]) >> 96)),
            address(uint160(uint256(asset.packedTerms["settlementCurrency"]) >> 96)),

            uint256(asset.packedTerms["contractDealDate"]),
            uint256(asset.packedTerms["statusDate"]),
            uint256(asset.packedTerms["initialExchangeDate"]),
            uint256(asset.packedTerms["maturityDate"]),
            uint256(asset.packedTerms["issueDate"]),
            uint256(asset.packedTerms["cycleAnchorDateOfRedemption"]),
            uint256(asset.packedTerms["cycleAnchorDateOfTermination"]),
            uint256(asset.packedTerms["cycleAnchorDateOfCoupon"]),

            int256(asset.packedTerms["nominalPrice"]),
            int256(asset.packedTerms["issuePrice"]),
            int256(asset.packedTerms["quantity"]),
            int256(asset.packedTerms["denominationRatio"]),
            int256(asset.packedTerms["couponRate"]),

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
            IP(
                uint256(asset.packedTerms["settlementPeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["settlementPeriod"] >> 16))),
                (asset.packedTerms["settlementPeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(asset.packedTerms["fixingPeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["fixingPeriod"] >> 16))),
                (asset.packedTerms["fixingPeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IP(
                uint256(asset.packedTerms["redemptionExercisePeriod"] >> 24),
                P(uint8(uint256(asset.packedTerms["redemptionExercisePeriod"] >> 16))),
                (asset.packedTerms["redemptionExercisePeriod"] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IPS(
                uint256(asset.packedTerms["cycleOfRedemption"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfRedemption"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfRedemption"] >> 8))),
                (asset.packedTerms["cycleOfRedemption"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IPS(
                uint256(asset.packedTerms["cycleOfTermination"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfTermination"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfTermination"] >> 8))),
                (asset.packedTerms["cycleOfTermination"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IPS(
                uint256(asset.packedTerms["cycleOfCoupon"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfCoupon"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfCoupon"] >> 8))),
                (asset.packedTerms["cycleOfCoupon"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            ContractReference(
                asset.packedTerms["contractReference_1_object"],
                asset.packedTerms["contractReference_1_object2"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_1_type_role"] >> 8)))
            ),
            ContractReference(
                asset.packedTerms["contractReference_2_object"],
                asset.packedTerms["contractReference_2_object2"],
                ContractReferenceType(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 16))),
                ContractReferenceRole(uint8(uint256(asset.packedTerms["contractReference_2_type_role"] >> 8)))
            )
        );
    }

    function decodeAndGetEnumValueForCERTFAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint8)
    {
        if (attributeKey == bytes32("contractType")) {
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
        } else if (attributeKey == bytes32("couponType")) {
            return uint8(uint256(asset.packedTerms["enums"] >> 200));
        } else {
            return uint8(0);
        }
    }

    function decodeAndGetAddressValueForForCERTFAttribute(Asset storage asset, bytes32 attributeKey)
        external
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

    function decodeAndGetBytes32ValueForForCERTFAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (bytes32)
    {
        return asset.packedTerms[attributeKey];
    }

    function decodeAndGetUIntValueForForCERTFAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint256)
    {
        return uint256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetIntValueForForCERTFAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (int256)
    {
        return int256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetPeriodValueForForCERTFAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (IP memory)
    {
        if (
            attributeKey == bytes32("gracePeriod")
            || attributeKey == bytes32("delinquencyPeriod")
            || attributeKey == bytes32("settlementPeriod")
            || attributeKey == bytes32("fixingPeriod")
            || attributeKey == bytes32("redemptionExercisePeriod")
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

    function decodeAndGetCycleValueForForCERTFAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (IPS memory)
    {
        if (
            attributeKey == bytes32("cycleOfRedemption")
            || attributeKey == bytes32("cycleOfTermination")
            || attributeKey == bytes32("cycleOfCoupon")
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

    function decodeAndGetContractReferenceValueForCERTFAttribute(Asset storage asset, bytes32 attributeKey)
        external
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
