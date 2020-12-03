// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SignedSafeMath.sol";

import "../../Core/Core.sol";


/**
 * @title POF
 * @notice Contains all payoff functions (POFs) currently used by all Engines
 */
contract CECPOF is Core {

    using SignedSafeMath for int;


    /**
     * Calculate the payoff in case of settlement
     * @return the settlement payoff amount for CEG contracts
     */
    function POF_CEC_ST (
        CECTerms memory /* terms */,
        CECState memory state,
        uint256 /* scheduleTime */,
        bytes calldata /* externalData */
    )
        internal
        pure
        returns(int256)
    {
        return state.exerciseAmount.add(state.feeAccrued);
    }
}
