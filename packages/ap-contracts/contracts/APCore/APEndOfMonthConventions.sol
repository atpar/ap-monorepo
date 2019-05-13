pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "./APDefinitions.sol";


contract APEndOfMonthConventions is APDefinitions {

	function getEndOfMonthConvention(
		EndOfMonthConvention eomc,
		uint256 startTime,
		IPS memory cycle
	)
		public
		pure
		returns (EndOfMonthConvention)
	{
		if (eomc == EndOfMonthConvention.EOM) {
			if (
				BokkyPooBahsDateTimeLibrary.getDay(startTime) == BokkyPooBahsDateTimeLibrary.getDaysInMonth(startTime) &&
				cycle.p == P.M
			) {
				return EndOfMonthConvention.EOM;
			}
			return EndOfMonthConvention.SD;
		} else if (eomc == EndOfMonthConvention.SD) {
			return EndOfMonthConvention.SD;
		}
		revert("APEndOfMonthConvention.getEndOfMonthConvention: ATTRIBUTE_NOT_FOUND");
	}

	function shiftEndOfMonth(uint256 timestamp)
	  internal
	  pure
	  returns (uint256)
	{
		uint256 year;
		uint256 month;
		uint256 day;
		(year, month, day) = BokkyPooBahsDateTimeLibrary.timestampToDate(timestamp);
		uint256 lastDayOfMonth = BokkyPooBahsDateTimeLibrary._getDaysInMonth(year, month);

		return BokkyPooBahsDateTimeLibrary.timestampFromDate(year, month, lastDayOfMonth);
	}

	function shiftSameDay(uint256 timestamp)
	  internal
	  pure
	  returns (uint256)
	{
		return timestamp;
	}
}
