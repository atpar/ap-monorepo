pragma solidity ^0.5.2;

import "@atpar/actus-solidity/contracts/Core/ACTUSTypes.sol";


contract SharedTypes is ACTUSTypes {

    // define maximum of uint8 as schedule index for the non-cyclic schedulee
    uint8 constant NON_CYCLIC_INDEX = ~uint8(0);
    // define maximum of uint64 (0xFFFFFFFFFFFFFFFF) as offset == anchorDate,
    // since offset == 0 is interpreted as a not set date value and not shifted
    uint256 constant ZERO_OFFSET = 1; // uint256(~uint64(0));

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

        uint256 statusDateOffset; // if set == 0 offset is interpreted as a not set date value
        uint256 maturityDateOffset; // if set == 0 offset is interpreted as a not set date value

        int256 notionalPrincipal;
        int256 nominalInterestRate;
        int256 feeAccrued;
        int256 accruedInterest;
        int256 rateMultiplier;
        int256 rateSpread;
        int256 feeRate;
        int256 nextResetRate;
        int256 penaltyRate;
        int256 premiumDiscountAtIED;
        int256 priceAtPurchaseDate;
        int256 nextPrincipalRedemptionPayment;
        int256 coverageOfCreditEnhancement;
        int256 lifeCap;
        int256 lifeFloor;
        int256 periodCap;
        int256 periodFloor;

        IP gracePeriod;
        IP delinquencyPeriod;
    }

    struct CustomTerms {
        uint256 anchorDate;
        // set of boolean values, true indicating that attribute is overwritten,
        // bit position from right to left in uint256 := position in lifecycleTerms (contractReference are always overwritten)
        // e.g. 0010110000...
        uint256 overwrittenAttributesMap;
        // terms object containing overwritten values
        LifecycleTerms overwrittenTerms;
    }
}
