// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "../ACTUSTypes.sol";
import "../Conventions/BusinessDayConventions.sol";

import "./EventUtils.sol";
import "./PeriodUtils.sol";
import "./CycleUtils.sol";


/**
 * @title Utils
 * @notice Utility methods used throughout Core and all Engines
 */
contract Utils is BusinessDayConventions, EventUtils, PeriodUtils, CycleUtils {

    /**
     * @notice Returns the event time for a given schedule time
     * @dev For optimization reasons not located in EventUtil
     * by applying the BDC specified in the terms
     */
    function computeEventTimeForEvent(bytes32 _event, BusinessDayConvention bdc, Calendar calendar, uint256 maturityDate)
        public
        pure
        returns (uint256)
    {
        (, uint256 scheduleTime) = decodeEvent(_event);

        // handle maturity date
        return shiftEventTime(scheduleTime, bdc, calendar, maturityDate);
    }
}
