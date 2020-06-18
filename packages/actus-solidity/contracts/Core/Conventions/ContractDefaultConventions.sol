// "SPDX-License-Identifier: Apache-2.0"
pragma solidity ^0.6.10;

import "../ACTUSTypes.sol";


/**
 * @title ContractDefaultConventions
 */
contract ContractDefaultConventions {

    /**
     * @notice Returns the performance indicator for a given performance
     * (used a mutliplier in POFs)
     */
    function performanceIndicator(ContractPerformance contractPerformance)
        internal
        pure
        returns (int8)
    {
        if (contractPerformance == ContractPerformance.DF) return 0;
        return 1;
    }
}