pragma solidity ^0.6.4;
pragma experimental ABIEncoderV2;

import "../../Core/Core.sol";


/**
 * @title POF
 * @notice Contains all payoff functions (POFs) currently used by all Engines
 */
contract CECPOF is Core {

    /**
     * Calculate the payoff in case of settlement
     * @return the settlement payoff amount for CEG contracts
     */
    function POF_CEC_STD (
        CECTerms memory /* terms */,
        State memory state,
        uint256 /* scheduleTime */,
        bytes32 /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return state.exerciseAmount + state.feeAccrued;
    }

    function _yearFraction_POF (
        CECTerms memory terms,
        State memory state,
        uint256 scheduleTime
    )
        private
        pure
        returns(int256)
    {
        return yearFraction(
            shiftCalcTime(state.statusDate, terms.businessDayConvention, terms.calendar, terms.maturityDate),
            shiftCalcTime(scheduleTime, terms.businessDayConvention, terms.calendar, terms.maturityDate),
            terms.dayCountConvention,
            terms.maturityDate
        );
    }
}