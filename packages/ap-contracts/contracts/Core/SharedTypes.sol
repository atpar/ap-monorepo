pragma solidity ^0.5.2;

import "@atpar/actus-solidity/contracts/Core/ACTUSTypes.sol";


contract SharedTypes is ACTUSTypes {

    // offset == 0 is interpreted as a not set date value and not shifted
    // hence we define 1 as an offset == anchorDate
    uint256 constant ZERO_OFFSET = 1;

    struct TemplateSchedule {
        // scheduleTime and EventType are tighlty packed and encoded as bytes32
        // in the context of a Template scheduleTime is defined as an offset in seconds
        // respective to an anchorDate which is defined in the CustomTerms of the asset which references this template
        // index of event => bytes32 encoded event
        mapping(uint256 => bytes32) events;
        // the length of the schedule, used to determine the end of the schedule
        uint256 length;
    }

    struct AssetOwnership {
        // account which has to fulfill all obligations for the creator side
        address creatorObligor;
        // account to which all cashflows to which the creator is the beneficiary are forwarded
        address creatorBeneficiary;
        // account which has to fulfill all obligations for the counterparty
        address counterpartyObligor;
        // account to which all cashflows to which the counterparty is the beneficiary are forwarded
        address counterpartyBeneficiary;
    }

    // modified set of LifecycleTerms which does not contain ContractReferences
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

        // in the context of a Template date values are defined as offsets in seconds
        // respective to and anchorDate which is defined in the CustomTerms of the asset which references this template
        // if set == 0 offset is interpreted as a not set date value (see ZERO_OFFSET)
        uint256 statusDateOffset;
        uint256 maturityDateOffset;

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
