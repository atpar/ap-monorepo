pragma solidity ^0.5.2;
pragma experimental ABIEncoderV2;

import "../../external/BokkyPooBah/BokkyPooBahsDateTimeLibrary.sol";

import "../ACTUSTypes.sol";


/**
 * @title EndOfMonthConvention
 * @notice Implements the ACTUS end of month convention.
 */
contract EndOfMonthConvention is ACTUSTypes {

    /**
     * This function makes an adjustment on the end of month convention.
     * @dev The following is considered to dertermine if schedule dates are shifted to the end of month:
     * - The convention SD (same day) means not adjusting, EM (end of month) means adjusting
     * - Dates are only shifted if the schedule start date is an end-of-month date
     * - Dates are only shifted if the schedule cycle is based on an "M" period unit or multiple thereof
     * @param eomc the end of month convention to adjust
     * @param startTime timestamp of the cycle start
     * @param cycle the cycle struct
     * @return the adjusted end of month convention
     */
    function adjustEndOfMonthConvention(
        EndOfMonthConvention eomc,
        uint256 startTime,
        IPS memory cycle
    )
        public
        pure
        returns (EndOfMonthConvention)
    {
        if (eomc == EndOfMonthConvention.EOM) {
            // check if startTime is last day in month and schedule has month based period
            // otherwise switch to SD convention
            if (
                BokkyPooBahsDateTimeLibrary.getDay(startTime) == BokkyPooBahsDateTimeLibrary.getDaysInMonth(startTime) &&
                (cycle.p == P.M || cycle.p == P.Q || cycle.p == P.H)
            ) {
                return EndOfMonthConvention.EOM;
            }
            return EndOfMonthConvention.SD;
        } else if (eomc == EndOfMonthConvention.SD) {
            return EndOfMonthConvention.SD;
        }
        revert("EndOfMonthConvention.adjustEndOfMonthConvention: ATTRIBUTE_NOT_FOUND.");
    }
}
