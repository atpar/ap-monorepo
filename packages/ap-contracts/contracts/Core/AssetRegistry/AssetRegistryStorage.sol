pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";

import "../SharedTypes.sol";


contract AssetRegistryStorage is Definitions, SharedTypes {

	struct Asset {
		bytes32 assetId;
		AssetOwnership ownership;
		mapping (int8 => address payable) cashflowBeneficiaries;
		mapping (uint8 => bytes32) packedTermsState;
		bytes32[] nonCyclicProtoEventSchedule;
		mapping (uint8 => bytes32[]) cyclicProtoEventSchedules;
		uint256 eventId;
    address engine;
		address actor;
	}

	mapping (bytes32 => Asset) assets;


	function setAsset(
		bytes32 _assetId,
		AssetOwnership memory _ownership,
		Terms memory terms,
		State memory state,
		ProtoEventSchedules memory protoEventSchedules,
    address _engine,
		address _actor
	)
		internal
	{
		assets[_assetId] = Asset({
			assetId: _assetId,
			ownership: _ownership,
			eventId: 0,
			nonCyclicProtoEventSchedule: new bytes32[](0),
      engine: _engine,
			actor: _actor
		});

		encodeAndSetTerms(_assetId, terms);
		encodeAndSetState(_assetId, state);
		encodeAndSetFinalizedState(_assetId, state);
		encodeAndSetProtoEventSchedules(_assetId, protoEventSchedules);
	}

	function encodeAndSetTerms(bytes32 assetId, Terms memory terms) internal {
		bytes32 enums =
			bytes32(uint256(uint8(terms.contractType))) << 248 |
			bytes32(uint256(uint8(terms.calendar))) << 240 |
			bytes32(uint256(uint8(terms.contractRole))) << 232 |
			bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
			bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
			bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
			bytes32(uint256(uint8(terms.scalingEffect))) << 200 |
			bytes32(uint256(uint8(terms.penaltyType))) << 192 |
			bytes32(uint256(uint8(terms.feeBasis))) << 184 |
			bytes32(uint256(uint8(terms.creditEventTypeCovered))) << 176;

		if (enums != bytes32(0)) assets[assetId].packedTermsState[1] = enums;

		if (terms.creatorID != bytes32(0)) assets[assetId].packedTermsState[2] = terms.creatorID;
		if (terms.counterpartyID != bytes32(0)) assets[assetId].packedTermsState[3] = terms.counterpartyID;

		if (terms.currency != address(0)) assets[assetId].packedTermsState[4] = bytes32(uint256(terms.currency) << 96);

		if (terms.contractDealDate != uint256(0)) assets[assetId].packedTermsState[5] = bytes32(terms.contractDealDate);
		if (terms.statusDate != uint256(0)) assets[assetId].packedTermsState[6] = bytes32(terms.statusDate);
		if (terms.initialExchangeDate != uint256(0)) assets[assetId].packedTermsState[7] = bytes32(terms.initialExchangeDate);
		if (terms.maturityDate != uint256(0)) assets[assetId].packedTermsState[8] = bytes32(terms.maturityDate);
		if (terms.terminationDate != uint256(0)) assets[assetId].packedTermsState[9] = bytes32(terms.terminationDate);
		if (terms.purchaseDate != uint256(0)) assets[assetId].packedTermsState[10] = bytes32(terms.purchaseDate);
		if (terms.capitalizationEndDate != uint256(0)) assets[assetId].packedTermsState[11] = bytes32(terms.capitalizationEndDate);
		if (terms.cycleAnchorDateOfInterestPayment != uint256(0)) assets[assetId].packedTermsState[12] = bytes32(terms.cycleAnchorDateOfInterestPayment);
		if (terms.cycleAnchorDateOfRateReset != uint256(0)) assets[assetId].packedTermsState[13] = bytes32(terms.cycleAnchorDateOfRateReset);
		if (terms.cycleAnchorDateOfScalingIndex != uint256(0)) assets[assetId].packedTermsState[14] = bytes32(terms.cycleAnchorDateOfScalingIndex);
		if (terms.cycleAnchorDateOfFee != uint256(0)) assets[assetId].packedTermsState[15] = bytes32(terms.cycleAnchorDateOfFee);
		if (terms.cycleAnchorDateOfPrincipalRedemption != uint256(0)) assets[assetId].packedTermsState[16] = bytes32(terms.cycleAnchorDateOfPrincipalRedemption);

		if (terms.notionalPrincipal != int256(0)) assets[assetId].packedTermsState[17] = bytes32(terms.notionalPrincipal);
		if (terms.nominalInterestRate != int256(0)) assets[assetId].packedTermsState[18] = bytes32(terms.nominalInterestRate);
		if (terms.feeAccrued != int256(0)) assets[assetId].packedTermsState[19] = bytes32(terms.feeAccrued);
		if (terms.accruedInterest != int256(0)) assets[assetId].packedTermsState[20] = bytes32(terms.accruedInterest);
		if (terms.rateMultiplier != int256(0)) assets[assetId].packedTermsState[21] = bytes32(terms.rateMultiplier);
		if (terms.rateSpread != int256(0)) assets[assetId].packedTermsState[22] = bytes32(terms.rateSpread);
		if (terms.feeRate != int256(0)) assets[assetId].packedTermsState[23] = bytes32(terms.feeRate);
		if (terms.nextResetRate != int256(0)) assets[assetId].packedTermsState[24] = bytes32(terms.nextResetRate);
		if (terms.penaltyRate != int256(0)) assets[assetId].packedTermsState[25] = bytes32(terms.penaltyRate);
		if (terms.premiumDiscountAtIED != int256(0)) assets[assetId].packedTermsState[26] = bytes32(terms.premiumDiscountAtIED);
		if (terms.priceAtPurchaseDate != int256(0)) assets[assetId].packedTermsState[27] = bytes32(terms.priceAtPurchaseDate);
		if (terms.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedTermsState[28] = bytes32(terms.nextPrincipalRedemptionPayment);

		if (terms.cycleOfInterestPayment.isSet) {
			assets[assetId].packedTermsState[29] =
				bytes32(uint256(terms.cycleOfInterestPayment.i)) << 24 |
				bytes32(uint256(terms.cycleOfInterestPayment.p)) << 16 |
				bytes32(uint256(terms.cycleOfInterestPayment.s)) << 8 |
				bytes32(uint256(1));
		}
		if (terms.cycleOfRateReset.isSet) {
			assets[assetId].packedTermsState[30] =
				bytes32(uint256(terms.cycleOfRateReset.i)) << 24 |
				bytes32(uint256(terms.cycleOfRateReset.p)) << 16 |
				bytes32(uint256(terms.cycleOfRateReset.s)) << 8 |
				bytes32(uint256(1));
		}
		if (terms.cycleOfScalingIndex.isSet) {
			assets[assetId].packedTermsState[31] =
				bytes32(uint256(terms.cycleOfScalingIndex.i)) << 24 |
				bytes32(uint256(terms.cycleOfScalingIndex.p)) << 16 |
				bytes32(uint256(terms.cycleOfScalingIndex.s)) << 8 |
				bytes32(uint256(1));
		}
		if (terms.cycleOfFee.isSet) {
			assets[assetId].packedTermsState[32] =
				bytes32(uint256(terms.cycleOfFee.i)) << 24 |
				bytes32(uint256(terms.cycleOfFee.p)) << 16 |
				bytes32(uint256(terms.cycleOfFee.s)) << 8 |
				bytes32(uint256(1));
		}
		if (terms.cycleOfPrincipalRedemption.isSet) {
			assets[assetId].packedTermsState[33] =
				bytes32(uint256(terms.cycleOfPrincipalRedemption.i)) << 24 |
				bytes32(uint256(terms.cycleOfPrincipalRedemption.p)) << 16 |
				bytes32(uint256(terms.cycleOfPrincipalRedemption.s)) << 8 |
				bytes32(uint256(1));
		}

		if (terms.gracePeriod.isSet) {
			assets[assetId].packedTermsState[34] =
				bytes32(uint256(terms.gracePeriod.i)) << 24 |
				bytes32(uint256(terms.gracePeriod.p)) << 16 |
				bytes32(uint256(1)) << 8;
		}
		if (terms.delinquencyPeriod.isSet) {
			assets[assetId].packedTermsState[35] =
				bytes32(uint256(terms.delinquencyPeriod.i)) << 24 |
				bytes32(uint256(terms.delinquencyPeriod.p)) << 16 |
				bytes32(uint256(1)) << 8;
		}

		if (terms.lifeCap != int256(0)) assets[assetId].packedTermsState[36] = bytes32(terms.lifeCap);
		if (terms.lifeFloor != int256(0)) assets[assetId].packedTermsState[37] = bytes32(terms.lifeFloor);
		if (terms.periodCap != int256(0)) assets[assetId].packedTermsState[38] = bytes32(terms.periodCap);
		if (terms.periodFloor != int256(0)) assets[assetId].packedTermsState[39] = bytes32(terms.periodFloor);

		if (terms.coverageOfCreditEnhancement != int256(0)) assets[assetId].packedTermsState[40] = bytes32(terms.coverageOfCreditEnhancement);

		if (terms.contractStructure.object != bytes32(0)) {
			assets[assetId].packedTermsState[41] = bytes32(terms.contractStructure.object);
			assets[assetId].packedTermsState[42] =
				bytes32(uint256(terms.contractStructure.contractReferenceType)) << 16 |
				bytes32(uint256(terms.contractStructure.contractReferenceRole)) << 8;
		}
	}

	function encodeAndSetState(bytes32 assetId, State memory state) internal {
		if (state.lastEventTime != uint256(0)) assets[assetId].packedTermsState[101] = bytes32(state.lastEventTime);
		if (state.nonPerformingDate != uint256(0)) assets[assetId].packedTermsState[102] = bytes32(state.nonPerformingDate);

		if (state.notionalPrincipal != int256(0)) assets[assetId].packedTermsState[103] = bytes32(state.notionalPrincipal);
		if (state.accruedInterest != int256(0)) assets[assetId].packedTermsState[104] = bytes32(state.accruedInterest);
		if (state.feeAccrued != int256(0)) assets[assetId].packedTermsState[105] = bytes32(state.feeAccrued);
		if (state.nominalInterestRate != int256(0)) assets[assetId].packedTermsState[106] = bytes32(state.nominalInterestRate);
		if (state.interestScalingMultiplier != int256(0)) assets[assetId].packedTermsState[107] = bytes32(state.interestScalingMultiplier);
		if (state.notionalScalingMultiplier != int256(0)) assets[assetId].packedTermsState[108] = bytes32(state.notionalScalingMultiplier);
		if (state.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedTermsState[109] = bytes32(state.nextPrincipalRedemptionPayment);

		bytes32 enums =
			bytes32(uint256(uint8(state.contractPerformance))) << 248;

		if (enums != bytes32(0)) assets[assetId].packedTermsState[110] = enums;
	}

	function encodeAndSetFinalizedState(bytes32 assetId, State memory state) internal {
		if (state.lastEventTime != uint256(0)) assets[assetId].packedTermsState[151] = bytes32(state.lastEventTime);
		if (state.nonPerformingDate != uint256(0)) assets[assetId].packedTermsState[152] = bytes32(state.nonPerformingDate);

		if (state.notionalPrincipal != int256(0)) assets[assetId].packedTermsState[153] = bytes32(state.notionalPrincipal);
		if (state.accruedInterest != int256(0)) assets[assetId].packedTermsState[154] = bytes32(state.accruedInterest);
		if (state.feeAccrued != int256(0)) assets[assetId].packedTermsState[155] = bytes32(state.feeAccrued);
		if (state.nominalInterestRate != int256(0)) assets[assetId].packedTermsState[156] = bytes32(state.nominalInterestRate);
		if (state.interestScalingMultiplier != int256(0)) assets[assetId].packedTermsState[157] = bytes32(state.interestScalingMultiplier);
		if (state.notionalScalingMultiplier != int256(0)) assets[assetId].packedTermsState[158] = bytes32(state.notionalScalingMultiplier);
		if (state.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedTermsState[159] = bytes32(state.nextPrincipalRedemptionPayment);

		bytes32 enums =
			bytes32(uint256(uint8(state.contractPerformance))) << 248;

		if (enums != bytes32(0)) assets[assetId].packedTermsState[160] = enums;
	}

	function encodeAndSetProtoEventSchedules(bytes32 assetId, ProtoEventSchedules memory protoEventSchedules)
		internal
	{
		assets[assetId].nonCyclicProtoEventSchedule = protoEventSchedules.nonCyclicProtoEventSchedule;

		if (protoEventSchedules.cyclicIPProtoEventSchedule[0] != bytes32(0)) {
			assets[assetId].cyclicProtoEventSchedules[uint8(EventType.IP)] = protoEventSchedules.cyclicIPProtoEventSchedule;
		}
		if (protoEventSchedules.cyclicPRProtoEventSchedule[0] != bytes32(0)) {
			assets[assetId].cyclicProtoEventSchedules[uint8(EventType.PR)] = protoEventSchedules.cyclicPRProtoEventSchedule;
		}
		if (protoEventSchedules.cyclicRRProtoEventSchedule[0] != bytes32(0)) {
			assets[assetId].cyclicProtoEventSchedules[uint8(EventType.RR)] = protoEventSchedules.cyclicRRProtoEventSchedule;
		}
		if (protoEventSchedules.cyclicPYProtoEventSchedule[0] != bytes32(0)) {
			assets[assetId].cyclicProtoEventSchedules[uint8(EventType.PY)] = protoEventSchedules.cyclicPYProtoEventSchedule;
		}
		if (protoEventSchedules.cyclicSCProtoEventSchedule[0] != bytes32(0)) {
			assets[assetId].cyclicProtoEventSchedules[uint8(EventType.SC)] = protoEventSchedules.cyclicSCProtoEventSchedule;
		}
		if (protoEventSchedules.cyclicFPProtoEventSchedule[0] != bytes32(0)) {
			assets[assetId].cyclicProtoEventSchedules[uint8(EventType.FP)] = protoEventSchedules.cyclicFPProtoEventSchedule;
		}
	}

	function decodeAndGetTerms(bytes32 assetId) internal view returns (Terms memory) {
		return Terms(
			ContractType(uint8(uint256(assets[assetId].packedTermsState[1] >> 248))),
			Calendar(uint8(uint256(assets[assetId].packedTermsState[1] >> 240))),
			ContractRole(uint8(uint256(assets[assetId].packedTermsState[1] >> 232))),
			assets[assetId].packedTermsState[2],
			assets[assetId].packedTermsState[3],
			DayCountConvention(uint8(uint256(assets[assetId].packedTermsState[1] >> 224))),
			BusinessDayConvention(uint8(uint256(assets[assetId].packedTermsState[1] >> 216))),
			EndOfMonthConvention(uint8(uint256(assets[assetId].packedTermsState[1] >> 208))),
			address(uint160(uint256(assets[assetId].packedTermsState[4]) >> 96)),
			ScalingEffect(uint8(uint256(assets[assetId].packedTermsState[1] >> 200))),
			PenaltyType(uint8(uint256(assets[assetId].packedTermsState[1] >> 192))),
			FeeBasis(uint8(uint256(assets[assetId].packedTermsState[1] >> 184))),
			ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[1] >> 176))),
			ContractStructure(
				assets[assetId].packedTermsState[41],
				ContractReferenceType(uint8(uint256(assets[assetId].packedTermsState[42] >> 16))),
				ContractReferenceRole(uint8(uint256(assets[assetId].packedTermsState[42] >> 8)))
			
			),
			uint256(assets[assetId].packedTermsState[5]),
			uint256(assets[assetId].packedTermsState[6]),
			uint256(assets[assetId].packedTermsState[7]),
			uint256(assets[assetId].packedTermsState[8]),
			uint256(assets[assetId].packedTermsState[9]),
			uint256(assets[assetId].packedTermsState[10]),
			uint256(assets[assetId].packedTermsState[11]),
			uint256(assets[assetId].packedTermsState[12]),
			uint256(assets[assetId].packedTermsState[13]),
			uint256(assets[assetId].packedTermsState[14]),
			uint256(assets[assetId].packedTermsState[15]),
			uint256(assets[assetId].packedTermsState[16]),
			int256(assets[assetId].packedTermsState[17]),
			int256(assets[assetId].packedTermsState[18]),
			int256(assets[assetId].packedTermsState[19]),
			int256(assets[assetId].packedTermsState[20]),
			int256(assets[assetId].packedTermsState[21]),
			int256(assets[assetId].packedTermsState[22]),
			int256(assets[assetId].packedTermsState[23]),
			int256(assets[assetId].packedTermsState[24]),
			int256(assets[assetId].packedTermsState[25]),
			int256(assets[assetId].packedTermsState[26]),
			int256(assets[assetId].packedTermsState[27]),
			int256(assets[assetId].packedTermsState[28]),
			int256(assets[assetId].packedTermsState[40]),
			IPS(
				uint256(assets[assetId].packedTermsState[29] >> 24),
				P(uint8(uint256(assets[assetId].packedTermsState[29] >> 16))),
				S(uint8(uint256(assets[assetId].packedTermsState[29] >> 8))),
				(assets[assetId].packedTermsState[29] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			IPS(
				uint256(assets[assetId].packedTermsState[30] >> 24),
				P(uint8(uint256(assets[assetId].packedTermsState[30] >> 16))),
				S(uint8(uint256(assets[assetId].packedTermsState[30] >> 8))),
				(assets[assetId].packedTermsState[30] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			IPS(
				uint256(assets[assetId].packedTermsState[31] >> 24),
				P(uint8(uint256(assets[assetId].packedTermsState[31] >> 16))),
				S(uint8(uint256(assets[assetId].packedTermsState[31] >> 8))),
				(assets[assetId].packedTermsState[31] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			IPS(
				uint256(assets[assetId].packedTermsState[32] >> 24),
				P(uint8(uint256(assets[assetId].packedTermsState[32] >> 16))),
				S(uint8(uint256(assets[assetId].packedTermsState[32] >> 8))),
				(assets[assetId].packedTermsState[32] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			IPS(
				uint256(assets[assetId].packedTermsState[33] >> 24),
				P(uint8(uint256(assets[assetId].packedTermsState[33] >> 16))),
				S(uint8(uint256(assets[assetId].packedTermsState[33] >> 8))),
				(assets[assetId].packedTermsState[33] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			IP(
				uint256(assets[assetId].packedTermsState[34] >> 24),
				P(uint8(uint256(assets[assetId].packedTermsState[34] >> 16))),
				(assets[assetId].packedTermsState[34] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			IP(
				uint256(assets[assetId].packedTermsState[35] >> 24),
				P(uint8(uint256(assets[assetId].packedTermsState[35] >> 16))),
				(assets[assetId].packedTermsState[35] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			int256(assets[assetId].packedTermsState[36]),
			int256(assets[assetId].packedTermsState[37]),
			int256(assets[assetId].packedTermsState[38]),
			int256(assets[assetId].packedTermsState[39])
		);
	}

	function decodeAndGetState(bytes32 assetId) internal view returns (State memory) {
		return State(
			uint256(assets[assetId].packedTermsState[101]),
			uint256(assets[assetId].packedTermsState[102]),
			ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[110] >> 248))),
			int256(assets[assetId].packedTermsState[103]),
			int256(assets[assetId].packedTermsState[104]),
			int256(assets[assetId].packedTermsState[105]),
			int256(assets[assetId].packedTermsState[106]),
			int256(assets[assetId].packedTermsState[107]),
			int256(assets[assetId].packedTermsState[108]),
			int256(assets[assetId].packedTermsState[109])
		);
	}

	function decodeAndGetFinalizedState(bytes32 assetId) internal view returns (State memory) {
		return State(
			uint256(assets[assetId].packedTermsState[151]),
			uint256(assets[assetId].packedTermsState[152]),
			ContractPerformance(uint8(uint256(assets[assetId].packedTermsState[160] >> 248))),
			int256(assets[assetId].packedTermsState[153]),
			int256(assets[assetId].packedTermsState[154]),
			int256(assets[assetId].packedTermsState[155]),
			int256(assets[assetId].packedTermsState[156]),
			int256(assets[assetId].packedTermsState[157]),
			int256(assets[assetId].packedTermsState[158]),
			int256(assets[assetId].packedTermsState[159])
		);
	}

	function decodeAndGetNextNonCyclicProtoEvent(bytes32 assetId)
		internal
		view
		returns (bytes32)
	{
		if (assets[assetId].nonCyclicProtoEventSchedule.length == 0) {
			return bytes32(0);
		}

		return assets[assetId].nonCyclicProtoEventSchedule[assets[assetId].nonCyclicProtoEventSchedule.length - 1];
	}

	function decodeAndGetNextCyclicProtoEvent(bytes32 assetId, EventType eventType)
		internal
		view
		returns (bytes32)
	{
		if (assets[assetId].cyclicProtoEventSchedules[uint8(eventType)].length == 0) {
			return bytes32(0);
		}

		return assets[assetId].cyclicProtoEventSchedules[uint8(eventType)][assets[assetId].cyclicProtoEventSchedules[uint8(eventType)].length - 1];
	}
}
