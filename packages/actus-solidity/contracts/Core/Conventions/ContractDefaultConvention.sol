pragma solidity ^0.5.2;

import "../ACTUSTypes.sol";


/**
 * @title ContractDefaultConvention
 */
contract ContractDefaultConvention is ACTUSTypes {

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