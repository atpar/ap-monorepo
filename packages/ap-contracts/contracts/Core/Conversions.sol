pragma solidity ^0.5.2;

import "./SharedTypes.sol";


contract Conversions is SharedTypes {

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

    function deriveLifecycleTerms(TemplateTerms memory templateTerms, CustomTerms memory customTerms)
        internal
        pure
        returns (LifecycleTerms memory)
    {
        return LifecycleTerms(
            templateTerms.calendar,
            templateTerms.contractRole,
            templateTerms.dayCountConvention,
            templateTerms.businessDayConvention,
            templateTerms.endOfMonthConvention,
            templateTerms.scalingEffect,
            templateTerms.penaltyType,
            templateTerms.feeBasis,
            templateTerms.creditEventTypeCovered,

            customTerms.contractReference_1,
            customTerms.contractReference_2,

            templateTerms.currency,
            templateTerms.settlementCurrency,

            templateTerms.marketObjectCodeRateReset,

            applyAnchorDateToOffset(customTerms.anchorDate, templateTerms.statusDateOffset),
            applyAnchorDateToOffset(customTerms.anchorDate, templateTerms.maturityDateOffset),

            customTerms.notionalPrincipal,
            customTerms.nominalInterestRate,
            templateTerms.feeAccrued,
            templateTerms.accruedInterest,
            templateTerms.rateMultiplier,
            customTerms.rateSpread,
            templateTerms.feeRate,
            templateTerms.nextResetRate,
            templateTerms.penaltyRate,
            customTerms.premiumDiscountAtIED,
            templateTerms.priceAtPurchaseDate,
            templateTerms.nextPrincipalRedemptionPayment,
            customTerms.coverageOfCreditEnhancement,

            templateTerms.gracePeriod,
            templateTerms.delinquencyPeriod,

            customTerms.lifeCap,
            customTerms.lifeFloor,
            templateTerms.periodCap,
            templateTerms.periodFloor
        );
    }
}
