pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "./AFPDefinitions.sol";
import "./AFPDayCountConventions.sol";
import "../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

contract AFPCore is AFPDefinitions, AFPDayCountConventions {

	function performanceIndicator(ContractStatus _contractStatus) 
		internal
		pure
		returns(int8)
	{
		if (_contractStatus == ContractStatus.DF) { return 0; }
		return 1;
	}

	function roleSign(ContractRole _contractRole) 
		internal
		pure
		returns(int8)
	{
		if (_contractRole == ContractRole.RPA) { return 1; }
		if (_contractRole == ContractRole.RPL) { return -1; }
		revert("ContractRole attribute not defined");
	}

	function signum(int _value) internal pure returns (int256) {
		if (_value > 0) { 
			return 1;
		} else if (_value < 0) {
			return -1;
		} else {
			return INT256_MIN;
		}
	}

	function riskFactor()
		internal
		pure
		returns(int8)
	{
		return 0;
	}

	function yearFraction(uint256 _dateTimeBegin, uint256 _dateTimeEnd, DayCountConvention _ipdc) 
		internal 
		pure 
		returns(int256) 
	{
		require(_dateTimeEnd >= _dateTimeBegin, "dateTimeEnd has to be >= dateTimeBegin");
		if (_ipdc == DayCountConvention.A_360) {
			return int256(actualThreeSixty(_dateTimeBegin, _dateTimeEnd));
		} else if (_ipdc == DayCountConvention.A_365) {
			return int256(actualThreeSixtyFive(_dateTimeBegin, _dateTimeEnd));
		} else if (_ipdc == DayCountConvention._30E_360) {
			return int256(thirtyEThreeSixty(_dateTimeBegin, _dateTimeEnd));
		} else {
			return 1;
		}
	}

	// function getEventTimeOffset(EventType _eventType)
	// 	private
	// 	pure
	// 	returns(uint256)
	// {
	// 	if (_eventType == EventType.IED) { return 20; }
	// 	if (_eventType == EventType.IP) { return 30; }
	// 	if (_eventType == EventType.IPCI) { return 40; }
	// 	if (_eventType == EventType.FP) { return 50; }
	// 	if (_eventType == EventType.DV) { return 60; }
	// 	if (_eventType == EventType.PR) { return 70; }
	// 	if (_eventType == EventType.MR) { return 80; }
	// 	if (_eventType == EventType.RRY) { return 90; }
	// 	if (_eventType == EventType.RR) { return 100; }
	// 	if (_eventType == EventType.SC) { return 110; }
	// 	if (_eventType == EventType.IPCB) { return 120; }
	// 	if (_eventType == EventType.PRD) { return 130; }
	// 	if (_eventType == EventType.TD) { return 140; }
	// 	if (_eventType == EventType.STD) { return 150; }
	// 	if (_eventType == EventType.MD) { return 160; }
	// 	if (_eventType == EventType.SD) { return 900; }
	// 	if (_eventType == EventType.AD) { return 950; }
	// 	if (_eventType == EventType.Child) { return 10; }
	// 	return 0;
	// }

	function sortContractEventSchedule(
		uint[2][MAX_EVENT_SCHEDULE_SIZE] memory contractEventSchedule, 
		int left, 
		int right
	) 
		internal
		pure
	{
		int i = left;
		int j = right;
		if (i==j || i == 0 || j == 0) return;
		uint pivot = contractEventSchedule[uint(left + (right - left) / 2)][1];
		while (i <= j) {
			while (contractEventSchedule[uint(i)][1] < pivot) i++;
			while (pivot < contractEventSchedule[uint(j)][1]) j--;
			if (i <= j) {
				(
					contractEventSchedule[uint(i)][1], 
					contractEventSchedule[uint(i)][0], 
					contractEventSchedule[uint(j)][1],
					contractEventSchedule[uint(j)][0]
				) = (
					contractEventSchedule[uint(j)][1], 
					contractEventSchedule[uint(j)][0],
					contractEventSchedule[uint(i)][1],
					contractEventSchedule[uint(i)][0]
				);
				i++;
				j--;
			}
		}
		if (left < j)
			sortContractEventSchedule(contractEventSchedule, left, j);
		if (i < right)
			sortContractEventSchedule(contractEventSchedule, i, right);
	}

	/**
	 * checks if a timestamp is in a given period
	 * @dev returns true of timestamp is in period
	 * @param _scheduledTimestamp timestamp to check
	 * @param _startTimestamp start timestamp of the period
	 * @param _endTimestamp end timestamp of the period
	 * @return boolean
	 */
	function isInPeriod(
		uint256 _scheduledTimestamp, 
		uint256 _startTimestamp,
		uint256 _endTimestamp
	)
		internal
		pure
		returns(bool)
	{
		if (_startTimestamp < _scheduledTimestamp && _endTimestamp >= _scheduledTimestamp) { 
			return true; 
		} 
		return false;
	}

	function getTimestampPlusPeriod(IPS memory _cycle, uint256 _timestamp)
		internal
		pure
		returns(uint256)
	{
		uint256 newTimestamp;

		if (_cycle.p == P.D) {
			newTimestamp = BokkyPooBahsDateTimeLibrary.addDays(_timestamp, _cycle.i);
		} else if (_cycle.p == P.W) {
			newTimestamp = BokkyPooBahsDateTimeLibrary.addDays(_timestamp, _cycle.i * 7);
		} else if (_cycle.p == P.M) {
			newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(_timestamp, _cycle.i);
		} else if (_cycle.p == P.Q) {
			newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(_timestamp, _cycle.i * 3);
		} else if (_cycle.p == P.H) {
			newTimestamp = BokkyPooBahsDateTimeLibrary.addMonths(_timestamp, _cycle.i * 6);
		} else if (_cycle.p == P.Y) {
			newTimestamp = BokkyPooBahsDateTimeLibrary.addYears(_timestamp, _cycle.i);
		} else {
			revert("Undefined IPS parameter for p");
		}

		return newTimestamp;
	}

	function computeScheduleSegmentFromCycle(
		uint256 _startTimestamp, 
		uint256 _endTimestamp, 
		IPS memory _cycle, 
		EndOfMonthConvention _eomc,
		bool _addEndTime,
		uint256 _segmentStartTimestamp,
		uint256 _segmentEndTimestamp
	) 
		internal
		pure
		returns(uint256[MAX_CYCLE_SCHEDULE_SIZE] memory)
	{
		uint256[MAX_CYCLE_SCHEDULE_SIZE] memory schedule;
		uint256 index = 0;

		if (_cycle.isSet == false) {
			if (isInPeriod(_startTimestamp, _segmentStartTimestamp, _segmentEndTimestamp)) {
				schedule[index] = _startTimestamp;
				index++;
			}
			if (isInPeriod(_endTimestamp, _segmentStartTimestamp, _segmentEndTimestamp)) {
				if (_addEndTime == true) { schedule[index] = _endTimestamp; }
			}
			return schedule;
		}

		// simplified
		uint256 time = _startTimestamp;
		while((time < _endTimestamp)) {
			if (isInPeriod(time, _segmentStartTimestamp, _segmentEndTimestamp)) {
				require(index < (MAX_CYCLE_SCHEDULE_SIZE - 2), "MAX_CYCLE_SCHEDULE_SIZE reached");
				schedule[index] = time;
				index++;
			}
			time = getTimestampPlusPeriod(_cycle, time);
		}

		if (_addEndTime == true) { 
			if (isInPeriod(_endTimestamp, _segmentStartTimestamp, _segmentEndTimestamp)) {
				schedule[index] = _endTimestamp;
			}
		}

		if (index > 0 && isInPeriod(schedule[index - 1], _segmentStartTimestamp, _segmentEndTimestamp)) {		
			if (_cycle.s == S.LONG && index > 1 && _endTimestamp != time) {
				schedule[index - 1] = schedule[index];
				delete schedule[index];			
			}
		}

		return schedule;
	}

	function computeScheduleFromCycle(
		uint256 _startTimestamp, 
		uint256 _endTimestamp, 
		IPS memory _cycle, 
		EndOfMonthConvention _eomc,
		bool _addEndTime
	) 
		internal
		pure
		returns(uint256[MAX_CYCLE_SCHEDULE_SIZE] memory)
	{
		uint256[MAX_CYCLE_SCHEDULE_SIZE] memory schedule;
		uint256 index = 0;

		if (_cycle.isSet == false) {
			schedule[index] = _startTimestamp;
			index++;
			if (_addEndTime == true) { schedule[index] = _endTimestamp; }
			return schedule;
		}

		// simplified
		uint256 time = _startTimestamp;
		while((time < _endTimestamp)) {
			require(index < (MAX_CYCLE_SCHEDULE_SIZE - 2), "MAX_CYCLE_SCHEDULE_SIZE reached");
			schedule[index] = time;
			index++;
			time = getTimestampPlusPeriod(_cycle, time);
		}

		if (_addEndTime == true) { schedule[index] = _endTimestamp; }

		if (_cycle.s == S.LONG && index > 1 && _endTimestamp != time) {
			schedule[index - 1] = schedule[index];
			delete schedule[index];
		}

		return schedule;
	}

	function createEvent(uint256 _scheduledTime, EventType _eventType, Currency _currency)
		internal 
		pure 
		returns(ContractEvent memory) 
	{
		return ContractEvent({
			// epochOffset: getEventTimeOffset(_eventType), // ?
			scheduledTime: _scheduledTime, 
			eventType: _eventType, 
			currency: _currency, 
			payOff: 0, 
			actualEventTime: 0
		});
	}
}