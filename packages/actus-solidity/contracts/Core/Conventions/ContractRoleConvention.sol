pragma solidity ^0.5.2;

import "../ACTUSTypes.sol";


/**
 * @title ContractRoleConvention
 */
contract ContractRoleConvention is ACTUSTypes {

    /**
     * Returns the role sign for a given Contract Role.
     */
    function roleSign(ContractRole contractRole)
        internal
        pure
        returns (int8)
    {
        if (contractRole == ContractRole.RPA) return 1;
        if (contractRole == ContractRole.RPL) return -1;

        if (contractRole == ContractRole.BUY) return 1;
        if (contractRole == ContractRole.SEL) return -1;

        if (contractRole == ContractRole.RFL) return 1;
        if (contractRole == ContractRole.PFL) return -1;

        revert("ContractRoleConvention.roleSign: ATTRIBUTE_NOT_FOUND");
    }
}
