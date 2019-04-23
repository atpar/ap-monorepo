pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;


import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/drafts/SignedSafeMath.sol";
import "../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "./APFloatMath.sol";


contract APDayCountConventions {

	using SafeMath for uint;
	using SignedSafeMath for int;
	using APFloatMath for int;


	function actualThreeSixty(uint256 startTime, uint256 endTime)
		internal
		pure
		returns (int256)
	{
		return (int256((endTime.sub(startTime)).div(86400)).floatDiv(360));
	}

	function actualThreeSixtyFive(uint256 startTime, uint256 endTime)
		internal
		pure
		returns (int256)
	{
		return (int256((endTime.sub(startTime)).div(86400)).floatDiv(365));
	}

	function thirtyEThreeSixty(uint256 startTime, uint256 endTime)
		internal
		pure
		returns (int256)
	{
		uint256 d1Day;
		uint256 d1Month;
		uint256 d1Year;

		uint256 d2Day;
		uint256 d2Month;
		uint256 d2Year;

		(d1Year, d1Month, d1Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(startTime);
		(d2Year, d2Month, d2Day) = BokkyPooBahsDateTimeLibrary.timestampToDate(endTime);

		if (d1Day == 31) {
			d1Day = 30;
		}

		if (d2Day == 31) {
			d2Day = 30;
		}

		int256 delD = int256(d2Day).sub(int256(d1Day));
		int256 delM = int256(d2Month).sub(int256(d1Month));
		int256 delY = int256(d2Year).sub(int256(d1Year));

		return ((delY.mul(360).add(delM.mul(30)).add(delD)).floatDiv(360));
	}
}