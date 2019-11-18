pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";

import "../SharedTypes.sol";


contract ProductRegistryStorage is Definitions, SharedTypes {

  struct Product {
		mapping (uint256 => bytes32) packedTerms;
    mapping (uint8 => ProtoEventSchedule) protoEventSchedules;
    bool isSet;
  }

  mapping (bytes32 => Product) products;


  function setProduct(
    bytes32 productId,
    LifecycleTerms memory terms,
    ProtoEventSchedules memory protoEventSchedules
  )
    internal
  {
    products[productId] = Product({ isSet: true });

    encodeAndSetTerms(productId, terms);
    encodeAndSetProtoEventSchedules(productId, protoEventSchedules);
  }

  function encodeAndSetTerms(bytes32 productId, LifecycleTerms memory terms) internal {
		bytes32 enums =
			// bytes32(uint256(uint8(terms.contractType))) << 248 |
			bytes32(uint256(uint8(terms.calendar))) << 240 |
			bytes32(uint256(uint8(terms.contractRole))) << 232 |
			bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
			bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
			bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
			bytes32(uint256(uint8(terms.scalingEffect))) << 200 |
			bytes32(uint256(uint8(terms.penaltyType))) << 192 |
			bytes32(uint256(uint8(terms.feeBasis))) << 184 |
			bytes32(uint256(uint8(terms.creditEventTypeCovered))) << 176;

		if (enums != bytes32(0)) products[productId].packedTerms[1] = enums;

		// if (terms.creatorID != bytes32(0)) products[productId].packedTerms[2] = terms.creatorID;
		// if (terms.counterpartyID != bytes32(0)) products[productId].packedTerms[3] = terms.counterpartyID;

		if (terms.currency != address(0)) products[productId].packedTerms[4] = bytes32(uint256(terms.currency) << 96);

		// if (terms.contractDealDate != uint256(0)) products[productId].packedTerms[5] = bytes32(terms.contractDealDate);
		if (terms.statusDate != uint256(0)) products[productId].packedTerms[6] = bytes32(terms.statusDate);
		if (terms.initialExchangeDate != uint256(0)) products[productId].packedTerms[7] = bytes32(terms.initialExchangeDate);
		if (terms.maturityDate != uint256(0)) products[productId].packedTerms[8] = bytes32(terms.maturityDate);
		if (terms.terminationDate != uint256(0)) products[productId].packedTerms[9] = bytes32(terms.terminationDate);
		if (terms.purchaseDate != uint256(0)) products[productId].packedTerms[10] = bytes32(terms.purchaseDate);
		// if (terms.capitalizationEndDate != uint256(0)) products[productId].packedTerms[11] = bytes32(terms.capitalizationEndDate);
		if (terms.cycleAnchorDateOfInterestPayment != uint256(0)) products[productId].packedTerms[12] = bytes32(terms.cycleAnchorDateOfInterestPayment);
		// if (terms.cycleAnchorDateOfRateReset != uint256(0)) products[productId].packedTerms[13] = bytes32(terms.cycleAnchorDateOfRateReset);
		// if (terms.cycleAnchorDateOfScalingIndex != uint256(0)) products[productId].packedTerms[14] = bytes32(terms.cycleAnchorDateOfScalingIndex);
		// if (terms.cycleAnchorDateOfFee != uint256(0)) products[productId].packedTerms[15] = bytes32(terms.cycleAnchorDateOfFee);
		// if (terms.cycleAnchorDateOfPrincipalRedemption != uint256(0)) products[productId].packedTerms[16] = bytes32(terms.cycleAnchorDateOfPrincipalRedemption);

		if (terms.notionalPrincipal != int256(0)) products[productId].packedTerms[17] = bytes32(terms.notionalPrincipal);
		if (terms.nominalInterestRate != int256(0)) products[productId].packedTerms[18] = bytes32(terms.nominalInterestRate);
		if (terms.feeAccrued != int256(0)) products[productId].packedTerms[19] = bytes32(terms.feeAccrued);
		if (terms.accruedInterest != int256(0)) products[productId].packedTerms[20] = bytes32(terms.accruedInterest);
		// if (terms.rateMultiplier != int256(0)) products[productId].packedTerms[21] = bytes32(terms.rateMultiplier);
		if (terms.rateSpread != int256(0)) products[productId].packedTerms[22] = bytes32(terms.rateSpread);
		if (terms.feeRate != int256(0)) products[productId].packedTerms[23] = bytes32(terms.feeRate);
		if (terms.nextResetRate != int256(0)) products[productId].packedTerms[24] = bytes32(terms.nextResetRate);
		if (terms.penaltyRate != int256(0)) products[productId].packedTerms[25] = bytes32(terms.penaltyRate);
		if (terms.premiumDiscountAtIED != int256(0)) products[productId].packedTerms[26] = bytes32(terms.premiumDiscountAtIED);
		if (terms.priceAtPurchaseDate != int256(0)) products[productId].packedTerms[27] = bytes32(terms.priceAtPurchaseDate);
		if (terms.nextPrincipalRedemptionPayment != int256(0)) products[productId].packedTerms[28] = bytes32(terms.nextPrincipalRedemptionPayment);

		// if (terms.cycleOfInterestPayment.isSet) {
		// 	products[productId].packedTerms[29] =
		// 		bytes32(uint256(terms.cycleOfInterestPayment.i)) << 24 |
		// 		bytes32(uint256(terms.cycleOfInterestPayment.p)) << 16 |
		// 		bytes32(uint256(terms.cycleOfInterestPayment.s)) << 8 |
		// 		bytes32(uint256(1));
		// }
		// if (terms.cycleOfRateReset.isSet) {
		// 	products[productId].packedTerms[30] =
		// 		bytes32(uint256(terms.cycleOfRateReset.i)) << 24 |
		// 		bytes32(uint256(terms.cycleOfRateReset.p)) << 16 |
		// 		bytes32(uint256(terms.cycleOfRateReset.s)) << 8 |
		// 		bytes32(uint256(1));
		// }
		// if (terms.cycleOfScalingIndex.isSet) {
		// 	products[productId].packedTerms[31] =
		// 		bytes32(uint256(terms.cycleOfScalingIndex.i)) << 24 |
		// 		bytes32(uint256(terms.cycleOfScalingIndex.p)) << 16 |
		// 		bytes32(uint256(terms.cycleOfScalingIndex.s)) << 8 |
		// 		bytes32(uint256(1));
		// }
		// if (terms.cycleOfFee.isSet) {
		// 	products[productId].packedTerms[32] =
		// 		bytes32(uint256(terms.cycleOfFee.i)) << 24 |
		// 		bytes32(uint256(terms.cycleOfFee.p)) << 16 |
		// 		bytes32(uint256(terms.cycleOfFee.s)) << 8 |
		// 		bytes32(uint256(1));
		// }
		// if (terms.cycleOfPrincipalRedemption.isSet) {
		// 	products[productId].packedTerms[33] =
		// 		bytes32(uint256(terms.cycleOfPrincipalRedemption.i)) << 24 |
		// 		bytes32(uint256(terms.cycleOfPrincipalRedemption.p)) << 16 |
		// 		bytes32(uint256(terms.cycleOfPrincipalRedemption.s)) << 8 |
		// 		bytes32(uint256(1));
		// }

		if (terms.gracePeriod.isSet) {
			products[productId].packedTerms[34] =
				bytes32(uint256(terms.gracePeriod.i)) << 24 |
				bytes32(uint256(terms.gracePeriod.p)) << 16 |
				bytes32(uint256(1)) << 8;
		}
		if (terms.delinquencyPeriod.isSet) {
			products[productId].packedTerms[35] =
				bytes32(uint256(terms.delinquencyPeriod.i)) << 24 |
				bytes32(uint256(terms.delinquencyPeriod.p)) << 16 |
				bytes32(uint256(1)) << 8;
		}

		if (terms.lifeCap != int256(0)) products[productId].packedTerms[36] = bytes32(terms.lifeCap);
		if (terms.lifeFloor != int256(0)) products[productId].packedTerms[37] = bytes32(terms.lifeFloor);
		if (terms.periodCap != int256(0)) products[productId].packedTerms[38] = bytes32(terms.periodCap);
		if (terms.periodFloor != int256(0)) products[productId].packedTerms[39] = bytes32(terms.periodFloor);

		if (terms.coverageOfCreditEnhancement != int256(0)) products[productId].packedTerms[40] = bytes32(terms.coverageOfCreditEnhancement);

		if (terms.contractStructure.object != bytes32(0)) {
			products[productId].packedTerms[41] = bytes32(terms.contractStructure.object);
			products[productId].packedTerms[42] =
				bytes32(uint256(terms.contractStructure.contractReferenceType)) << 16 |
				bytes32(uint256(terms.contractStructure.contractReferenceRole)) << 8;
		}
	}

  function encodeAndSetProtoEventSchedules(bytes32 productId, ProtoEventSchedules memory protoEventSchedules)
		internal
	{
		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (protoEventSchedules.nonCyclicProtoEventSchedule[i] == bytes32(0)) break;
			products[productId].protoEventSchedules[NON_CYCLIC_INDEX].protoEventSchedule[i] = protoEventSchedules.nonCyclicProtoEventSchedule[i];
			products[productId].protoEventSchedules[NON_CYCLIC_INDEX].numberOfProtoEvents = i;
		}

		uint8 indexIP = uint8(EventType.IP);
		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (protoEventSchedules.cyclicIPProtoEventSchedule[i] == bytes32(0)) break;
			products[productId].protoEventSchedules[indexIP].protoEventSchedule[i] = protoEventSchedules.cyclicIPProtoEventSchedule[i];
			products[productId].protoEventSchedules[indexIP].numberOfProtoEvents = i;
		}

		uint8 indexPR = uint8(EventType.PR);
		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (protoEventSchedules.cyclicPRProtoEventSchedule[i] == bytes32(0)) break;
			products[productId].protoEventSchedules[indexPR].protoEventSchedule[i] = protoEventSchedules.cyclicPRProtoEventSchedule[i];
			products[productId].protoEventSchedules[indexPR].numberOfProtoEvents = i;
		}

		uint8 indexRR = uint8(EventType.RR);
		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (protoEventSchedules.cyclicRRProtoEventSchedule[i] == bytes32(0)) break;
			products[productId].protoEventSchedules[indexRR].protoEventSchedule[i] = protoEventSchedules.cyclicRRProtoEventSchedule[i];
			products[productId].protoEventSchedules[indexRR].numberOfProtoEvents = i;
		}

		uint8 indexPY = uint8(EventType.PY);
		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (protoEventSchedules.cyclicPYProtoEventSchedule[i] == bytes32(0)) break;
			products[productId].protoEventSchedules[indexPY].protoEventSchedule[i] = protoEventSchedules.cyclicPYProtoEventSchedule[i];
			products[productId].protoEventSchedules[indexPY].numberOfProtoEvents = i;
		}

		uint8 indexSC = uint8(EventType.SC);
		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (protoEventSchedules.cyclicSCProtoEventSchedule[i] == bytes32(0)) break;
			products[productId].protoEventSchedules[indexSC].protoEventSchedule[i] = protoEventSchedules.cyclicSCProtoEventSchedule[i];
			products[productId].protoEventSchedules[indexSC].numberOfProtoEvents = i;
		}

		uint8 indexFP = uint8(EventType.FP);
		for (uint256 i = 0; i < MAX_EVENT_SCHEDULE_SIZE; i++) {
			if (protoEventSchedules.cyclicFPProtoEventSchedule[i] == bytes32(0)) break;
			products[productId].protoEventSchedules[indexFP].protoEventSchedule[i] = protoEventSchedules.cyclicFPProtoEventSchedule[i];
			products[productId].protoEventSchedules[indexFP].numberOfProtoEvents = i;
		}
	}

  function decodeAndGetTerms(bytes32 productId) internal view returns (LifecycleTerms memory) {
		return LifecycleTerms(
			// ContractType(uint8(uint256(products[productId].packedTerms[1] >> 248))),
			Calendar(uint8(uint256(products[productId].packedTerms[1] >> 240))),
			ContractRole(uint8(uint256(products[productId].packedTerms[1] >> 232))),
			// products[productId].packedTerms[2],
			// products[productId].packedTerms[3],
			DayCountConvention(uint8(uint256(products[productId].packedTerms[1] >> 224))),
			BusinessDayConvention(uint8(uint256(products[productId].packedTerms[1] >> 216))),
			EndOfMonthConvention(uint8(uint256(products[productId].packedTerms[1] >> 208))),
			address(uint160(uint256(products[productId].packedTerms[4]) >> 96)),
			ScalingEffect(uint8(uint256(products[productId].packedTerms[1] >> 200))),
			PenaltyType(uint8(uint256(products[productId].packedTerms[1] >> 192))),
			FeeBasis(uint8(uint256(products[productId].packedTerms[1] >> 184))),
			ContractPerformance(uint8(uint256(products[productId].packedTerms[1] >> 176))),
			ContractStructure(
				products[productId].packedTerms[41],
				ContractReferenceType(uint8(uint256(products[productId].packedTerms[42] >> 16))),
				ContractReferenceRole(uint8(uint256(products[productId].packedTerms[42] >> 8)))
			),
			// uint256(products[productId].packedTerms[5]),
			uint256(products[productId].packedTerms[6]),
			uint256(products[productId].packedTerms[7]),
			uint256(products[productId].packedTerms[8]),
			uint256(products[productId].packedTerms[9]),
			uint256(products[productId].packedTerms[10]),
			// uint256(products[productId].packedTerms[11]),
			uint256(products[productId].packedTerms[12]),
			// uint256(products[productId].packedTerms[13]),
			// uint256(products[productId].packedTerms[14]),
			// uint256(products[productId].packedTerms[15]),
			// uint256(products[productId].packedTerms[16]),
			int256(products[productId].packedTerms[17]),
			int256(products[productId].packedTerms[18]),
			int256(products[productId].packedTerms[19]),
			int256(products[productId].packedTerms[20]),
			// int256(products[productId].packedTerms[21]),
			int256(products[productId].packedTerms[22]),
			int256(products[productId].packedTerms[23]),
			int256(products[productId].packedTerms[24]),
			int256(products[productId].packedTerms[25]),
			int256(products[productId].packedTerms[26]),
			int256(products[productId].packedTerms[27]),
			int256(products[productId].packedTerms[28]),
			int256(products[productId].packedTerms[40]),
			// IPS(
			// 	uint256(products[productId].packedTerms[29] >> 24),
			// 	P(uint8(uint256(products[productId].packedTerms[29] >> 16))),
			// 	S(uint8(uint256(products[productId].packedTerms[29] >> 8))),
			// 	(products[productId].packedTerms[29] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			// ),
			// IPS(
			// 	uint256(products[productId].packedTerms[30] >> 24),
			// 	P(uint8(uint256(products[productId].packedTerms[30] >> 16))),
			// 	S(uint8(uint256(products[productId].packedTerms[30] >> 8))),
			// 	(products[productId].packedTerms[30] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			// ),
			// IPS(
			// 	uint256(products[productId].packedTerms[31] >> 24),
			// 	P(uint8(uint256(products[productId].packedTerms[31] >> 16))),
			// 	S(uint8(uint256(products[productId].packedTerms[31] >> 8))),
			// 	(products[productId].packedTerms[31] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			// ),
			// IPS(
			// 	uint256(products[productId].packedTerms[32] >> 24),
			// 	P(uint8(uint256(products[productId].packedTerms[32] >> 16))),
			// 	S(uint8(uint256(products[productId].packedTerms[32] >> 8))),
			// 	(products[productId].packedTerms[32] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			// ),
			// IPS(
			// 	uint256(products[productId].packedTerms[33] >> 24),
			// 	P(uint8(uint256(products[productId].packedTerms[33] >> 16))),
			// 	S(uint8(uint256(products[productId].packedTerms[33] >> 8))),
			// 	(products[productId].packedTerms[33] & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			// ),
			IP(
				uint256(products[productId].packedTerms[34] >> 24),
				P(uint8(uint256(products[productId].packedTerms[34] >> 16))),
				(products[productId].packedTerms[34] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			IP(
				uint256(products[productId].packedTerms[35] >> 24),
				P(uint8(uint256(products[productId].packedTerms[35] >> 16))),
				(products[productId].packedTerms[35] >> 8 & bytes32(uint256(1)) == bytes32(uint256(1))) ? true : false
			),
			int256(products[productId].packedTerms[36]),
			int256(products[productId].packedTerms[37]),
			int256(products[productId].packedTerms[38]),
			int256(products[productId].packedTerms[39])
		);
	}
}
