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
            isOverwritten(terms.overwrittenAttributesMap, 0) ? terms.overwrittenTerms.calendar : templateTerms.calendar,
            isOverwritten(terms.overwrittenAttributesMap, 1) ? terms.overwrittenTerms.contractRole : templateTerms.contractRole,
            isOverwritten(terms.overwrittenAttributesMap, 2) ? terms.overwrittenTerms.dayCountConvention : templateTerms.dayCountConvention,
            isOverwritten(terms.overwrittenAttributesMap, 3) ? terms.overwrittenTerms.businessDayConvention : templateTerms.businessDayConvention,
            isOverwritten(terms.overwrittenAttributesMap, 4) ? terms.overwrittenTerms.endOfMonthConvention : templateTerms.endOfMonthConvention,
            isOverwritten(terms.overwrittenAttributesMap, 5) ? terms.overwrittenTerms.scalingEffect : templateTerms.scalingEffect,
            isOverwritten(terms.overwrittenAttributesMap, 6) ? terms.overwrittenTerms.penaltyType : templateTerms.penaltyType,
            isOverwritten(terms.overwrittenAttributesMap, 7) ? terms.overwrittenTerms.feeBasis : templateTerms.feeBasis,
            isOverwritten(terms.overwrittenAttributesMap, 8) ? terms.overwrittenTerms.creditEventTypeCovered : templateTerms.creditEventTypeCovered,

            isOverwritten(terms.overwrittenAttributesMap, 9) ? terms.overwrittenTerms.currency : templateTerms.currency,
            isOverwritten(terms.overwrittenAttributesMap, 10) ? terms.overwrittenTerms.settlementCurrency : templateTerms.settlementCurrency,

            isOverwritten(terms.overwrittenAttributesMap, 11) ? terms.overwrittenTerms.marketObjectCodeRateReset : templateTerms.marketObjectCodeRateReset,

            isOverwritten(terms.overwrittenAttributesMap, 12) ? terms.overwrittenTerms.statusDate : applyAnchorDateToOffset(terms.anchorDate, templateTerms.statusDateOffset),
            isOverwritten(terms.overwrittenAttributesMap, 13) ? terms.overwrittenTerms.maturityDate : applyAnchorDateToOffset(terms.anchorDate, templateTerms.maturityDateOffset),

            isOverwritten(terms.overwrittenAttributesMap, 14) ? terms.overwrittenTerms.notionalPrincipal : templateTerms.notionalPrincipal,
            isOverwritten(terms.overwrittenAttributesMap, 15) ? terms.overwrittenTerms.nominalInterestRate : templateTerms.nominalInterestRate,
            isOverwritten(terms.overwrittenAttributesMap, 16) ? terms.overwrittenTerms.feeAccrued : templateTerms.feeAccrued,
            isOverwritten(terms.overwrittenAttributesMap, 17) ? terms.overwrittenTerms.accruedInterest : templateTerms.accruedInterest,
            isOverwritten(terms.overwrittenAttributesMap, 18) ? terms.overwrittenTerms.rateMultiplier : templateTerms.rateMultiplier,
            isOverwritten(terms.overwrittenAttributesMap, 19) ? terms.overwrittenTerms.rateSpread : templateTerms.rateSpread,
            isOverwritten(terms.overwrittenAttributesMap, 20) ? terms.overwrittenTerms.feeRate : templateTerms.feeRate,
            isOverwritten(terms.overwrittenAttributesMap, 21) ? terms.overwrittenTerms.nextResetRate : templateTerms.nextResetRate,
            isOverwritten(terms.overwrittenAttributesMap, 22) ? terms.overwrittenTerms.penaltyRate : templateTerms.penaltyRate,
            isOverwritten(terms.overwrittenAttributesMap, 23) ? terms.overwrittenTerms.premiumDiscountAtIED : templateTerms.premiumDiscountAtIED,
            isOverwritten(terms.overwrittenAttributesMap, 24) ? terms.overwrittenTerms.priceAtPurchaseDate : templateTerms.priceAtPurchaseDate,
            isOverwritten(terms.overwrittenAttributesMap, 25) ? terms.overwrittenTerms.nextPrincipalRedemptionPayment : templateTerms.nextPrincipalRedemptionPayment,
            isOverwritten(terms.overwrittenAttributesMap, 26) ? terms.overwrittenTerms.coverageOfCreditEnhancement : templateTerms.coverageOfCreditEnhancement,
            isOverwritten(terms.overwrittenAttributesMap, 27) ? terms.overwrittenTerms.lifeCap : templateTerms.lifeCap,
            isOverwritten(terms.overwrittenAttributesMap, 28) ? terms.overwrittenTerms.lifeFloor : templateTerms.lifeFloor,
            isOverwritten(terms.overwrittenAttributesMap, 29) ? terms.overwrittenTerms.periodCap : templateTerms.periodCap,
            isOverwritten(terms.overwrittenAttributesMap, 30) ? terms.overwrittenTerms.periodFloor : templateTerms.periodFloor,

            isOverwritten(terms.overwrittenAttributesMap, 31) ? terms.overwrittenTerms.gracePeriod : templateTerms.gracePeriod,
            isOverwritten(terms.overwrittenAttributesMap, 32) ? terms.overwrittenTerms.delinquencyPeriod : templateTerms.delinquencyPeriod,

            terms.overwrittenTerms.contractReference_1, // mandatory custom terms attribute
            terms.overwrittenTerms.contractReference_2 // mandatory custom terms attribute
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
}
