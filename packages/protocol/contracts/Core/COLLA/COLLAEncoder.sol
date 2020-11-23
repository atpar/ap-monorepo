// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistryStorage.sol";


library COLLAEncoder {

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
    function encodeAndSetCOLLATerms(Asset storage asset, COLLATerms memory terms) external {
        storeInPackedTerms(
            asset,
            "enums",
            bytes32(uint256(uint8(terms.contractType))) << 248 |
            bytes32(uint256(uint8(terms.calendar))) << 240 |
            bytes32(uint256(uint8(terms.contractRole))) << 232 |
            bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
            bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
            bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208
        );

        storeInPackedTerms(asset, "marketObjectCodeOfCollateral", bytes32(terms.marketObjectCodeOfCollateral));

        storeInPackedTerms(asset, "currency", bytes32(uint256(terms.currency) << 96));
        storeInPackedTerms(asset, "settlementCurrency", bytes32(uint256(terms.settlementCurrency) << 96));
        storeInPackedTerms(asset, "collateralCurrency", bytes32(uint256(terms.collateralCurrency) << 96));

        storeInPackedTerms(asset, "statusDate", bytes32(terms.statusDate));
        storeInPackedTerms(asset, "initialExchangeDate", bytes32(terms.initialExchangeDate));
        storeInPackedTerms(asset, "maturityDate", bytes32(terms.maturityDate));
        storeInPackedTerms(asset, "capitalizationEndDate", bytes32(terms.capitalizationEndDate));
        storeInPackedTerms(asset, "cycleAnchorDateOfInterestPayment", bytes32(terms.cycleAnchorDateOfInterestPayment));

        storeInPackedTerms(asset, "notionalPrincipal", bytes32(terms.notionalPrincipal));
        storeInPackedTerms(asset, "nominalInterestRate", bytes32(terms.nominalInterestRate));
        storeInPackedTerms(asset, "accruedInterest", bytes32(terms.accruedInterest));
        storeInPackedTerms(asset, "premiumDiscountAtIED", bytes32(terms.premiumDiscountAtIED));
        storeInPackedTerms(asset, "coverageOfCollateral", bytes32(terms.coverageOfCollateral));

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
            "cycleOfInterestPayment",
            bytes32(uint256(terms.cycleOfInterestPayment.i)) << 24 |
            bytes32(uint256(terms.cycleOfInterestPayment.p)) << 16 |
            bytes32(uint256(terms.cycleOfInterestPayment.s)) << 8 |
            bytes32(uint256((terms.cycleOfInterestPayment.isSet) ? 1 : 0))
        );
    }

    /**
     * @dev Decode and loads COLLATerms
     */
    function decodeAndGetCOLLATerms(Asset storage asset) external view returns (COLLATerms memory) {
        return COLLATerms(
            ContractType(uint8(uint256(asset.packedTerms["enums"] >> 248))),
            Calendar(uint8(uint256(asset.packedTerms["enums"] >> 240))),
            ContractRole(uint8(uint256(asset.packedTerms["enums"] >> 232))),
            DayCountConvention(uint8(uint256(asset.packedTerms["enums"] >> 224))),
            BusinessDayConvention(uint8(uint256(asset.packedTerms["enums"] >> 216))),
            EndOfMonthConvention(uint8(uint256(asset.packedTerms["enums"] >> 208))),

            asset.packedTerms["marketObjectCodeOfCollateral"],

            address(uint160(uint256(asset.packedTerms["currency"]) >> 96)),
            address(uint160(uint256(asset.packedTerms["settlementCurrency"]) >> 96)),
            address(uint160(uint256(asset.packedTerms["collateralCurrency"]) >> 96)),

            uint256(asset.packedTerms["statusDate"]),
            uint256(asset.packedTerms["initialExchangeDate"]),
            uint256(asset.packedTerms["maturityDate"]),
            uint256(asset.packedTerms["capitalizationEndDate"]),
            uint256(asset.packedTerms["cycleAnchorDateOfInterestPayment"]),

            int256(asset.packedTerms["notionalPrincipal"]),
            int256(asset.packedTerms["nominalInterestRate"]),
            int256(asset.packedTerms["accruedInterest"]),
            int256(asset.packedTerms["premiumDiscountAtIED"]),
            int256(asset.packedTerms["coverageOfCollateral"]),
            
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
                uint256(asset.packedTerms["cycleOfInterestPayment"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfInterestPayment"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfInterestPayment"] >> 8))),
                (asset.packedTerms["cycleOfInterestPayment"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            )
        );
    }

    function decodeAndGetEnumValueForCOLLAAttribute(Asset storage asset, bytes32 attributeKey)
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
        } else {
            return uint8(0);
        }
    }

    function decodeAndGetAddressValueForForCOLLAAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (address)
    {
        if (attributeKey == bytes32("currency")) {
            return address(uint160(uint256(asset.packedTerms["currency"]) >> 96));
        } else if (attributeKey == bytes32("settlementCurrency")) {
            return address(uint160(uint256(asset.packedTerms["settlementCurrency"]) >> 96));
        } else if (attributeKey == bytes32("collateralCurrency")) {
            return address(uint160(uint256(asset.packedTerms["collateralCurrency"]) >> 96));
        } else {
            return address(0);
        }   
    }

    function decodeAndGetBytes32ValueForForCOLLAAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (bytes32)
    {
        return asset.packedTerms[attributeKey];
    }

    function decodeAndGetUIntValueForForCOLLAAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (uint256)
    {
        return uint256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetIntValueForForCOLLAAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (int256)
    {
        return int256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetPeriodValueForForCOLLAAttribute(Asset storage asset, bytes32 attributeKey)
        external
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

    function decodeAndGetCycleValueForForCOLLAAttribute(Asset storage asset, bytes32 attributeKey)
        external
        view
        returns (IPS memory)
    {
        if (attributeKey == bytes32("cycleOfInterestPayment")) {
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

    function decodeAndGetContractReferenceValueForCOLLAAttribute(Asset storage /* asset */, bytes32 /* attributeKey */)
        external
        pure
        returns (ContractReference memory)
    {
        return ContractReference(
            bytes32(0),
            bytes32(0),
            ContractReferenceType(0),
            ContractReferenceRole(0)
        );
    }
}