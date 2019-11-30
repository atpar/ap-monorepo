pragma solidity ^0.5.2;

import "actus-solidity/contracts/Core/ACTUSTypes.sol";


contract SharedTypes is ACTUSTypes {

	uint8 constant NON_CYCLIC_INDEX = ~uint8(0);

	struct ProductSchedule {
		mapping(uint256 => bytes32) productSchedule;
		uint256 length;
	}

	struct AssetOwnership {
		address creatorObligor;
		address creatorBeneficiary;
		address counterpartyObligor;
		address counterpartyBeneficiary;
	}

	struct ProductSchedules {
		bytes32[MAX_EVENT_SCHEDULE_SIZE] nonCyclicSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicIPSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicPRSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicRRSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicPYSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicSCSchedule;
		bytes32[MAX_EVENT_SCHEDULE_SIZE] cyclicFPSchedule;
	}

	struct ProductTerms {
		Calendar calendar;
		ContractRole contractRole;
		DayCountConvention dayCountConvention;
		BusinessDayConvention businessDayConvention;
		EndOfMonthConvention endOfMonthConvention;
		ScalingEffect scalingEffect;
		PenaltyType penaltyType;
		FeeBasis feeBasis;
		ContractPerformance creditEventTypeCovered;
		ContractReference[2] contractReferences;

		address currency;

		bytes32 marketObjectCodeRateReset;

		uint256 statusDateOffset;
		uint256 maturityDateOffset;

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

		IP gracePeriod;
		IP delinquencyPeriod;

		int256 lifeCap;
		int256 lifeFloor;
		int256 periodCap;
		int256 periodFloor;
	}

	struct CustomTerms {
		uint256 anchorDate;
		int256 notionalPrincipal;
		int256 nominalInterestRate;
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
			productTerms.contractReferences,

			productTerms.currency,

			productTerms.marketObjectCodeRateReset,

			productTerms.statusDateOffset + customTerms.anchorDate,
			productTerms.maturityDateOffset + customTerms.anchorDate,

			customTerms.notionalPrincipal,
			customTerms.nominalInterestRate,
			productTerms.feeAccrued,
			productTerms.accruedInterest,
			productTerms.rateMultiplier,
			productTerms.rateSpread,
			productTerms.feeRate,
			productTerms.nextResetRate,
			productTerms.penaltyRate,
			productTerms.premiumDiscountAtIED,
			productTerms.priceAtPurchaseDate,
			productTerms.nextPrincipalRedemptionPayment,
			productTerms.coverageOfCreditEnhancement,

			productTerms.gracePeriod,
			productTerms.delinquencyPeriod,

			productTerms.lifeCap,
			productTerms.lifeFloor,
			productTerms.periodCap,
			productTerms.periodFloor
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

	function deriveScheduleIndexFromEventType(EventType eventType)
		internal
		pure
		returns (uint8)
	{
		return (isCyclicEventType(eventType) ? uint8(eventType) : NON_CYCLIC_INDEX);
	}
}
