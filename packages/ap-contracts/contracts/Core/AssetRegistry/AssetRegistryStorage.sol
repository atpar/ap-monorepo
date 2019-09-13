pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "actus-solidity/contracts/Core/Definitions.sol";

import "../SharedTypes.sol";


contract AssetRegistryStorage is SharedTypes, Definitions {

	struct Asset {
		bytes32 assetId;
		AssetOwnership ownership;
		mapping (int8 => address payable) cashflowBeneficiaries;
		mapping (uint8 => bytes32) packedTermsState;
		uint256 eventId;
    address engine;
		address actor;
	}

	mapping (bytes32 => Asset) assets;


	function setAsset(
		bytes32 _assetId,
		AssetOwnership memory _ownership,
		ContractTerms memory terms,
		ContractState memory state,
    address _engine,
		address _actor
	)
		internal
	{
		assets[_assetId] = Asset({
			assetId: _assetId,
			ownership: _ownership,
			eventId: 0,
      engine: _engine,
			actor: _actor
		});

		encodeAndSetTerms(_assetId, terms);
		encodeAndSetState(_assetId, state);
	}

	function encodeAndSetTerms(bytes32 assetId, ContractTerms memory terms) internal {
		bytes32 enums =
			bytes32(uint256(uint8(terms.contractType))) << 248 |
			bytes32(uint256(uint8(terms.calendar))) << 240 |
			bytes32(uint256(uint8(terms.contractRole))) << 232 |
			bytes32(uint256(uint8(terms.dayCountConvention))) << 224 |
			bytes32(uint256(uint8(terms.businessDayConvention))) << 216 |
			bytes32(uint256(uint8(terms.endOfMonthConvention))) << 208 |
			bytes32(uint256(uint8(terms.scalingEffect))) << 200 |
			bytes32(uint256(uint8(terms.penaltyType))) << 192 |
			bytes32(uint256(uint8(terms.feeBasis))) << 184;

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

		if (terms.lifeCap != int256(0)) assets[assetId].packedTermsState[34] = bytes32(terms.lifeCap);
		if (terms.lifeFloor != int256(0)) assets[assetId].packedTermsState[35] = bytes32(terms.lifeFloor);
		if (terms.periodCap != int256(0)) assets[assetId].packedTermsState[36] = bytes32(terms.periodCap);
		if (terms.periodFloor != int256(0)) assets[assetId].packedTermsState[37] = bytes32(terms.periodFloor);
	}

	function encodeAndSetState(bytes32 assetId, ContractState memory state) internal {
		if (state.lastEventTime != uint256(0)) assets[assetId].packedTermsState[101] = bytes32(state.lastEventTime);

		bytes32 enums =
			bytes32(uint256(uint8(state.contractStatus))) << 248 |
			bytes32(uint256(uint8(state.contractRoleSign))) << 240;

		if (enums != bytes32(0)) assets[assetId].packedTermsState[102] = enums;

		if (state.timeFromLastEvent != int256(0)) assets[assetId].packedTermsState[103] = bytes32(state.timeFromLastEvent);
		if (state.nominalValue != int256(0)) assets[assetId].packedTermsState[104] = bytes32(state.nominalValue);
		if (state.nominalAccrued != int256(0)) assets[assetId].packedTermsState[105] = bytes32(state.nominalAccrued);
		if (state.feeAccrued != int256(0)) assets[assetId].packedTermsState[106] = bytes32(state.feeAccrued);
		if (state.nominalRate != int256(0)) assets[assetId].packedTermsState[107] = bytes32(state.nominalRate);
		if (state.interestScalingMultiplier != int256(0)) assets[assetId].packedTermsState[108] = bytes32(state.interestScalingMultiplier);
		if (state.nominalScalingMultiplier != int256(0)) assets[assetId].packedTermsState[109] = bytes32(state.nominalScalingMultiplier);
		if (state.nextPrincipalRedemptionPayment != int256(0)) assets[assetId].packedTermsState[110] = bytes32(state.nextPrincipalRedemptionPayment);
	}

	function decodeAndGetTerms(bytes32 assetId) internal view returns (ContractTerms memory) {
		return ContractTerms(
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
			int256(assets[assetId].packedTermsState[34]),
			int256(assets[assetId].packedTermsState[35]),
			int256(assets[assetId].packedTermsState[36]),
			int256(assets[assetId].packedTermsState[37])
		);
	}

	function decodeAndGetState(bytes32 assetId) internal view returns (ContractState memory) {
		return ContractState(
			uint256(assets[assetId].packedTermsState[101]),
			ContractStatus(uint8(uint256(assets[assetId].packedTermsState[102] >> 248))),
			int256(assets[assetId].packedTermsState[103]),
			int256(assets[assetId].packedTermsState[104]),
			int256(assets[assetId].packedTermsState[105]),
			int256(assets[assetId].packedTermsState[106]),
			int256(assets[assetId].packedTermsState[107]),
			int256(assets[assetId].packedTermsState[108]),
			int256(assets[assetId].packedTermsState[109]),
			int256(assets[assetId].packedTermsState[110]),
			ContractRole(uint8(uint256(assets[assetId].packedTermsState[102] >> 240)))
		);
	}
}
