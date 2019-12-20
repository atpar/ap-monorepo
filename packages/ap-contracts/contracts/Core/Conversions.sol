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

    function deriveLifecycleTerms(ProductTerms memory productTerms, CustomTerms memory customTerms)
        internal
        pure
        returns (LifecycleTerms memory)
    {
        return LifecycleTerms(
            productTerms.calendar,
            productTerms.contractRole,
            productTerms.dayCountConvention,
            productTerms.businessDayConvention,
            productTerms.endOfMonthConvention,
            productTerms.scalingEffect,
            productTerms.penaltyType,
            productTerms.feeBasis,
            productTerms.creditEventTypeCovered,

            customTerms.contractReference_1,
            customTerms.contractReference_2,

            productTerms.currency,
            productTerms.settlementCurrency,

            productTerms.marketObjectCodeRateReset,

            productTerms.statusDateOffset + customTerms.anchorDate,
            productTerms.maturityDateOffset + customTerms.anchorDate,

            customTerms.notionalPrincipal,
            customTerms.nominalInterestRate,
            productTerms.feeAccrued,
            productTerms.accruedInterest,
            productTerms.rateMultiplier,
            customTerms.rateSpread,
            productTerms.feeRate,
            productTerms.nextResetRate,
            productTerms.penaltyRate,
            customTerms.premiumDiscountAtIED,
            productTerms.priceAtPurchaseDate,
            productTerms.nextPrincipalRedemptionPayment,
            customTerms.coverageOfCreditEnhancement,

            productTerms.gracePeriod,
            productTerms.delinquencyPeriod,

            customTerms.lifeCap,
            customTerms.lifeFloor,
            productTerms.periodCap,
            productTerms.periodFloor
        );
    }
}