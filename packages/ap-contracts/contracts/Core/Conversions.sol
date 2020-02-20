pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./SharedTypes.sol";


contract Conversions is SharedTypes {

    function deriveLifecycleTermsFromCustomTermsAndTemplateTerms(
        TemplateTerms memory templateTerms,
        CustomTerms memory terms
    )
        public
        pure
        returns (LifecycleTerms memory)
    {
        return LifecycleTerms(
            isOverwritten(terms.overwrittenAttributesMap, 0) ? Calendar(uint8(uint256(terms.packedAttributeValues[0] >> 248))) : templateTerms.calendar,
            isOverwritten(terms.overwrittenAttributesMap, 1) ? ContractRole(uint8(uint256(terms.packedAttributeValues[0] >> 240))) : templateTerms.contractRole,
            isOverwritten(terms.overwrittenAttributesMap, 2) ? DayCountConvention(uint8(uint256(terms.packedAttributeValues[0] >> 232))) : templateTerms.dayCountConvention,
            isOverwritten(terms.overwrittenAttributesMap, 3) ? BusinessDayConvention(uint8(uint256(terms.packedAttributeValues[0] >> 224))) : templateTerms.businessDayConvention,
            isOverwritten(terms.overwrittenAttributesMap, 4) ? EndOfMonthConvention(uint8(uint256(terms.packedAttributeValues[0] >> 216))) : templateTerms.endOfMonthConvention,
            isOverwritten(terms.overwrittenAttributesMap, 5) ? ScalingEffect(uint8(uint256(terms.packedAttributeValues[0] >> 208))) : templateTerms.scalingEffect,
            isOverwritten(terms.overwrittenAttributesMap, 6) ? PenaltyType(uint8(uint256(terms.packedAttributeValues[0] >> 200))) : templateTerms.penaltyType,
            isOverwritten(terms.overwrittenAttributesMap, 7) ? FeeBasis(uint8(uint256(terms.packedAttributeValues[0] >> 192))) : templateTerms.feeBasis,
            isOverwritten(terms.overwrittenAttributesMap, 8) ? ContractPerformance(uint8(uint256(terms.packedAttributeValues[0] >> 184))) : templateTerms.creditEventTypeCovered,

            isOverwritten(terms.overwrittenAttributesMap, 9) ? address(uint160(uint256(terms.packedAttributeValues[1]) >> 96)) : templateTerms.currency,
            isOverwritten(terms.overwrittenAttributesMap, 10) ? address(uint160(uint256(terms.packedAttributeValues[2]) >> 96)) : templateTerms.settlementCurrency,

            isOverwritten(terms.overwrittenAttributesMap, 11) ? terms.packedAttributeValues[3] : templateTerms.marketObjectCodeRateReset,

            isOverwritten(terms.overwrittenAttributesMap, 12) ? uint256(terms.packedAttributeValues[4]) : applyAnchorDateToOffset(terms.anchorDate, templateTerms.statusDateOffset),
            isOverwritten(terms.overwrittenAttributesMap, 13) ? uint256(terms.packedAttributeValues[5]) : applyAnchorDateToOffset(terms.anchorDate, templateTerms.maturityDateOffset),

            isOverwritten(terms.overwrittenAttributesMap, 14) ? int256(terms.packedAttributeValues[6]) : templateTerms.notionalPrincipal,
            isOverwritten(terms.overwrittenAttributesMap, 15) ? int256(terms.packedAttributeValues[7]) : templateTerms.nominalInterestRate,
            isOverwritten(terms.overwrittenAttributesMap, 16) ? int256(terms.packedAttributeValues[8]) : templateTerms.feeAccrued,
            isOverwritten(terms.overwrittenAttributesMap, 17) ? int256(terms.packedAttributeValues[9]) : templateTerms.accruedInterest,
            isOverwritten(terms.overwrittenAttributesMap, 18) ? int256(terms.packedAttributeValues[10]) : templateTerms.rateMultiplier,
            isOverwritten(terms.overwrittenAttributesMap, 19) ? int256(terms.packedAttributeValues[11]) : templateTerms.rateSpread,
            isOverwritten(terms.overwrittenAttributesMap, 20) ? int256(terms.packedAttributeValues[12]) : templateTerms.feeRate,
            isOverwritten(terms.overwrittenAttributesMap, 21) ? int256(terms.packedAttributeValues[13]) : templateTerms.nextResetRate,
            isOverwritten(terms.overwrittenAttributesMap, 22) ? int256(terms.packedAttributeValues[14]) : templateTerms.penaltyRate,
            isOverwritten(terms.overwrittenAttributesMap, 23) ? int256(terms.packedAttributeValues[15]) : templateTerms.premiumDiscountAtIED,
            isOverwritten(terms.overwrittenAttributesMap, 24) ? int256(terms.packedAttributeValues[16]) : templateTerms.priceAtPurchaseDate,
            isOverwritten(terms.overwrittenAttributesMap, 25) ? int256(terms.packedAttributeValues[17]) : templateTerms.nextPrincipalRedemptionPayment,
            isOverwritten(terms.overwrittenAttributesMap, 26) ? int256(terms.packedAttributeValues[18]) : templateTerms.coverageOfCreditEnhancement,
            isOverwritten(terms.overwrittenAttributesMap, 27) ? int256(terms.packedAttributeValues[19]) : templateTerms.lifeCap,
            isOverwritten(terms.overwrittenAttributesMap, 28) ? int256(terms.packedAttributeValues[20]) : templateTerms.lifeFloor,
            isOverwritten(terms.overwrittenAttributesMap, 29) ? int256(terms.packedAttributeValues[21]) : templateTerms.periodCap,
            isOverwritten(terms.overwrittenAttributesMap, 30) ? int256(terms.packedAttributeValues[22]) : templateTerms.periodFloor,

            isOverwritten(terms.overwrittenAttributesMap, 31)
                ?
                    IP(
                        uint256(terms.packedAttributeValues[23] >> 24),
                        P(uint8(uint256(terms.packedAttributeValues[23] >> 16))),
                        (terms.packedAttributeValues[23] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
                    )
                : templateTerms.gracePeriod,
            isOverwritten(terms.overwrittenAttributesMap, 32)
                ?
                    IP(
                        uint256(terms.packedAttributeValues[24] >> 24),
                        P(uint8(uint256(terms.packedAttributeValues[24] >> 16))),
                        (terms.packedAttributeValues[24] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
                    )
                : templateTerms.delinquencyPeriod,

            terms.contractReference_1, // mandatory custom terms attribute
            terms.contractReference_2 // mandatory custom terms attribute
        );
    }

    function encodeCollateralAsObject(address collateralToken, uint256 collateralAmount)
        public
        pure
        returns (bytes32)
    {
        return bytes32(uint256(uint160(collateralToken))) << 96 | bytes32(uint256(uint96(collateralAmount)));
    }

    function decodeCollateralObject(bytes32 object)
        public
        pure
        returns (address, uint256)
    {
        return (
            address(uint160(uint256(object >> 96))),
            uint256(uint96(uint256(object)))
        );
    }

    function applyAnchorDateToOffset(uint256 anchorDate, uint256 offset)
        internal
        pure
        returns (uint256)
    {
        // interpret offset == 0 as a not set date value, only shift by anchorDate if offset > 0
        if (offset == 0) return 0;
        // offset == ZERO_OFFSET indicating that offset is set and equal to anchorDate
        if (offset == ZERO_OFFSET) return anchorDate;
        // if offset != ZERO_OFFSET, shift offset by anchorDate
        return anchorDate + offset;
    }

    function isOverwritten (uint256 overwrittenAttributesMap, uint256 attributeIndex) internal pure returns (bool) {
        return (overwrittenAttributesMap >> attributeIndex & 1) == 1;
    }

    // function decodeAttributeValueAsBytes32 (bytes memory packedAttributeValues, uint8 position) public pure returns (bytes32) {
    //     bytes32 value;
    //     for (uint256 i = 0; i < 32; i++) {
    //         value |= bytes32(packedAttributeValues[position * (32 * 8) + i] & 0xFF) >> (i * 8);
    //     }
    //     return value;
    // }

    // function decodeAttributeValueAsInt256 (bytes memory packedAttributeValues, uint8 position) internal pure returns (int256) {
    //     return int256(decodeAttributeValueAsBytes32(packedAttributeValues, position));
    // }

    // function decodeAttributeValueAsUint256 (bytes memory packedAttributeValues, uint8 position) internal pure returns (uint256) {
    //     return uint256(decodeAttributeValueAsBytes32(packedAttributeValues, position));
    // }

    // function decodeAttributeValueAsUint8 (bytes memory packedAttributeValues, uint8 position) internal pure returns (uint8) {
    //     return uint8(decodeAttributeValueAsUint8(packedAttributeValues, position));
    // }

    // function decodeAttributeValueAsAddress (bytes memory packedAttributeValues, uint8 position) internal pure returns (address) {
    //     return address(uint160(decodeAttributeValueAsUint256(packedAttributeValues, position) >> 96));
    // }

    // function getPositionInPackedAttributeValuesForAttributeIndex(
    //     uint256 overwrittenAttributesMap,
    //     uint256 attributeIndex
    // )
    //     public
    //     pure
    //     returns (uint256)
    // {
    //     uint8 position = 0;
    //     for (uint256 i = 0; i < attributeIndex; i++) {
    //         if (isOverwritten(overwrittenAttributesMap, i)) {
    //             position++;
    //         }
    //     }
    //     return position;
    // }

    // function deriveLifecycleTermsFromCustomTermsAndTemplateTerms(
    //     TemplateTerms memory templateTerms,
    //     CustomTerms memory terms
    // )
    //     public
    //     pure
    //     returns (LifecycleTerms memory)
    // {
    //     return LifecycleTerms(
    //         isOverwritten(terms.overwrittenAttributesMap, 0) ? Calendar(decodeAttributeValueAsUint8(terms.packedAttributeValues, 0)) : templateTerms.calendar,
    //         isOverwritten(terms.overwrittenAttributesMap, 1) ? ContractRole(decodeAttributeValueAsUint8(terms.packedAttributeValues, 1)) : templateTerms.contractRole,
    //         isOverwritten(terms.overwrittenAttributesMap, 2) ? DayCountConvention(decodeAttributeValueAsUint8(terms.packedAttributeValues, 2)) : templateTerms.dayCountConvention,
    //         isOverwritten(terms.overwrittenAttributesMap, 3) ? BusinessDayConvention(decodeAttributeValueAsUint8(terms.packedAttributeValues, 3)) : templateTerms.businessDayConvention,
    //         isOverwritten(terms.overwrittenAttributesMap, 4) ? EndOfMonthConvention(decodeAttributeValueAsUint8(terms.packedAttributeValues, 4)) : templateTerms.endOfMonthConvention,
    //         isOverwritten(terms.overwrittenAttributesMap, 5) ? ScalingEffect(decodeAttributeValueAsUint8(terms.packedAttributeValues, 5)) : templateTerms.scalingEffect,
    //         isOverwritten(terms.overwrittenAttributesMap, 6) ? PenaltyType(decodeAttributeValueAsUint8(terms.packedAttributeValues, 6)) : templateTerms.penaltyType,
    //         isOverwritten(terms.overwrittenAttributesMap, 7) ? FeeBasis(decodeAttributeValueAsUint8(terms.packedAttributeValues, 7)) : templateTerms.feeBasis,
    //         isOverwritten(terms.overwrittenAttributesMap, 8) ? ContractPerformance(decodeAttributeValueAsUint8(terms.packedAttributeValues, 8)) : templateTerms.creditEventTypeCovered,

    //         terms.contractReference_1, // mandatory custom terms attribute
    //         terms.contractReference_2, // mandatory custom terms attribute

    //         isOverwritten(terms.overwrittenAttributesMap, 11) ? decodeAttributeValueAsAddress(terms.packedAttributeValues, 11) : templateTerms.currency,
    //         isOverwritten(terms.overwrittenAttributesMap, 12) ? decodeAttributeValueAsAddress(terms.packedAttributeValues, 12) : templateTerms.settlementCurrency,

    //         isOverwritten(terms.overwrittenAttributesMap, 13) ? decodeAttributeValueAsBytes32(terms.packedAttributeValues, 13) : templateTerms.marketObjectCodeRateReset,

    //         isOverwritten(terms.overwrittenAttributesMap, 14)
    //             ? decodeAttributeValueAsUint256(terms.packedAttributeValues, 14)
    //             : applyAnchorDateToOffset(terms.anchorDate, templateTerms.statusDateOffset),
    //         isOverwritten(terms.overwrittenAttributesMap, 15)
    //             ? decodeAttributeValueAsUint256(terms.packedAttributeValues, 15)
    //             : applyAnchorDateToOffset(terms.anchorDate, templateTerms.maturityDateOffset),

    //         isOverwritten(terms.overwrittenAttributesMap, 16) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 16) : templateTerms.notionalPrincipal,
    //         isOverwritten(terms.overwrittenAttributesMap, 17) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 17) : templateTerms.nominalInterestRate,
    //         isOverwritten(terms.overwrittenAttributesMap, 18) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 18) : templateTerms.feeAccrued,
    //         isOverwritten(terms.overwrittenAttributesMap, 19) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 19) : templateTerms.accruedInterest,
    //         isOverwritten(terms.overwrittenAttributesMap, 20) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 20) : templateTerms.rateMultiplier,
    //         isOverwritten(terms.overwrittenAttributesMap, 21) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 21) : templateTerms.rateSpread,
    //         isOverwritten(terms.overwrittenAttributesMap, 22) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 22) : templateTerms.feeRate,
    //         isOverwritten(terms.overwrittenAttributesMap, 23) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 23) : templateTerms.nextResetRate,
    //         isOverwritten(terms.overwrittenAttributesMap, 24) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 24) : templateTerms.penaltyRate,
    //         isOverwritten(terms.overwrittenAttributesMap, 25) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 25) : templateTerms.premiumDiscountAtIED,
    //         isOverwritten(terms.overwrittenAttributesMap, 26) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 26) : templateTerms.priceAtPurchaseDate,
    //         isOverwritten(terms.overwrittenAttributesMap, 27) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 27) : templateTerms.nextPrincipalRedemptionPayment,
    //         isOverwritten(terms.overwrittenAttributesMap, 28) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 28) : templateTerms.coverageOfCreditEnhancement,

    //         isOverwritten(terms.overwrittenAttributesMap, 29)
    //             ?
    //                 IP(
    //                     uint256(decodeAttributeValueAsBytes32(terms.packedAttributeValues, 29) >> 24),
    //                     P(uint8(uint256(decodeAttributeValueAsBytes32(terms.packedAttributeValues, 29) >> 16))),
    //                     (decodeAttributeValueAsBytes32(terms.packedAttributeValues, 29) >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
    //                 )
    //             : templateTerms.gracePeriod,
    //         isOverwritten(terms.overwrittenAttributesMap, 30)
    //             ?
    //                 IP(
    //                     uint256(decodeAttributeValueAsBytes32(terms.packedAttributeValues, 30) >> 24),
    //                     P(uint8(uint256(decodeAttributeValueAsBytes32(terms.packedAttributeValues, 30) >> 16))),
    //                     (decodeAttributeValueAsBytes32(terms.packedAttributeValues, 30) >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
    //                 )
    //             : templateTerms.delinquencyPeriod,

    //         isOverwritten(terms.overwrittenAttributesMap, 31) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 31) : templateTerms.lifeCap,
    //         isOverwritten(terms.overwrittenAttributesMap, 32) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 32) : templateTerms.lifeFloor,
    //         isOverwritten(terms.overwrittenAttributesMap, 33) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 33) : templateTerms.periodCap,
    //         isOverwritten(terms.overwrittenAttributesMap, 34) ? decodeAttributeValueAsInt256(terms.packedAttributeValues, 34) : templateTerms.periodFloor
    //     );
    // }
}
