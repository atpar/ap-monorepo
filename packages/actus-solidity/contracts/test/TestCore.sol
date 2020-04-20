pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../Core/Core.sol";


/**
* These helper contracts expose internal functions for unit testing.
*/
contract TestCore is Core {

    function _performanceIndicator(ContractPerformance contractPerformance)
        public
        pure
        returns (int8)
    {
        return performanceIndicator(contractPerformance);
    }

    function _roleSign(ContractRole contractRole)
        public
        pure
        returns (int8)
    {
        return roleSign(contractRole);
    }

    function _yearFraction(
        uint256 startTimestamp,
        uint256 endTimestamp,
        DayCountConvention ipdc,
        uint256 maturityDate
    )
        public
        pure
        returns (int256)
    {
        return yearFraction(startTimestamp, endTimestamp, ipdc, maturityDate);
    }

    function _isInSegment(
        uint256 timestamp,
        uint256 startTimestamp,
        uint256 endTimestamp
    )
        public
        pure
        returns (bool)
    {
        return isInSegment(timestamp, startTimestamp, endTimestamp);
    }

    function _getTimestampPlusPeriod(IP memory period, uint256 timestamp)
        public
        pure
        returns (uint256)
    {
        return getTimestampPlusPeriod(period, timestamp);
    }

    function _getNextCycleDate(IPS memory cycle, uint256 cycleStart, uint256 cycleIndex)
        public
        pure
        returns (uint256)
    {
        return getNextCycleDate(cycle, cycleStart, cycleIndex);
    }

    function _computeDatesFromCycleSegment(
        uint256 cycleStart,
        uint256 cycleEnd,
        IPS memory cycle,
        bool addEndTime,
        uint256 segmentStart,
        uint256 segmentEnd
    )
        public
        pure
        returns (uint256[MAX_CYCLE_SIZE] memory)
    {
        return computeDatesFromCycleSegment(cycleStart, cycleEnd, cycle, addEndTime, segmentStart, segmentEnd);
    }
}
