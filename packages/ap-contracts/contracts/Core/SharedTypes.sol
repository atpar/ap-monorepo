pragma solidity ^0.5.2;

import "actus-solidity/contracts/Core/ACTUSTypes.sol";


contract SharedTypes is ACTUSTypes {

    uint8 constant NON_CYCLIC_INDEX = ~uint8(0);

    struct TemplateSchedule {
        mapping(uint256 => bytes32) templateSchedule;
        uint256 length;
    }

    struct AssetOwnership {
        address creatorObligor;
        address creatorBeneficiary;
        address counterpartyObligor;
        address counterpartyBeneficiary;
    }

    struct TemplateSchedules {
        bytes32[MAX_EVENT_SCHEDULE_SIZE] nonCyclicSchedule;
        bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicIPSchedule;
        bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicPRSchedule;
        bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicRRSchedule;
        bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicPYSchedule;
        bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicSCSchedule;
        bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicFPSchedule;
    }

    struct TemplateTerms {
        Calendar calendar;
        ContractRole contractRole;
        DayCountConvention dayCountConvention;
        BusinessDayConvention businessDayConvention;
        EndOfMonthConvention endOfMonthConvention;
        ScalingEffect scalingEffect;
        PenaltyType penaltyType;
        FeeBasis feeBasis;
        ContractPerformance creditEventTypeCovered;

        address currency;
        address settlementCurrency;

        bytes32 marketObjectCodeRateReset;

        uint256 statusDateOffset;
        uint256 maturityDateOffset;

        int256 feeAccrued;
        int256 accruedInterest;
        int256 rateMultiplier;
        int256 feeRate;
        int256 nextResetRate;
        int256 penaltyRate;
        int256 priceAtPurchaseDate;
        int256 nextPrincipalRedemptionPayment;

        IP gracePeriod;
        IP delinquencyPeriod;

        int256 periodCap;
        int256 periodFloor;
    }

    struct CustomTerms {
        uint256 anchorDate;
        int256 notionalPrincipal;
        int256 nominalInterestRate;
        int256 premiumDiscountAtIED;
        int256 rateSpread;
        int256 lifeCap;
        int256 lifeFloor;
        int256 coverageOfCreditEnhancement;
        ContractReference contractReference_1;
        ContractReference contractReference_2;
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

            templateTerms.statusDateOffset + customTerms.anchorDate,
            templateTerms.maturityDateOffset + customTerms.anchorDate,

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

    function isUnscheduledEventType(EventType eventType) internal pure returns (bool) {
        if (eventType == EventType.CE || eventType == EventType.XD) {
            return true;
        }

        return false;
    }

    function isCyclicEventType(EventType eventType) internal pure returns (bool) {
        if (
            eventType == EventType.IP
            || eventType == EventType.IPCI
            || eventType == EventType.PR
            || eventType == EventType.SC
            || eventType == EventType.RR
            || eventType == EventType.PY
        ) {
            return true;
        }

        return false;
    }

    function deriveScheduleIndexFromEventType(EventType eventType) internal pure returns (uint8) {
        return (isCyclicEventType(eventType) ? uint8(eventType) : NON_CYCLIC_INDEX);
    }
}
