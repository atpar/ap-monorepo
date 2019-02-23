pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "./AFPFloatMath.sol";


contract AFPDayCountConventions {

	using AFPFloatMath for int;
	

	function actualThreeSixty(uint256 _startTime, uint256 _endTime) 
		internal
		pure
		returns(int256)
	{
		return(int256((_endTime - _startTime) / 86400).floatDiv(360));
	}

	function actualThreeSixtyFive(uint256 _startTime, uint256 _endTime) 
		internal
		pure
		returns(int256)
	{
		return(int256((_endTime - _startTime) / 86400).floatDiv(365));
	}

	function thirtyEThreeSixty(uint256 _startTime, uint256 _endTime) 
		internal
		pure
		returns(int256) 
	{
		uint256 d1Day; 
		uint256 d1Month;
		uint256 d1Year;

		uint256 d2Day;
		uint256 d2Month;
		uint256 d2Year;

		(d1Year, d1Month, d1Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(_startTime);
		(d2Year, d2Month, d2Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(_endTime);

		if (d1Day == 31) { 
			d1Day = 30; 
		}
		
		if (d2Day == 31) { 
			d2Day = 30; 
		}

		uint256 delD = d2Day - d1Day;
		uint256 delM = d2Month - d1Month;
		uint256 delY = d2Year - d1Year;

		return (int256(360 * delY + 30 * delM + delD).floatDiv(360));
	}
}