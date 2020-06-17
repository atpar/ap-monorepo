pragma solidity ^0.6.10;

import "../Base/SharedTypes.sol";
import "../Base/AssetRegistry/BaseRegistryStorage.sol";


library PAMEncoder {

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
    function encodeAndSetPAMTerms(Asset storage asset, PAMTerms memory terms) internal {
        storeInPackedTerms(
            asset,
            "enums",
            bytes32(uint256(uint8(terms.contractType))) << 248 |
            bytes32(uint256(uint8(terms.calendar))) << 240 |
            bytes32(uint256(uint8(terms.contractRole))) << 232 |
            bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
            bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
            bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
            bytes32(uint256(uint8(terms.scalingEffect))) << 200 |
            bytes32(uint256(uint8(terms.penaltyType))) << 192 |
            bytes32(uint256(uint8(terms.feeBasis))) << 184
        );

        storeInPackedTerms(asset, "currency", bytes32(uint256(terms.currency) << 96));
        storeInPackedTerms(asset, "settlementCurrency", bytes32(uint256(terms.settlementCurrency) << 96));

        storeInPackedTerms(asset, "marketObjectCodeRateReset", bytes32(terms.marketObjectCodeRateReset));

        storeInPackedTerms(asset, "contractDealDate", bytes32(terms.contractDealDate));
        storeInPackedTerms(asset, "statusDate", bytes32(terms.statusDate));
        storeInPackedTerms(asset, "initialExchangeDate", bytes32(terms.initialExchangeDate));
        storeInPackedTerms(asset, "maturityDate", bytes32(terms.maturityDate));
        storeInPackedTerms(asset, "purchaseDate", bytes32(terms.purchaseDate));
        storeInPackedTerms(asset, "capitalizationEndDate", bytes32(terms.capitalizationEndDate));
        storeInPackedTerms(asset, "cycleAnchorDateOfInterestPayment", bytes32(terms.cycleAnchorDateOfInterestPayment));
        storeInPackedTerms(asset, "cycleAnchorDateOfRateReset", bytes32(terms.cycleAnchorDateOfRateReset));
        storeInPackedTerms(asset, "cycleAnchorDateOfScalingIndex", bytes32(terms.cycleAnchorDateOfScalingIndex));
        storeInPackedTerms(asset, "cycleAnchorDateOfFee", bytes32(terms.cycleAnchorDateOfFee));

        storeInPackedTerms(asset, "notionalPrincipal", bytes32(terms.notionalPrincipal));
        storeInPackedTerms(asset, "nominalInterestRate", bytes32(terms.nominalInterestRate));
        storeInPackedTerms(asset, "accruedInterest", bytes32(terms.accruedInterest));
        storeInPackedTerms(asset, "rateMultiplier", bytes32(terms.rateMultiplier));
        storeInPackedTerms(asset, "rateSpread", bytes32(terms.rateSpread));
        storeInPackedTerms(asset, "nextResetRate", bytes32(terms.nextResetRate));
        storeInPackedTerms(asset, "feeRate", bytes32(terms.feeRate));
        storeInPackedTerms(asset, "feeAccrued", bytes32(terms.feeAccrued));
        storeInPackedTerms(asset, "penaltyRate", bytes32(terms.penaltyRate));
        storeInPackedTerms(asset, "delinquencyRate", bytes32(terms.delinquencyRate));
        storeInPackedTerms(asset, "premiumDiscountAtIED", bytes32(terms.premiumDiscountAtIED));
        storeInPackedTerms(asset, "priceAtPurchaseDate", bytes32(terms.priceAtPurchaseDate));
        storeInPackedTerms(asset, "lifeCap", bytes32(terms.lifeCap));
        storeInPackedTerms(asset, "lifeFloor", bytes32(terms.lifeFloor));
        storeInPackedTerms(asset, "periodCap", bytes32(terms.periodCap));
        storeInPackedTerms(asset, "periodFloor", bytes32(terms.periodFloor));

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
        storeInPackedTerms(
            asset,
            "cycleOfRateReset",
            bytes32(uint256(terms.cycleOfRateReset.i)) << 24 |
            bytes32(uint256(terms.cycleOfRateReset.p)) << 16 |
            bytes32(uint256(terms.cycleOfRateReset.s)) << 8 |
            bytes32(uint256((terms.cycleOfRateReset.isSet) ? 1 : 0))
        );
        storeInPackedTerms(
            asset,
            "cycleOfScalingIndex",
            bytes32(uint256(terms.cycleOfScalingIndex.i)) << 24 |
            bytes32(uint256(terms.cycleOfScalingIndex.p)) << 16 |
            bytes32(uint256(terms.cycleOfScalingIndex.s)) << 8 |
            bytes32(uint256((terms.cycleOfScalingIndex.isSet) ? 1 : 0))
        );
        storeInPackedTerms(
            asset,
            "cycleOfFee",
            bytes32(uint256(terms.cycleOfFee.i)) << 24 |
            bytes32(uint256(terms.cycleOfFee.p)) << 16 |
            bytes32(uint256(terms.cycleOfFee.s)) << 8 |
            bytes32(uint256((terms.cycleOfFee.isSet) ? 1 : 0))
        );
    }

    /**
     * @dev Decode and loads PAMTerms
     */
    function decodeAndGetPAMTerms(Asset storage asset) internal view returns (PAMTerms memory) {
        return PAMTerms(
            ContractType(uint8(uint256(asset.packedTerms["enums"] >> 248))),
            Calendar(uint8(uint256(asset.packedTerms["enums"] >> 240))),
            ContractRole(uint8(uint256(asset.packedTerms["enums"] >> 232))),
            DayCountConvention(uint8(uint256(asset.packedTerms["enums"] >> 224))),
            BusinessDayConvention(uint8(uint256(asset.packedTerms["enums"] >> 216))),
            EndOfMonthConvention(uint8(uint256(asset.packedTerms["enums"] >> 208))),
            ScalingEffect(uint8(uint256(asset.packedTerms["enums"] >> 200))),
            PenaltyType(uint8(uint256(asset.packedTerms["enums"] >> 192))),
            FeeBasis(uint8(uint256(asset.packedTerms["enums"] >> 184))),

            address(uint160(uint256(asset.packedTerms["currency"]) >> 96)),
            address(uint160(uint256(asset.packedTerms["settlementCurrency"]) >> 96)),

            asset.packedTerms["marketObjectCodeRateReset"],

            uint256(asset.packedTerms["contractDealDate"]),
            uint256(asset.packedTerms["statusDate"]),
            uint256(asset.packedTerms["initialExchangeDate"]),
            uint256(asset.packedTerms["maturityDate"]),
            uint256(asset.packedTerms["purchaseDate"]),
            uint256(asset.packedTerms["capitalizationEndDate"]),
            uint256(asset.packedTerms["cycleAnchorDateOfInterestPayment"]),
            uint256(asset.packedTerms["cycleAnchorDateOfRateReset"]),
            uint256(asset.packedTerms["cycleAnchorDateOfScalingIndex"]),
            uint256(asset.packedTerms["cycleAnchorDateOfFee"]),

            int256(asset.packedTerms["notionalPrincipal"]),
            int256(asset.packedTerms["nominalInterestRate"]),
            int256(asset.packedTerms["accruedInterest"]),
            int256(asset.packedTerms["rateMultiplier"]),
            int256(asset.packedTerms["rateSpread"]),
            int256(asset.packedTerms["nextResetRate"]),
            int256(asset.packedTerms["feeRate"]),
            int256(asset.packedTerms["feeAccrued"]),
            int256(asset.packedTerms["penaltyRate"]),
            int256(asset.packedTerms["delinquencyRate"]),
            int256(asset.packedTerms["premiumDiscountAtIED"]),
            int256(asset.packedTerms["priceAtPurchaseDate"]),
            int256(asset.packedTerms["lifeCap"]),
            int256(asset.packedTerms["lifeFloor"]),
            int256(asset.packedTerms["periodCap"]),
            int256(asset.packedTerms["periodFloor"]),
            
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
            ),
            IPS(
                uint256(asset.packedTerms["cycleOfRateReset"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfRateReset"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfRateReset"] >> 8))),
                (asset.packedTerms["cycleOfRateReset"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IPS(
                uint256(asset.packedTerms["cycleOfScalingIndex"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfScalingIndex"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfScalingIndex"] >> 8))),
                (asset.packedTerms["cycleOfScalingIndex"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            ),
            IPS(
                uint256(asset.packedTerms["cycleOfFee"] >> 24),
                P(uint8(uint256(asset.packedTerms["cycleOfFee"] >> 16))),
                S(uint8(uint256(asset.packedTerms["cycleOfFee"] >> 8))),
                (asset.packedTerms["cycleOfFee"] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
            )
        );
    }

    function decodeAndGetEnumValueForPAMAttribute(Asset storage asset, bytes32 attributeKey)
        internal
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

    function decodeAndGetAddressValueForForPAMAttribute(Asset storage asset, bytes32 attributeKey)
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

    function decodeAndGetBytes32ValueForForPAMAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (bytes32)
    {
        return asset.packedTerms[attributeKey];
    }

    function decodeAndGetUIntValueForForPAMAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (uint256)
    {
        return uint256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetIntValueForForPAMAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (int256)
    {
        return int256(asset.packedTerms[attributeKey]);
    }

    function decodeAndGetPeriodValueForForPAMAttribute(Asset storage asset, bytes32 attributeKey)
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

    function decodeAndGetCycleValueForForPAMAttribute(Asset storage asset, bytes32 attributeKey)
        internal
        view
        returns (IPS memory)
    {
        if (
            attributeKey == bytes32("cycleOfInterestPayment")
            || attributeKey == bytes32("cycleOfRateReset")
            || attributeKey == bytes32("cycleOfScalingIndex")
            || attributeKey == bytes32("cycleOfFee")
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

    function decodeAndGetContractReferenceValueForPAMAttribute(Asset storage /* asset */, bytes32 /* attributeKey */)
        internal
        pure
        returns (ContractReference memory)
    {
        return ContractReference(
            bytes32(0),
            ContractReferenceType(0),
            ContractReferenceRole(0)
        );
    }
}