pragma solidity ^0.5.2;

import "actus-solidity/contracts/Core/Definitions.sol";


contract SharedTypes is Definitions {

	uint8 constant NON_CYCLIC_INDEX = ~uint8(0);

	struct Schedule {
		mapping(uint256 => bytes32) protoSchedule;
		uint256 numberOfEvents;
	}

	struct AssetOwnership {
		address creatorObligor;
		address creatorBeneficiary;
		address counterpartyObligor;
		address counterpartyBeneficiary;
	}

	struct ProtoSchedules {
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
		address currency;
		ScalingEffect scalingEffect;
		PenaltyType penaltyType;
		FeeBasis feeBasis;
		ContractPerformance creditEventTypeCovered;
		ContractStructure contractStructure;

		uint256 statusDateOffset;
		uint256 maturityDateOffset;

		int256 feeAccrued;
		int256 accruedInterest;
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
			productTerms.currency,
			productTerms.scalingEffect,
			productTerms.penaltyType,
			productTerms.feeBasis,
			productTerms.creditEventTypeCovered,
			productTerms.contractStructure,

			productTerms.statusDateOffset + customTerms.anchorDate,
			productTerms.maturityDateOffset + customTerms.anchorDate,

			customTerms.notionalPrincipal,
			customTerms.nominalInterestRate,
			productTerms.feeAccrued,
			productTerms.accruedInterest,
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
}
