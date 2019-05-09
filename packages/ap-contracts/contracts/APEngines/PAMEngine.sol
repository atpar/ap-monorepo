pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/drafts/SignedSafeMath.sol";

import "../APCore/APCore.sol";
import "../APCore/APFloatMath.sol";
import "./IEngine.sol";


/**
 * @title the stateless component for a PAM contract
 * implements the STF and POF of the Actus standard for a PAM contract
 * @dev all numbers except unix timestamp are represented as multiple of 10 ** 18
 * inputs have to be multiplied by 10 ** 18, outputs have to divided by 10 ** 18
 */
contract PAMEngine is APCore, IEngine {

	using SafeMath for uint;
	using SignedSafeMath for int;
	using APFloatMath for int;


	/**
	 * get the initial contract state
	 * @param contractTerms terms of the contract
	 * @return initial contract state
	 */
	function computeInitialState(ContractTerms memory contractTerms)
		public
		pure
		returns (ContractState memory)
	{
		ContractState memory contractState = initializeContractState(contractTerms);

		return (contractState);
	}

	/**
	 * computes pending events based on the contract state and
	 * applys them to the contract state and returns the evaluated events and the new contract state
	 * @dev evaluates all events between the scheduled time of the last executed event and now
	 * (such that Led < Tev && now >= Tev)
	 * @param contractTerms terms of the contract
	 * @param contractState current state of the contract
	 * @param timestamp current timestamp
	 * @return the new contract state and the evaluated events
	 */
	function computeNextState(
		ContractTerms memory contractTerms,
		ContractState memory contractState,
		uint256 timestamp
	)
		public
		pure
		returns (ContractState memory, ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory)
	{
		ContractState memory nextContractState = contractState;
		ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory nextContractEvents;

		ProtoEvent[MAX_EVENT_SCHEDULE_SIZE] memory pendingProtoEventSchedule = computeProtoEventScheduleSegment(
			contractTerms,
			contractState.lastEventTime,
			timestamp
		);

		for (uint8 index = 0; index < MAX_EVENT_SCHEDULE_SIZE; index++) {
			if (pendingProtoEventSchedule[index].scheduledTime == 0) { continue; }

			nextContractEvents[index] = ContractEvent(
				pendingProtoEventSchedule[index].scheduledTime,
				pendingProtoEventSchedule[index].eventType,
				pendingProtoEventSchedule[index].currency,
				payoffFunction(
					pendingProtoEventSchedule[index].scheduledTime,
					contractTerms,
					contractState,
					pendingProtoEventSchedule[index].eventType
				),
				timestamp
			);

			nextContractState = stateTransitionFunction(
				pendingProtoEventSchedule[index].scheduledTime,
				contractTerms,
				contractState,
				pendingProtoEventSchedule[index].eventType
			);
		}

		return (nextContractState, nextContractEvents);
	}

	/**
	 * applys a prototype event to the current state of a contract and
	 * returns the contrat event and the new contract state
	 * @param contractTerms terms of the contract
	 * @param contractState current state of the contract
	 * @param protoEvent prototype event to be evaluated and applied to the contract state
	 * @param timestamp current timestamp
	 * @return the new contract state and the evaluated event
	 */
	function computeNextStateForProtoEvent(
		ContractTerms memory contractTerms,
		ContractState memory contractState,
		ProtoEvent memory protoEvent,
		uint256 timestamp
	)
		public
		pure
		returns (ContractState memory, ContractEvent memory)
	{
		ContractEvent memory contractEvent = ContractEvent(
			protoEvent.scheduledTime,
			protoEvent.eventType,
			protoEvent.currency,
			payoffFunction(timestamp, contractTerms, contractState, protoEvent.pofType), // solium-disable-line
			timestamp
		);

		ContractState memory nextContractState = stateTransitionFunction(
			timestamp,
			contractTerms,
			contractState,
			protoEvent.stfType
		);

		return (nextContractState, contractEvent);
	}

	/**
	 * computes a schedule segment of contract events based on the contract terms and the specified period
	 * @param contractTerms terms of the contract
	 * @param segmentStart start timestamp of the segment
	 * @param segmentEnd end timestamp of the segement
	 * @return event schedule segment
	 */
	function computeProtoEventScheduleSegment(
		ContractTerms memory contractTerms,
		uint256 segmentStart,
		uint256 segmentEnd
	)
		public
		pure
		returns (ProtoEvent[MAX_EVENT_SCHEDULE_SIZE] memory)
	{
		ProtoEvent[MAX_EVENT_SCHEDULE_SIZE] memory protoEventSchedule;
		uint16 index = 0;

		// initial exchange
		if (isInPeriod(contractTerms.initialExchangeDate, segmentStart, segmentEnd)) {
			protoEventSchedule[index] = ProtoEvent(
				contractTerms.initialExchangeDate,
				contractTerms.initialExchangeDate.add(getEpochOffset(EventType.IED)),
				EventType.IED,
				contractTerms.currency,
				EventType.IED,
				EventType.IED
			);
			index++;
		}

		// purchase
		if (contractTerms.purchaseDate != 0) {
			if (isInPeriod(contractTerms.purchaseDate, segmentStart, segmentEnd)) {
				protoEventSchedule[index] = ProtoEvent(
					contractTerms.purchaseDate,
					contractTerms.purchaseDate.add(getEpochOffset(EventType.PRD)),
					EventType.PRD,
					contractTerms.currency,
					EventType.PRD,
					EventType.PRD
				);
				index++;
			}
		}

		// interest payment related (e.g. for reoccurring interest payments)
		if (contractTerms.nominalInterestRate != 0 && (
			contractTerms.cycleOfInterestPayment.isSet == true && contractTerms.cycleAnchorDateOfInterestPayment != 0)
		) {
			uint256[MAX_CYCLE_SIZE] memory interestPaymentSchedule = computeDatesFromCycleSegment(
				contractTerms.cycleAnchorDateOfInterestPayment,
				contractTerms.maturityDate,
				contractTerms.cycleOfInterestPayment,
				contractTerms.endOfMonthConvention,
				true,
				segmentStart,
				segmentEnd
			);
			for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
				if (interestPaymentSchedule[i] != 0) {
					if (isInPeriod(interestPaymentSchedule[i], segmentStart, segmentEnd) == false) { continue; }
					if (contractTerms.capitalizationEndDate != 0 && interestPaymentSchedule[i] <= contractTerms.capitalizationEndDate) {
						protoEventSchedule[index] = ProtoEvent(
							interestPaymentSchedule[i],
							interestPaymentSchedule[i].add(getEpochOffset(EventType.IPCI)),
							EventType.IPCI,
							contractTerms.currency,
							EventType.IPCI,
							EventType.IPCI
						);
						index++;
					} else {
						protoEventSchedule[index] = ProtoEvent(
							interestPaymentSchedule[i],
							interestPaymentSchedule[i].add(getEpochOffset(EventType.IP)),
							EventType.IP,
							contractTerms.currency,
							EventType.IP,
							EventType.IP
						);
						index++;
					}
				} else { break; }
			}
		}
		// capitalization end date
		else if (contractTerms.capitalizationEndDate != 0) {
			if (isInPeriod(contractTerms.capitalizationEndDate, segmentStart, segmentEnd)) {
				protoEventSchedule[index] = ProtoEvent(
					contractTerms.capitalizationEndDate,
					contractTerms.capitalizationEndDate.add(getEpochOffset(EventType.IPCI)),
					EventType.IPCI,
					contractTerms.currency,
					EventType.IPCI,
					EventType.IPCI
				);
				index++;
			}
		}

		// rate reset
		if (contractTerms.cycleOfRateReset.isSet == true && contractTerms.cycleAnchorDateOfRateReset != 0) {
			uint256[MAX_CYCLE_SIZE] memory rateResetSchedule = computeDatesFromCycleSegment(
				contractTerms.cycleAnchorDateOfRateReset,
				contractTerms.maturityDate,
				contractTerms.cycleOfRateReset,
				contractTerms.endOfMonthConvention,
				false,
				segmentStart,
				segmentEnd
			);
			for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
				if (rateResetSchedule[i] != 0) {
					if (isInPeriod(rateResetSchedule[i], segmentStart, segmentEnd) == false) { continue; }
					protoEventSchedule[index] = ProtoEvent(
						rateResetSchedule[i],
						rateResetSchedule[i].add(getEpochOffset(EventType.RR)),
						EventType.RR,
						contractTerms.currency,
						EventType.RR,
						EventType.RR
					);
					index++;
				} else { break; }
			}
			// ... nextRateReset
		}

		// fees
		if (contractTerms.cycleOfFee.isSet == true && contractTerms.cycleAnchorDateOfFee != 0) {
			uint256[MAX_CYCLE_SIZE] memory feeSchedule = computeDatesFromCycleSegment(
				contractTerms.cycleAnchorDateOfFee,
				contractTerms.maturityDate,
				contractTerms.cycleOfFee,
				contractTerms.endOfMonthConvention,
				true,
				segmentStart,
				segmentEnd
			);
			for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
				if (feeSchedule[i] != 0) {
					if (isInPeriod(feeSchedule[i], segmentStart, segmentEnd) == false) { continue; }
					protoEventSchedule[index] = ProtoEvent(
						feeSchedule[i],
						feeSchedule[i].add(getEpochOffset(EventType.FP)),
						EventType.FP,
						contractTerms.currency,
						EventType.FP,
						EventType.FP
					);
					index++;
				} else { break; }
			}
		}

		// scaling
		if ((contractTerms.scalingEffect != ScalingEffect._000 || contractTerms.scalingEffect != ScalingEffect._00M)
			&& contractTerms.cycleAnchorDateOfScalingIndex != 0
		) {
			uint256[MAX_CYCLE_SIZE] memory scalingSchedule = computeDatesFromCycleSegment(
				contractTerms.cycleAnchorDateOfScalingIndex,
				contractTerms.maturityDate,
				contractTerms.cycleOfScalingIndex,
				contractTerms.endOfMonthConvention,
				true,
				segmentStart,
				segmentEnd
			);
			for (uint8 i = 0; i < MAX_CYCLE_SIZE; i++) {
				if (scalingSchedule[i] != 0) {
					if (isInPeriod(scalingSchedule[i], segmentStart, segmentEnd) == false) { continue; }
					protoEventSchedule[index] = ProtoEvent(
						scalingSchedule[i],
						scalingSchedule[i].add(getEpochOffset(EventType.SC)),
						EventType.SC,
						contractTerms.currency,
						EventType.SC,
						EventType.SC
					);
					index++;
				} else { break; }
			}
		}

		// termination
		if (contractTerms.terminationDate != 0) {
			if (isInPeriod(contractTerms.terminationDate, segmentStart, segmentEnd)) {
				protoEventSchedule[index] = ProtoEvent(
					contractTerms.terminationDate,
					contractTerms.terminationDate.add(getEpochOffset(EventType.TD)),
					EventType.TD,
					contractTerms.currency,
					EventType.TD,
					EventType.TD
				);
				index++;
			}
		}

		// principal redemption
		if (isInPeriod(contractTerms.maturityDate, segmentStart, segmentEnd)) {
			protoEventSchedule[index] = ProtoEvent(
				contractTerms.maturityDate,
				contractTerms.maturityDate.add(getEpochOffset(EventType.PR)),
				EventType.PR,
				contractTerms.currency,
				EventType.PR,
				EventType.PR
			);
			index++;
		}

		sortProtoEventSchedule(protoEventSchedule, int(0), int(protoEventSchedule.length - 1));

		return protoEventSchedule;
	}

	/**
	 * initialize contract state space based on the contract terms
	 * @dev see initStateSpace()
	 * @param contractTerms terms of the contract
	 * @return initial contract state
	 */
	function initializeContractState(ContractTerms memory contractTerms)
		private
		pure
		returns (ContractState memory)
	{
		ContractState memory contractState;

		contractState.contractStatus = ContractStatus.PF;
		contractState.nominalScalingMultiplier = int256(1 * 10 ** PRECISION);
		contractState.interestScalingMultiplier = int256(1 * 10 ** PRECISION);
		contractState.contractRoleSign = contractTerms.contractRole;
		contractState.lastEventTime = contractTerms.statusDate;
		contractState.nominalValue = contractTerms.notionalPrincipal;
		contractState.nominalRate = contractTerms.nominalInterestRate;
		contractState.nominalAccrued = contractTerms.accruedInterest;
		contractState.feeAccrued = contractTerms.feeAccrued;

		return contractState;
	}

	/**
	 * computes the next contract state based on the contract terms, state and the event type
	 * @param timestamp current timestamp
	 * @param contractTerms terms of the contract
	 * @param contractState current state of the contract
	 * @param eventType event type
	 * @return next contract state
	 */
	function stateTransitionFunction(
		uint256 timestamp,
		ContractTerms memory contractTerms,
		ContractState memory contractState,
		EventType eventType
	)
		private
		pure
		returns (ContractState memory)
	{
		if (eventType == EventType.AD) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.CD) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.contractStatus = ContractStatus.DF;
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.FP) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.feeAccrued = 0;
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.IED) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalValue = roleSign(contractTerms.contractRole) * contractTerms.notionalPrincipal;
			contractState.nominalRate = contractTerms.nominalInterestRate;
			contractState.lastEventTime = timestamp;

			if (contractTerms.cycleAnchorDateOfInterestPayment != 0 &&
				contractTerms.cycleAnchorDateOfInterestPayment < contractTerms.initialExchangeDate
			) {
				contractState.nominalAccrued = contractState.nominalRate
				.floatMult(contractState.nominalValue)
				.floatMult(yearFraction(contractTerms.cycleAnchorDateOfInterestPayment, timestamp, contractTerms.dayCountConvention));
			}
			return contractState;
		}
		if (eventType == EventType.IPCI) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent)));
			contractState.nominalAccrued = 0;
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.IP) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = 0;
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.PP) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.nominalValue -= 0; // riskFactor(contractTerms.objectCodeOfPrepaymentModel, timestamp, contractState, contractTerms) * contractState.nominalValue;
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.PRD) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.PR) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalValue = 0;
			contractState.nominalRate = 0;
			contractState.nominalAccrued = 0;
			contractState.feeAccrued = 0;
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.PY) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.RRY) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.nominalRate = contractTerms.nextResetRate;
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.RR) {
			// int256 rate = //riskFactor(contractTerms.marketObjectCodeOfRateReset, timestamp, contractState, contractTerms)
			// 	* contractTerms.rateMultiplier + contractTerms.rateSpread;
			int256 rate = contractTerms.rateSpread;
			int256 deltaRate = rate.sub(contractState.nominalRate);

			 // apply period cap/floor
			if ((contractTerms.lifeCap < deltaRate) && (contractTerms.lifeCap < ((-1) * contractTerms.periodFloor))) {
				deltaRate = contractTerms.lifeCap;
			} else if (deltaRate < ((-1) * contractTerms.periodFloor)) {
				deltaRate = ((-1) * contractTerms.periodFloor);
			}
			rate = contractState.nominalRate.add(deltaRate);

			// apply life cap/floor
			if (contractTerms.lifeCap < rate && contractTerms.lifeCap < contractTerms.lifeFloor) {
				rate = contractTerms.lifeCap;
			} else if (rate < contractTerms.lifeFloor) {
				rate = contractTerms.lifeFloor;
			}

			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.nominalRate = rate;
			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.SC) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalAccrued = contractState.nominalAccrued.add(contractState.nominalRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));
			contractState.feeAccrued = contractState.feeAccrued.add(contractTerms.feeRate.floatMult(contractState.nominalValue).floatMult(contractState.timeFromLastEvent));

			if ((contractTerms.scalingEffect == ScalingEffect.I00)
				|| (contractTerms.scalingEffect == ScalingEffect.IN0)
				|| (contractTerms.scalingEffect == ScalingEffect.I0M)
				|| (contractTerms.scalingEffect == ScalingEffect.INM)
			) {
				contractState.interestScalingMultiplier = 0; // riskFactor(contractTerms.marketObjectCodeOfScalingIndex, timestamp, contractState, contractTerms)
			}
			if ((contractTerms.scalingEffect == ScalingEffect._0N0)
				|| (contractTerms.scalingEffect == ScalingEffect._0NM)
				|| (contractTerms.scalingEffect == ScalingEffect.IN0)
				|| (contractTerms.scalingEffect == ScalingEffect.INM)
			) {
				contractState.nominalScalingMultiplier = 0; // riskFactor(contractTerms.marketObjectCodeOfScalingIndex, timestamp, contractState, contractTerms)
			}

			contractState.lastEventTime = timestamp;
			return contractState;
		}
		if (eventType == EventType.TD) {
			contractState.timeFromLastEvent = yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention);
			contractState.nominalValue = 0;
			contractState.nominalRate = 0;
			contractState.nominalAccrued = 0;
			contractState.feeAccrued = 0;
			contractState.lastEventTime = timestamp;
			return contractState;
		}
	}

	/**
	 * calculates the payoff for the current time based on the contract terms,
	 * state and the event type
	 * @param timestamp current timestamp
	 * @param contractTerms terms of the contract
	 * @param contractState current state of the contract
	 * @param eventType event type
	 * @return payoff
	 */
	function payoffFunction(
		uint256 timestamp,
		ContractTerms memory contractTerms,
		ContractState memory contractState,
		EventType eventType
	)
		private
		pure
		returns (int256 payoff)
	{
		if (eventType == EventType.AD) { return 0; }
		if (eventType == EventType.CD) { return 0; }
		if (eventType == EventType.IPCI) { return 0; }
		if (eventType == EventType.RRY) { return 0; }
		if (eventType == EventType.RR) { return 0; }
		if (eventType == EventType.SC) { return 0; }
		if (eventType == EventType.FP) {
			if (contractTerms.feeBasis == FeeBasis.A) {
				return (
					performanceIndicator(contractState.contractStatus)
					* roleSign(contractTerms.contractRole)
					* contractTerms.feeRate
				);
			} else {
				return (
					performanceIndicator(contractState.contractStatus)
					* contractState.feeAccrued
						.add(
							yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention)
							.floatMult(contractTerms.feeRate)
							.floatMult(contractState.nominalValue)
						)
				);
			}
		}
		if (eventType == EventType.IED) {
			return (
				performanceIndicator(contractState.contractStatus)
				* roleSign(contractTerms.contractRole)
				* (-1)
				* contractTerms.notionalPrincipal
					.add(contractTerms.premiumDiscountAtIED)
			);
		}
		if (eventType == EventType.IP) {
			return (
				performanceIndicator(contractState.contractStatus)
				* contractState.interestScalingMultiplier
					.floatMult(
						contractState.nominalAccrued
						.add(
							yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention)
							.floatMult(contractState.nominalRate)
							.floatMult(contractState.nominalValue)
						)
					)
			);
		}
		if (eventType == EventType.PP) {
			return (
				performanceIndicator(contractState.contractStatus)
				* roleSign(contractTerms.contractRole)
				* 0 // riskFactor(timestamp, contractState, contractTerms, contractTerms.objectCodeOfPrepaymentModel)
				* contractState.nominalValue
			);
		}
		if (eventType == EventType.PRD) {
			return (
				performanceIndicator(contractState.contractStatus)
				* roleSign(contractTerms.contractRole)
				* (-1)
				* contractTerms.priceAtPurchaseDate
					.add(contractState.nominalAccrued)
					.add(
						yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention)
						.floatMult(contractState.nominalRate)
						.floatMult(contractState.nominalValue)
					)
			);
		}
		if (eventType == EventType.PR) {
			return (
				performanceIndicator(contractState.contractStatus)
				* contractState.nominalScalingMultiplier
					.floatMult(contractState.nominalValue)
			);
		}
		if (eventType == EventType.PY) {
			if (contractTerms.penaltyType == PenaltyType.A) {
				return (
					performanceIndicator(contractState.contractStatus)
					* roleSign(contractTerms.contractRole)
					* contractTerms.penaltyRate
				);
			} else if (contractTerms.penaltyType == PenaltyType.N) {
				return (
					performanceIndicator(contractState.contractStatus)
					* roleSign(contractTerms.contractRole)
					* yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention)
						.floatMult(contractTerms.penaltyRate)
						.floatMult(contractState.nominalValue)
				);
			} else {
				// riskFactor(timestamp, contractState, contractTerms, contractTerms.marketObjectCodeOfRateReset);
				int256 risk = 0;
				int256 param = 0;
				if (contractState.nominalRate - risk > 0) { param = contractState.nominalRate - risk; }
				return (
					performanceIndicator(contractState.contractStatus)
					* roleSign(contractTerms.contractRole)
					* yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention)
						.floatMult(contractState.nominalValue)
						.floatMult(param)
				);
			}
		}
		if (eventType == EventType.TD) {
			return (
				performanceIndicator(contractState.contractStatus)
				* roleSign(contractTerms.contractRole)
				* contractTerms.priceAtPurchaseDate
					.add(contractState.nominalAccrued)
					.add(
						yearFraction(contractState.lastEventTime, timestamp, contractTerms.dayCountConvention)
						.floatMult(contractState.nominalRate)
						.floatMult(contractState.nominalValue)
					)
			);
		}
	}
}
