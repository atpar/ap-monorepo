pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../AFPCore/AFPCore.sol";
import "../AFPCore/AFPFloatMath.sol";


/**
 * todo: implement safemaths add and sub methods for STFs and POFs
 */

/**
 * @title the stateless component for a PAM contract
 * @notice implements the STF and POF of the Actus standard for a PAM contract 
 * @dev all numbers except unix timestamp are represented of multiples of 10 ** 18
	inputs have to be multiplied by 10 ** 18, outputs have to divided by 10 ** 18
 */
contract PAMEngine is AFPCore {

	using AFPFloatMath for int;

	/**
	 * @notice computes the next contract state based on the contract terms, state and the event type
	 * @param _currentTimestamp current timestamp
	 * @param _contractTerms terms of the contract
	 * @param _contractState current state of the contract
	 * @param _eventType event type
	 * @return next contract state
	 */
	function stateTransitionFunction(
		uint256 _currentTimestamp, 
		PAMContractTerms memory _contractTerms, 
		ContractState memory _contractState, 
		EventType _eventType
	) 
		private 
		pure
		returns(ContractState memory) 
	{
		if (_eventType == EventType.AD) { 
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.CD) { 
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.contractStatus = ContractStatus.DF;
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.FP) { 
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.feeAccrued = 0;
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.IED) { 
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalValue = roleSign(_contractTerms.contractRole) * _contractTerms.notionalPrincipal;
			_contractState.nominalRate = _contractTerms.nominalInterestRate;
			_contractState.lastEventTime = _currentTimestamp;

			if (_contractTerms.cycleAnchorDateOfInterestPayment != 0 && 
				_contractTerms.cycleAnchorDateOfInterestPayment < _contractTerms.initialExchangeDate
			) {
				_contractState.nominalAccrued = _contractState.nominalRate
				.floatMult(_contractState.nominalValue)
				.floatMult(yearFraction(_contractTerms.cycleAnchorDateOfInterestPayment, _currentTimestamp, _contractTerms.dayCountConvention));
			}   
			return _contractState;
		}
		if (_eventType == EventType.IPCI) { 
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalAccrued + (_contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent));
			_contractState.nominalAccrued = 0;
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.IP) { 
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued = 0;
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.PP) {
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.nominalValue -= 0; // riskFactor(_contractTerms.objectCodeOfPrepaymentModel, _currentTimestamp, _contractState, _contractTerms) * _contractState.nominalValue;
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.PRD) {
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.PR) {
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalValue = 0;
			_contractState.nominalRate = 0;
			_contractState.nominalAccrued = 0;
			_contractState.feeAccrued = 0;
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.PY) {
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.RRY) {
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.nominalRate = _contractTerms.nextResetRate;
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.RR) {
			// int256 rate = //riskFactor(_contractTerms.marketObjectCodeOfRateReset, _currentTimestamp, _contractState, _contractTerms)
			// 	* _contractTerms.rateMultiplier + _contractTerms.rateSpread;
			int256 rate = _contractTerms.rateSpread;
			int256 deltaRate = rate - _contractState.nominalRate;
			
			 // apply period cap/floor
			if ((_contractTerms.lifeCap < deltaRate) && (_contractTerms.lifeCap < ((-1) * _contractTerms.periodFloor))) {
				deltaRate = _contractTerms.lifeCap;
			} else if (deltaRate < ((-1) * _contractTerms.periodFloor)) {
				deltaRate = ((-1) * _contractTerms.periodFloor);
			}
			rate = _contractState.nominalRate + deltaRate;

			// apply life cap/floor
			if (_contractTerms.lifeCap < rate && _contractTerms.lifeCap < _contractTerms.lifeFloor) {
				rate = _contractTerms.lifeCap;
			} else if (rate < _contractTerms.lifeFloor) {
				rate = _contractTerms.lifeFloor;
			}

			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.nominalRate = rate;
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.SC) {
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalAccrued += _contractState.nominalRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			_contractState.feeAccrued += _contractTerms.feeRate.floatMult(_contractState.nominalValue).floatMult(_contractState.timeFromLastEvent);
			
			if ((_contractTerms.scalingEffect == ScalingEffect.I00) 
				|| (_contractTerms.scalingEffect == ScalingEffect.IN0)
				|| (_contractTerms.scalingEffect == ScalingEffect.I0M)
				|| (_contractTerms.scalingEffect == ScalingEffect.INM)
			) {
				_contractState.interestScalingMultiplier = 0; // riskFactor(_contractTerms.marketObjectCodeOfScalingIndex, _currentTimestamp, _contractState, _contractTerms)
			}
			if ((_contractTerms.scalingEffect == ScalingEffect._0N0) 
				|| (_contractTerms.scalingEffect == ScalingEffect._0NM)
				|| (_contractTerms.scalingEffect == ScalingEffect.IN0)
				|| (_contractTerms.scalingEffect == ScalingEffect.INM)
			) {
				_contractState.nominalScalingMultiplier = 0; // riskFactor(_contractTerms.marketObjectCodeOfScalingIndex, _currentTimestamp, _contractState, _contractTerms)
			}

			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
		if (_eventType == EventType.TD) {
			_contractState.timeFromLastEvent = yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention);
			_contractState.nominalValue = 0;
			_contractState.nominalRate = 0;
			_contractState.nominalAccrued = 0;
			_contractState.feeAccrued = 0;
			_contractState.lastEventTime = _currentTimestamp;
			return _contractState;
		}
	}

	/**
	 * @notice calculates the payOff for the current time based on the contract terms, state and the event type
	 * @param _currentTimestamp current timestamp
	 * @param _contractTerms terms of the contract
	 * @param _contractState current state of the contract
	 * @param _eventType event type
	 * @return payOff
	 */
	function payOffFunction(
		uint256 _currentTimestamp, 
		PAMContractTerms memory _contractTerms, 
		ContractState memory _contractState, 
		EventType _eventType
	)
		private
		pure
		returns(int256 payOff)
	{
		if (_eventType == EventType.AD) { return 0; } 
		if (_eventType == EventType.CD) { return 0; }
		if (_eventType == EventType.IPCI) { return 0; }
		if (_eventType == EventType.RRY) { return 0; }
		if (_eventType == EventType.RR) { return 0; }
		if (_eventType == EventType.SC) { return 0; }
		if (_eventType == EventType.FP) { 
			if (_contractTerms.feeBasis == FeeBasis.A) {
				return (
					performanceIndicator(_contractState.contractStatus) 
					* roleSign(_contractTerms.contractRole) 
					* _contractTerms.feeRate
				); 
			} else {
				return (
					performanceIndicator(_contractState.contractStatus) 
					* (_contractState.feeAccrued 
					+ yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention) 
					.floatMult(_contractTerms.feeRate).floatMult(_contractState.nominalValue))
				); 
			}
		}
		if (_eventType == EventType.IED) { 
			return (
				performanceIndicator(_contractState.contractStatus) 
				* roleSign(_contractTerms.contractRole) * (-1) 
				* (_contractTerms.notionalPrincipal + _contractTerms.premiumDiscountAtIED)
			);
		}
		if (_eventType == EventType.IP) { 
			return (
				performanceIndicator(_contractState.contractStatus) * _contractState.interestScalingMultiplier
				.floatMult(_contractState.nominalAccrued + yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention)
				.floatMult(_contractState.nominalRate).floatMult(_contractState.nominalValue))
			);
		}
		if (_eventType == EventType.PP) { 
			return (
				performanceIndicator(_contractState.contractStatus) 
				* roleSign(_contractTerms.contractRole)
				* 0 // riskFactor(currentTimestamp, _contractState, _contractTerms, _contractTerms.objectCodeOfPrepaymentModel)
				* _contractState.nominalValue
			);
		}
		if (_eventType == EventType.PRD) { 
			return (
				performanceIndicator(_contractState.contractStatus) 
				* roleSign(_contractTerms.contractRole) * (-1) 
				* (_contractTerms.priceAtPurchaseDate
				+ _contractState.nominalAccrued
				+ yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention)
				.floatMult(_contractState.nominalRate).floatMult(_contractState.nominalValue))
			);
		}
		if (_eventType == EventType.PR) { 
			return (
				performanceIndicator(_contractState.contractStatus) 
				* _contractState.nominalScalingMultiplier.floatMult(_contractState.nominalValue)
			);
		}
		if (_eventType == EventType.PY) { 
			if (_contractTerms.penaltyType == PenaltyType.A) {
				return (
					performanceIndicator(_contractState.contractStatus)
					* roleSign(_contractTerms.contractRole)
					* _contractTerms.penaltyRate
				);
			} else if (_contractTerms.penaltyType == PenaltyType.N) {
				return (
					performanceIndicator(_contractState.contractStatus)
					* roleSign(_contractTerms.contractRole)
					* yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention)
					.floatMult(_contractTerms.penaltyRate).floatMult(_contractState.nominalValue)
				);
			} else {
				// riskFactor(currentTimestamp, _contractState, _contractTerms, _contractTerms.marketObjectCodeOfRateReset);
				int256 risk = 0; 
				int256 param = 0;
				if (_contractState.nominalRate - risk > 0) { param = _contractState.nominalRate - risk; }
				return (
					performanceIndicator(_contractState.contractStatus)
					* roleSign(_contractTerms.contractRole)
					* yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention)
					.floatMult(_contractState.nominalValue).floatMult(param)
				);
			}
		}
		if (_eventType == EventType.TD) { 
			return (
				performanceIndicator(_contractState.contractStatus)
				* roleSign(_contractTerms.contractRole)
				* (_contractTerms.priceAtPurchaseDate 
				+ _contractState.nominalAccrued
				+ yearFraction(_contractState.lastEventTime, _currentTimestamp, _contractTerms.dayCountConvention)
				.floatMult(_contractState.nominalRate).floatMult(_contractState.nominalValue))
			);
		}
	}

	/**
	 * @notice computes the schedule for all contract events based on the contract terms
	 * @dev see initEvents()
		 optional: splitting event types into separate functions
	 * @param _contractTerms terms of the contract
	 * @return event schedule
	 */
	function computeContractEventSchedule(PAMContractTerms memory _contractTerms) 
		private 
		pure 
		returns(uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory)
	{

		// [EventTypeIndex, scheduledTime]
		uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory contractEvents;
		uint16 index = 0;
	
		// initial exchange
		contractEvents[index][0] = uint256(EventType.IED);
		contractEvents[index][1] = _contractTerms.initialExchangeDate;
		index++;

		// principal redemption
		contractEvents[index][0] = uint256(EventType.PR);
		contractEvents[index][1] = _contractTerms.maturityDate;
		index++; 

		// purchase
		if (_contractTerms.purchaseDate != 0) {
			contractEvents[index][0] = uint256(EventType.PRD);
			contractEvents[index][1] = _contractTerms.purchaseDate;
			index++; 
		}

		// interest payment related (e.g. for reoccurring interest payments)
		if (_contractTerms.nominalInterestRate != 0 && (
			_contractTerms.cycleOfInterestPayment.isSet == true && _contractTerms.cycleAnchorDateOfInterestPayment != 0)
		) {
			uint256[MAX_CYCLE_SCHEDULE_SIZE] memory interestPaymentSchedule = computeScheduleFromCycle(
				_contractTerms.cycleAnchorDateOfInterestPayment, 
				_contractTerms.maturityDate,
				_contractTerms.cycleOfInterestPayment,
				_contractTerms.endOfMonthConvention,
				true
			);
			for (uint256 i = 0; i < MAX_CYCLE_SCHEDULE_SIZE; i++) {
				if (interestPaymentSchedule[i] != 0) {
					if (_contractTerms.capitalizationEndDate != 0 && interestPaymentSchedule[i] <= _contractTerms.capitalizationEndDate) {
						contractEvents[index][0] = uint256(EventType.IPCI);
						contractEvents[index][1] = interestPaymentSchedule[i];
						index++;
					} else {
						contractEvents[index][0] = uint256(EventType.IP);
						contractEvents[index][1] = interestPaymentSchedule[i];
						index++;
					}
				} else { break; }
			}
		} 
		// capitalization end date
		else if (_contractTerms.capitalizationEndDate != 0) { 
			contractEvents[index][0] = uint256(EventType.IPCI);
			contractEvents[index][1] = _contractTerms.capitalizationEndDate;
			index++;
		}

		// rate reset
		if (_contractTerms.cycleOfRateReset.isSet == true && _contractTerms.cycleAnchorDateOfRateReset != 0) {
			uint256[MAX_CYCLE_SCHEDULE_SIZE] memory rateResetSchedule = computeScheduleFromCycle(
				_contractTerms.cycleAnchorDateOfRateReset, 
				_contractTerms.maturityDate,
				_contractTerms.cycleOfRateReset,
				_contractTerms.endOfMonthConvention,
				false
			);
			for (uint8 i = 0; i < MAX_CYCLE_SCHEDULE_SIZE; i++) {
				if (rateResetSchedule[i] != 0) {
					contractEvents[index][0] = uint256(EventType.RR);
					contractEvents[index][1] = rateResetSchedule[i];
					index++;
				} else { break; }
			}
			// ... nextRateReset
		}

		// fees
		if (_contractTerms.cycleOfFee.isSet == true && _contractTerms.cycleAnchorDateOfFee != 0) {
			uint256[MAX_CYCLE_SCHEDULE_SIZE] memory feeSchedule = computeScheduleFromCycle(
				_contractTerms.cycleAnchorDateOfFee, 
				_contractTerms.maturityDate,
				_contractTerms.cycleOfFee,
				_contractTerms.endOfMonthConvention,
				true
			);
			for (uint8 i = 0; i < MAX_CYCLE_SCHEDULE_SIZE; i++) {
				if (feeSchedule[i] != 0) {
					contractEvents[index][0] = uint256(EventType.FP);
					contractEvents[index][1] = feeSchedule[i];
					index++;
				} else { break; }
			}
		}

		// scaling
		if ((_contractTerms.scalingEffect != ScalingEffect._000 || _contractTerms.scalingEffect != ScalingEffect._00M)
			&& _contractTerms.cycleAnchorDateOfScalingIndex != 0
		) {
			uint256[MAX_CYCLE_SCHEDULE_SIZE] memory scalingSchedule = computeScheduleFromCycle(
				_contractTerms.cycleAnchorDateOfScalingIndex, 
				_contractTerms.maturityDate,
				_contractTerms.cycleOfScalingIndex,
				_contractTerms.endOfMonthConvention,
				true
			);
			for (uint8 i = 0; i < MAX_CYCLE_SCHEDULE_SIZE; i++) {
				if (scalingSchedule[i] != 0) {
					contractEvents[index][0] = uint256(EventType.SC);
					contractEvents[index][1] = scalingSchedule[i];
					index++;
				} else { break; }
			}
		}

		// termination
		if (_contractTerms.terminationDate != 0) {
			contractEvents[index][0] = uint256(EventType.TD);
			contractEvents[index][1] = _contractTerms.terminationDate;
			index++;
		}

		sortContractEventSchedule(contractEvents, int(0), int(contractEvents.length - 1));

		return contractEvents;
	}

	/**
	 * @notice computes a schedule segment for contract events based on the contract terms and the specified period
	 * @param _contractTerms terms of the contract
	 * @param _segmentStartTimestamp start timestamp of the segment
	 * @param _segmentEndTimestamp end timestamp of the segement
	 * @return event schedule segment
	 */
	function computeContractEventScheduleSegment(
		PAMContractTerms memory _contractTerms, 
		uint256 _segmentStartTimestamp,
		uint256 _segmentEndTimestamp
	)
		public 
		pure 
		returns(uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory)
	{
		// [EventTypeIndex, scheduledTime]
		uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory contractEvents;
		uint16 index = 0;
	
		// initial exchange
		if (isInPeriod(_contractTerms.initialExchangeDate, _segmentStartTimestamp, _segmentEndTimestamp)) {
			contractEvents[index][0] = uint256(EventType.IED);
			contractEvents[index][1] = _contractTerms.initialExchangeDate;
			index++;
		}

		// purchase
		if (_contractTerms.purchaseDate != 0) {
			if (isInPeriod(_contractTerms.purchaseDate, _segmentStartTimestamp, _segmentEndTimestamp)) {
				contractEvents[index][0] = uint256(EventType.PRD);
				contractEvents[index][1] = _contractTerms.purchaseDate;
				index++; 
			}
		}

		// interest payment related (e.g. for reoccurring interest payments)
		if (_contractTerms.nominalInterestRate != 0 && (
			_contractTerms.cycleOfInterestPayment.isSet == true && _contractTerms.cycleAnchorDateOfInterestPayment != 0)
		) {
			uint256[MAX_CYCLE_SCHEDULE_SIZE] memory interestPaymentSchedule = computeScheduleSegmentFromCycle(
				_contractTerms.cycleAnchorDateOfInterestPayment, 
				_contractTerms.maturityDate,
				_contractTerms.cycleOfInterestPayment,
				_contractTerms.endOfMonthConvention,
				true,
				_segmentStartTimestamp,
				_segmentEndTimestamp
			);
			for (uint8 i = 0; i < MAX_CYCLE_SCHEDULE_SIZE; i++) {
				if (interestPaymentSchedule[i] != 0) {
					if (isInPeriod(interestPaymentSchedule[i], _segmentStartTimestamp, _segmentEndTimestamp) == false) { continue; }
					if (_contractTerms.capitalizationEndDate != 0 && interestPaymentSchedule[i] <= _contractTerms.capitalizationEndDate) {
						contractEvents[index][0] = uint256(EventType.IPCI);
						contractEvents[index][1] = interestPaymentSchedule[i];
						index++;
					} else {
						contractEvents[index][0] = uint256(EventType.IP);
						contractEvents[index][1] = interestPaymentSchedule[i];
						index++;
					}
				} else { break; }
			}
		} 
		// capitalization end date
		else if (_contractTerms.capitalizationEndDate != 0) { 
			if (isInPeriod(_contractTerms.capitalizationEndDate, _segmentStartTimestamp, _segmentEndTimestamp)) {
				contractEvents[index][0] = uint256(EventType.IPCI);
				contractEvents[index][1] = _contractTerms.capitalizationEndDate;
				index++;
			}
		}

		// rate reset
		if (_contractTerms.cycleOfRateReset.isSet == true && _contractTerms.cycleAnchorDateOfRateReset != 0) {
			uint256[MAX_CYCLE_SCHEDULE_SIZE] memory rateResetSchedule = computeScheduleSegmentFromCycle(
				_contractTerms.cycleAnchorDateOfRateReset, 
				_contractTerms.maturityDate,
				_contractTerms.cycleOfRateReset,
				_contractTerms.endOfMonthConvention,
				false,
				_segmentStartTimestamp,
				_segmentEndTimestamp
			);
			for (uint8 i = 0; i < MAX_CYCLE_SCHEDULE_SIZE; i++) {
				if (rateResetSchedule[i] != 0) {
					if (isInPeriod(rateResetSchedule[i], _segmentStartTimestamp, _segmentEndTimestamp) == false) { continue; }
					contractEvents[index][0] = uint256(EventType.RR);
					contractEvents[index][1] = rateResetSchedule[i];
					index++;
				} else { break; }
			}
			// ... nextRateReset
		}

		// fees
		if (_contractTerms.cycleOfFee.isSet == true && _contractTerms.cycleAnchorDateOfFee != 0) {
			uint256[MAX_CYCLE_SCHEDULE_SIZE] memory feeSchedule = computeScheduleSegmentFromCycle(
				_contractTerms.cycleAnchorDateOfFee, 
				_contractTerms.maturityDate,
				_contractTerms.cycleOfFee,
				_contractTerms.endOfMonthConvention,
				true,
				_segmentStartTimestamp,
				_segmentEndTimestamp
			);
			for (uint8 i = 0; i < MAX_CYCLE_SCHEDULE_SIZE; i++) {
				if (feeSchedule[i] != 0) {
					if (isInPeriod(feeSchedule[i], _segmentStartTimestamp, _segmentEndTimestamp) == false) { continue; }
					contractEvents[index][0] = uint256(EventType.FP);
					contractEvents[index][1] = feeSchedule[i];
					index++;
				} else { break; }
			}
		}

		// scaling
		if ((_contractTerms.scalingEffect != ScalingEffect._000 || _contractTerms.scalingEffect != ScalingEffect._00M)
			&& _contractTerms.cycleAnchorDateOfScalingIndex != 0
		) {
			uint256[MAX_CYCLE_SCHEDULE_SIZE] memory scalingSchedule = computeScheduleSegmentFromCycle(
				_contractTerms.cycleAnchorDateOfScalingIndex, 
				_contractTerms.maturityDate,
				_contractTerms.cycleOfScalingIndex,
				_contractTerms.endOfMonthConvention,
				true,
				_segmentStartTimestamp,
				_segmentEndTimestamp
			);
			for (uint8 i = 0; i < MAX_CYCLE_SCHEDULE_SIZE; i++) {
				if (scalingSchedule[i] != 0) {
					if (isInPeriod(scalingSchedule[i], _segmentStartTimestamp, _segmentEndTimestamp) == false) { continue; }
					contractEvents[index][0] = uint256(EventType.SC);
					contractEvents[index][1] = scalingSchedule[i];
					index++;
				} else { break; }
			}
		}

		// termination
		if (_contractTerms.terminationDate != 0) {
			if (isInPeriod(_contractTerms.terminationDate, _segmentStartTimestamp, _segmentEndTimestamp)) {
				contractEvents[index][0] = uint256(EventType.TD);
				contractEvents[index][1] = _contractTerms.terminationDate;
				index++;
			}
		}

		// principal redemption
		if (isInPeriod(_contractTerms.maturityDate, _segmentStartTimestamp, _segmentEndTimestamp)) {
			contractEvents[index][0] = uint256(EventType.PR);
			contractEvents[index][1] = _contractTerms.maturityDate;
			index++; 
		}

		sortContractEventSchedule(contractEvents, int(0), int(contractEvents.length - 1));	

		return contractEvents;
	}

	/**
	 * @notice initialize contract state space based on the contract terms
	 * @dev see initStateSpace()
	 * @param _contractTerms terms of the contract
	 * @return initial contract state
	 */
	function initializeContractState(PAMContractTerms memory _contractTerms) 
		private 
		pure
		returns(ContractState memory)
	{ 
		ContractState memory contractState;

		contractState.contractStatus = ContractStatus.PF;
		contractState.nominalScalingMultiplier = int256(1 * 10 ** PRECISION);
		contractState.interestScalingMultiplier = int256(1 * 10 ** PRECISION);
		contractState.contractRoleSign = _contractTerms.contractRole;
		contractState.lastEventTime = _contractTerms.statusDate;
		contractState.nominalValue = _contractTerms.notionalPrincipal;
		contractState.nominalRate = _contractTerms.nominalInterestRate;
		contractState.nominalAccrued = _contractTerms.accruedInterest;
		contractState.feeAccrued = _contractTerms.feeAccrued;
		
		return contractState;
	}
		
	/**
	 * @notice get the first contract state and schedule of events
	 * @param _contractTerms terms of the contract
	 * @return initial contract state and the event schedule
	 */
	function initializeContract(PAMContractTerms memory _contractTerms) 
		public 
		pure 
		returns (ContractState memory, uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory)
	{
		ContractState memory contractState = initializeContractState(_contractTerms);
		// uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory contractEventSchedule = computeContractEventSchedule(_contractTerms);
		uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory contractEventSchedule = computeContractEventScheduleSegment(
			_contractTerms, 
			_contractTerms.statusDate, 
			_contractTerms.maturityDate
		);
		return (contractState, contractEventSchedule);
	}
	
	/**
	 * @notice apply an event to the current state of a contract and return the evaluated event and the new contract state
	 * @dev see apply()
	 * @param _contractTerms terms of the contract
	 * @param _contractState current state of the contract
	 * @param _contractEvent event to be evaluated and applied to the contract state
	 * @return the new contract state and the evaluated event
	 */
	function getNextState(
		PAMContractTerms memory _contractTerms, 
		ContractState memory _contractState, 
		ContractEvent memory _contractEvent,
		uint256 _timestamp
	)
		public
		pure
		returns (ContractState memory , ContractEvent memory)
	{
		ContractState memory nextContractState;

		_contractEvent.payOff = payOffFunction(_timestamp, _contractTerms, _contractState, _contractEvent.eventType);
		_contractEvent.actualEventTime = _timestamp;
		nextContractState = stateTransitionFunction(_timestamp, _contractTerms, _contractState, _contractEvent.eventType);

		return (nextContractState, _contractEvent);
	}
		
	/**
	 * @notice computes pending events based on the contract state and 
	 * applys them to the contract state and returns the evaluated events and the new contract state
	 * @dev evaluates all events between the scheduled time of the last executed event and now 
	 * (such that Led < Tev && now >= Tev)
	 * @param _contractTerms terms of the contract
	 * @param _contractState current state of the contract
	 * @return the new contract state and the evaluated event
	 */
	function getNextState(
		PAMContractTerms memory _contractTerms, 
		ContractState memory _contractState, 
		uint256 _timestamp
	)
		public
		pure
		returns (ContractState memory, ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory)
	{
		ContractState memory nextContractState = _contractState;
		ContractEvent[MAX_EVENT_SCHEDULE_SIZE] memory nextContractEvents;
		
		uint256[2][MAX_EVENT_SCHEDULE_SIZE] memory pendingContractEvents = computeContractEventScheduleSegment(
			_contractTerms,
			_contractState.lastEventTime,
			_timestamp
		);

		for (uint8 index = 0; index < MAX_EVENT_SCHEDULE_SIZE; index++) {
			if (pendingContractEvents[index][0] == 0) { continue; }
			nextContractEvents[index] = ContractEvent(
				pendingContractEvents[index][1], 
				EventType(pendingContractEvents[index][0]), 
				Currency.ETH,
				payOffFunction(pendingContractEvents[index][1], _contractTerms, _contractState, EventType(pendingContractEvents[index][0])),
				_timestamp
			);

			nextContractState = stateTransitionFunction(
				pendingContractEvents[index][1], 
				_contractTerms, 
				_contractState, 
				nextContractEvents[index].eventType
			);   
		}

		return (nextContractState, nextContractEvents);
	}
}
