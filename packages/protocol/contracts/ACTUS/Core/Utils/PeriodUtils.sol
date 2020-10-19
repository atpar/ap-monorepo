// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.11;
pragma experimental ABIEncoderV2;

import {SafeMath as SafeMul} from "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../../../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "../ACTUSTypes.sol";

/**
 * @title PeriodUtils
 * @notice Utility methods for dealing with Periods
 */
contract PeriodUtils {

    using BokkyPooBahsDateTimeLibrary for uint;
    using SafeMul for uint;

    /**
     * @notice Applies a period in IP notation to a given timestamp
     */
    function getTimestampPlusPeriod(IP memory period, uint256 timestamp)
        internal
        pure
        returns (uint256)
    {
        uint256 newTimestamp;

        if (period.p == P.D) {
            newTimestamp = timestamp.addDays(period.i);
        } else if (period.p == P.W) {
            newTimestamp = timestamp.addDays(period.i.mul(7));
        } else if (period.p == P.M) {
            newTimestamp = timestamp.addMonths(period.i);
        } else if (period.p == P.Q) {
            newTimestamp = timestamp.addMonths(period.i.mul(3));
        } else if (period.p == P.H) {
            newTimestamp = timestamp.addMonths(period.i.mul(6));
        } else if (period.p == P.Y) {
            newTimestamp = timestamp.addYears(period.i);
        } else {
            revert("PeriodUtils.getTimestampPlusPeriod: ATTRIBUTE_NOT_FOUND");
        }

        return newTimestamp;
    }
}
